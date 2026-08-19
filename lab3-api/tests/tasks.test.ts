import { randomUUID } from 'node:crypto';
import { api, createTask, validTaskInput } from './setup';

describe('task API happy paths', () => {
    it('GET /tasks returns the task collection with 200', async () => {
        const firstTask = await createTask({ title: 'First task' });
        const secondTask = await createTask({ title: 'Second task', status: 'in-progress' });

        const response = await api.get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            data: [secondTask.body, firstTask.body],
            nextCursor: null,
            hasMore: false,
        });
    });

    it('POST /tasks creates and returns a task with 201', async () => {
        const response = await createTask();

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            ),
            ...validTaskInput,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
        expect(response.body.updatedAt).toBe(response.body.createdAt);
    });

    it('GET /tasks/:id returns a single task with 200', async () => {
        const created = await createTask();

        const response = await api.get(`/tasks/${created.body.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(created.body);
    });

    it('PUT /tasks/:id fully updates a task with 200', async () => {
        const created = await createTask();
        const replacement = {
            title: 'Ship API tests',
            description: 'The endpoint suite is complete',
            status: 'done',
        } as const;

        const response = await api.put(`/tasks/${created.body.id}`).send(replacement);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: created.body.id,
            ...replacement,
            createdAt: created.body.createdAt,
            updatedAt: expect.any(String),
        });
    });

    it('DELETE /tasks/:id removes a task with 204', async () => {
        const created = await createTask();

        const response = await api.delete(`/tasks/${created.body.id}`);

        expect(response.status).toBe(204);
        expect(response.text).toBe('');

        const getResponse = await api.get(`/tasks/${created.body.id}`);
        expect(getResponse.status).toBe(404);
    });
});

describe('task input validation', () => {
    it.each([
        [
            'title',
            { description: validTaskInput.description, status: validTaskInput.status },
            'title must be a non-empty string',
        ],
        [
            'description',
            { title: validTaskInput.title, status: validTaskInput.status },
            'description must be a string',
        ],
        [
            'status',
            { title: validTaskInput.title, description: validTaskInput.description },
            'status must be one of: todo, in-progress, done',
        ],
    ])('POST /tasks rejects a missing %s field', async (_field, payload, expectedDetail) => {
        const response = await api.post('/tasks').send(payload);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: expect.arrayContaining([expectedDetail]),
            },
        });
    });

    it.each([
        [
            'title',
            { ...validTaskInput, title: 42 },
            'title must be a non-empty string',
        ],
        [
            'description',
            { ...validTaskInput, description: ['not', 'a', 'string'] },
            'description must be a string',
        ],
        [
            'status',
            { ...validTaskInput, status: 'blocked' },
            'status must be one of: todo, in-progress, done',
        ],
    ])('POST /tasks rejects an invalid %s type or value', async (_field, payload, expectedDetail) => {
        const response = await api.post('/tasks').send(payload);

        expect(response.status).toBe(400);
        expect(response.body.error).toEqual({
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: expect.arrayContaining([expectedDetail]),
        });
    });

    it('PUT /tasks/:id rejects invalid replacement data without changing the task', async () => {
        const created = await createTask();

        const response = await api
            .put(`/tasks/${created.body.id}`)
            .send({ ...validTaskInput, status: 10 });

        expect(response.status).toBe(400);

        const unchanged = await api.get(`/tasks/${created.body.id}`);
        expect(unchanged.status).toBe(200);
        expect(unchanged.body).toEqual(created.body);
    });
});

describe('task not-found responses', () => {
    it('GET /tasks/:id returns 404 for an unknown task', async () => {
        const taskId = randomUUID();

        const response = await api.get(`/tasks/${taskId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: {
                code: 'NOT_FOUND',
                message: `Task '${taskId}' was not found`,
            },
        });
    });

    it('PUT /tasks/:id returns 404 for an unknown task', async () => {
        const taskId = randomUUID();

        const response = await api.put(`/tasks/${taskId}`).send(validTaskInput);

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('DELETE /tasks/:id returns 404 for an unknown task', async () => {
        const taskId = randomUUID();

        const response = await api.delete(`/tasks/${taskId}`);

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('NOT_FOUND');
    });
});

describe('task input edge cases', () => {
    it('rejects an empty title', async () => {
        const response = await createTask({ title: '   ' });

        expect(response.status).toBe(400);
        expect(response.body.error.details).toContain('title must be a non-empty string');
    });

    it('accepts a very long description', async () => {
        const description = 'x'.repeat(50_000);

        const response = await createTask({ description });

        expect(response.status).toBe(201);
        expect(response.body.description).toBe(description);
        expect(response.body.description).toHaveLength(50_000);
    });
});
describe('GET /tasks pagination', () => {
    async function createTasks(count: number): Promise<Array<{ id: string }>> {
        const created: Array<{ id: string }> = [];
        for (let index = 0; index < count; index += 1) {
            const response = await createTask({ title: `Task ${index}` });
            expect(response.status).toBe(201);
            created.push(response.body);
        }
        return created;
    }

    it('returns tasks newest first and reports that no more pages exist', async () => {
        const created = await createTasks(3);

        const response = await api.get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body.data.map((task: { id: string }) => task.id)).toEqual(
            [...created].reverse().map((task) => task.id),
        );
        expect(response.body.nextCursor).toBeNull();
        expect(response.body.hasMore).toBe(false);
    });

    it('limits the page size and exposes a cursor for the next page', async () => {
        await createTasks(7);

        const response = await api.get('/tasks').query({ limit: 5 });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(5);
        expect(response.body.hasMore).toBe(true);
        expect(response.body.nextCursor).toBe(
            Buffer.from(response.body.data[4].id, 'utf8').toString('base64'),
        );
    });

    it('returns the following page when the cursor is supplied', async () => {
        const created = await createTasks(7);
        const newestFirst = [...created].reverse().map((task) => task.id);

        const firstPage = await api.get('/tasks').query({ limit: 5 });
        const secondPage = await api
            .get('/tasks')
            .query({ limit: 5, cursor: firstPage.body.nextCursor });

        expect(secondPage.status).toBe(200);
        expect(secondPage.body.data.map((task: { id: string }) => task.id)).toEqual(
            newestFirst.slice(5),
        );
        expect(secondPage.body.hasMore).toBe(false);
        expect(secondPage.body.nextCursor).toBeNull();
    });

    it('defaults to a page size of 20', async () => {
        await createTasks(21);

        const response = await api.get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(20);
        expect(response.body.hasMore).toBe(true);
    });

    it('returns an empty page when no tasks exist', async () => {
        const response = await api.get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: [], nextCursor: null, hasMore: false });
    });

    it.each([['0'], ['101'], ['-1'], ['abc'], ['1.5']])(
        'rejects limit=%s with 400',
        async (limit) => {
            const response = await api.get('/tasks').query({ limit });

            expect(response.status).toBe(400);
            expect(response.body.error).toEqual({
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: ['limit must be an integer between 1 and 100'],
            });
        },
    );

    it('rejects a cursor that is not valid base64 with 400', async () => {
        const response = await api.get('/tasks').query({ cursor: 'not base64!' });

        expect(response.status).toBe(400);
        expect(response.body.error.details).toEqual([
            'cursor must be a base64-encoded task id',
        ]);
    });

    it('rejects a cursor for an unknown task with 400', async () => {
        const cursor = Buffer.from(randomUUID(), 'utf8').toString('base64');

        const response = await api.get('/tasks').query({ cursor });

        expect(response.status).toBe(400);
        expect(response.body.error.details).toEqual([
            'cursor does not refer to an existing task',
        ]);
    });
});
