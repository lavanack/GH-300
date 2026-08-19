import { RequestHandler } from 'express';
import { ValidationError } from './errors';
import { TASK_STATUSES, TaskInput, TaskStatus } from './types';

const isTaskStatus = (value: unknown): value is TaskStatus =>
    typeof value === 'string' && TASK_STATUSES.some((status) => status === value);

export const validateTaskInput: RequestHandler = (request, _response, next) => {
    const errors: string[] = [];
    const body: unknown = request.body;

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        next(new ValidationError(['Request body must be a JSON object']));
        return;
    }

    const input = body as Record<string, unknown>;
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
        errors.push('title must be a non-empty string');
    }
    if (typeof input.description !== 'string') {
        errors.push('description must be a string');
    }
    if (!isTaskStatus(input.status)) {
        errors.push(`status must be one of: ${TASK_STATUSES.join(', ')}`);
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    request.body = {
        title: (input.title as string).trim(),
        description: input.description,
        status: input.status,
    } satisfies TaskInput;
    next();
};