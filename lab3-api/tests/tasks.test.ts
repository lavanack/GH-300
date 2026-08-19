import { randomUUID } from 'node:crypto';
import { api, createTask, validTaskInput } from './setup';

describe('task API happy paths', () => {
    it('GET /tasks returns the task collection with 200', async () => {
        const firstTask = await createTask({ title: 'First task' });
        const secondTask = await createTask({ title: 'Second task', status: 'in-progress' });

        const response = await api.get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.arrayContaining([firstTask.body, secondTask.body]),
        );
        expect(response.body).toHaveLength(2);
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