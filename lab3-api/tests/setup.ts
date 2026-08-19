import request, { Response } from 'supertest';
import { app } from '../src/app';
import { TaskInput } from '../src/types';

/** Supertest client bound directly to the Express application. */
export const api = request(app);

/** A complete valid payload suitable for task creation and replacement requests. */
export const validTaskInput: TaskInput = {
    title: 'Write API tests',
    description: 'Cover the task management endpoints',
    status: 'todo',
};

/**
 * Creates a task through the public API using valid defaults.
 * @param overrides - Task fields that should replace the default test values.
 * @returns The Supertest response from `POST /tasks`.
 * @example
 * const response = await createTask({ status: 'done' });
 */
export async function createTask(overrides: Partial<TaskInput> = {}): Promise<Response> {
    return api.post('/tasks').send({ ...validTaskInput, ...overrides });
}

async function clearTasks(): Promise<void> {
    const listResponse = await api.get('/tasks');
    expect(listResponse.status).toBe(200);

    const existingTasks = listResponse.body as Array<{ id: string }>;
    const deleteResponses = await Promise.all(
        existingTasks.map((task) => api.delete(`/tasks/${task.id}`)),
    );

    deleteResponses.forEach((response) => {
        expect(response.status).toBe(204);
    });
}

const requestLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

beforeEach(async () => {
    await clearTasks();
});

afterAll(() => {
    requestLogSpy.mockRestore();
});