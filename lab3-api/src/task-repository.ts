import { randomUUID } from 'node:crypto';
import { decodeCursor, encodeCursor } from './cursor';
import { NotFoundError, ValidationError } from './errors';
import { Page, PaginationQuery, Task, TaskInput } from './types';

export class TaskRepository {
    private tasks: Task[] = [];

    findAll(): Task[] {
        return [...this.tasks];
    }

    /**
     * Returns a page of tasks sorted by creation date, newest first.
     * @param query - The validated `limit` and optional `cursor` describing the requested page.
     * @returns The page of tasks together with the cursor for the following page.
     * @throws ValidationError When the cursor is malformed or no longer refers to an existing task.
     */
    findPage({ limit, cursor }: PaginationQuery): Page<Task> {
        // Reversing first makes the stable sort return the most recently created task
        // first when several tasks share the same createdAt timestamp.
        const sorted = [...this.tasks].reverse().sort(
            (first, second) => second.createdAt.getTime() - first.createdAt.getTime(),
        );

        let startIndex = 0;
        if (cursor !== undefined) {
            const cursorId = decodeCursor(cursor);
            const cursorIndex = sorted.findIndex((task) => task.id === cursorId);
            if (cursorIndex === -1) {
                throw new ValidationError(['cursor does not refer to an existing task']);
            }
            startIndex = cursorIndex + 1;
        }

        const data = sorted.slice(startIndex, startIndex + limit);
        const hasMore = startIndex + data.length < sorted.length;
        const lastTask = data[data.length - 1];

        return {
            data,
            nextCursor: hasMore && lastTask ? encodeCursor(lastTask.id) : null,
            hasMore,
        };
    }

    findById(id: string): Task {
        const task = this.tasks.find((candidate) => candidate.id === id);
        if (!task) {
            throw new NotFoundError(`Task '${id}' was not found`);
        }
        return task;
    }

    create(input: TaskInput): Task {
        const now = new Date();
        const task: Task = {
            id: randomUUID(),
            ...input,
            createdAt: now,
            updatedAt: now,
        };
        this.tasks.push(task);
        return task;
    }

    update(id: string, input: TaskInput): Task {
        const task = this.findById(id);
        Object.assign(task, input, { updatedAt: new Date() });
        return task;
    }

    delete(id: string): void {
        const index = this.tasks.findIndex((task) => task.id === id);
        if (index === -1) {
            throw new NotFoundError(`Task '${id}' was not found`);
        }
        this.tasks.splice(index, 1);
    }
}