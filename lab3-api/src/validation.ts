import { RequestHandler } from 'express';
import { ValidationError } from './errors';
import {
    DEFAULT_PAGE_LIMIT,
    MAX_PAGE_LIMIT,
    PaginationQuery,
    TASK_STATUSES,
    TaskInput,
    TaskStatus,
} from './types';

const isTaskStatus = (value: unknown): value is TaskStatus =>
    typeof value === 'string' && TASK_STATUSES.some((status) => status === value);

/**
 * Validates the `limit` and `cursor` query parameters and stores them on `response.locals.pagination`.
 * @param request - The Express request whose query string may contain `limit` and `cursor`.
 * @param response - The Express response carrying the parsed parameters in `locals.pagination`.
 * @param next - The Express callback invoked with a `ValidationError` when a parameter is invalid.
 * @example
 * curl "http://localhost:3000/tasks?limit=5"
 */
export const validatePaginationQuery: RequestHandler = (request, response, next) => {
    const errors: string[] = [];
    const { limit, cursor } = request.query as Record<string, unknown>;

    let parsedLimit = DEFAULT_PAGE_LIMIT;
    if (limit !== undefined) {
        if (typeof limit !== 'string' || !/^\d+$/.test(limit)) {
            errors.push(`limit must be an integer between 1 and ${MAX_PAGE_LIMIT}`);
        } else {
            parsedLimit = Number(limit);
            if (parsedLimit < 1 || parsedLimit > MAX_PAGE_LIMIT) {
                errors.push(`limit must be an integer between 1 and ${MAX_PAGE_LIMIT}`);
            }
        }
    }

    if (cursor !== undefined && (typeof cursor !== 'string' || cursor.length === 0)) {
        errors.push('cursor must be a non-empty string');
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    response.locals.pagination = {
        limit: parsedLimit,
        ...(typeof cursor === 'string' ? { cursor } : {}),
    } satisfies PaginationQuery;
    next();
};

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
        description: input.description as string,
        status: input.status as TaskStatus,
    } satisfies TaskInput;
    next();
};