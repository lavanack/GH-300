import { ErrorRequestHandler, RequestHandler } from 'express';
import { ApiError, NotFoundError } from './errors';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
    next(new NotFoundError(`Route ${request.method} ${request.path} was not found`));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    const apiError = error instanceof ApiError
        ? error
        : error instanceof SyntaxError && 'body' in error
            ? new ApiError(400, 'INVALID_JSON', 'Request body contains invalid JSON')
            : new ApiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');

    response.status(apiError.statusCode).json({
        error: {
            code: apiError.code,
            message: apiError.message,
            ...(apiError.details ? { details: apiError.details } : {}),
        },
    });
};