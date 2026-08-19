export class ApiError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        message: string,
        public readonly details?: string[],
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(404, 'NOT_FOUND', message);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends ApiError {
    constructor(details: string[]) {
        super(400, 'VALIDATION_ERROR', 'Request validation failed', details);
        this.name = 'ValidationError';
    }
}