import { randomUUID } from 'node:crypto';
import { NotFoundError } from './errors';
import { Task, TaskInput } from './types';

export class TaskRepository {
    private tasks: Task[] = [];

    findAll(): Task[] {
        return [...this.tasks];
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