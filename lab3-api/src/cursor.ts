import { ValidationError } from './errors';

/**
 * Encodes a task identifier into an opaque pagination cursor.
 * @param id - The identifier of the last task on the current page.
 * @returns The base64-encoded cursor.
 * @example
 * encodeCursor('550e8400-e29b-41d4-a716-446655440000');
 */
export function encodeCursor(id: string): string {
    return Buffer.from(id, 'utf8').toString('base64');
}

/**
 * Decodes an opaque pagination cursor back into a task identifier.
 * @param cursor - The base64-encoded cursor supplied by the client.
 * @returns The decoded task identifier.
 * @throws ValidationError When the cursor is not valid base64 text.
 * @example
 * decodeCursor('NTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAw');
 */
export function decodeCursor(cursor: string): string {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    if (decoded.length === 0 || encodeCursor(decoded) !== cursor) {
        throw new ValidationError(['cursor must be a base64-encoded task id']);
    }
    return decoded;
}
