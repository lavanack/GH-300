import { RequestHandler } from 'express';

/**
 * Logs one line after each HTTP response finishes.
 * @param request - The incoming Express request whose method and URL are logged.
 * @param response - The Express response whose final status code is logged.
 * @param next - Continues processing through the remaining middleware and routes.
 * @returns Nothing; logging occurs asynchronously when the response emits `finish`.
 * @example
 * app.use(requestLogger);
 */
export const requestLogger: RequestHandler = (request, response, next) => {
    const timestamp = new Date().toISOString();
    const startedAt = process.hrtime.bigint();

    response.once('finish', () => {
        const elapsedNanoseconds = process.hrtime.bigint() - startedAt;
        const responseTimeMilliseconds = Number(elapsedNanoseconds) / 1_000_000;

        console.log(
            `[${timestamp}] ${request.method} ${request.originalUrl} ${response.statusCode} ${responseTimeMilliseconds.toFixed(2)}ms`,
        );
    });

    next();
};