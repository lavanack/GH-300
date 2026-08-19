/** Default number of items returned by a paginated endpoint when `limit` is omitted. */
export const DEFAULT_PAGE_LIMIT = 20;

/** Largest number of items a paginated endpoint returns for a single request. */
export const MAX_PAGE_LIMIT = 100;

/**
 * Validated cursor pagination parameters taken from a request query string.
 */
export interface PaginationQuery {
    /** Maximum number of items to return; between 1 and {@link MAX_PAGE_LIMIT}. */
    limit: number;

    /** Opaque cursor identifying the last item of the previous page, or `undefined` for the first page. */
    cursor?: string;
}

/**
 * A single page of results returned by a paginated endpoint.
 */
export interface Page<T> {
    /** Items belonging to the requested page, ordered newest first. */
    data: T[];

    /** Opaque cursor to request the next page, or `null` when the last page was returned. */
    nextCursor: string | null;

    /** `true` when further pages are available. */
    hasMore: boolean;
}
