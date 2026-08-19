/**
 * All task statuses accepted by the API, ordered from initial to terminal state.
 * Valid values are `todo`, `in-progress`, and `done`.
 */
export const TASK_STATUSES = ['todo', 'in-progress', 'done'] as const;

/**
 * A task's current workflow state.
 * Valid values are `todo`, `in-progress`, and `done`.
 */
export type TaskStatus = (typeof TASK_STATUSES)[number];

/**
 * A task stored and returned by the task management API.
 */
export interface Task {
    /** RFC 4122 version 4 UUID generated when the task is created. */
    id: string;

    /** Non-empty task title after surrounding whitespace is removed; no maximum length is enforced. */
    title: string;

    /** Task details; any string, including an empty string, is valid. */
    description: string;

    /** Current workflow state: `todo`, `in-progress`, or `done`. */
    status: TaskStatus;

    /** Date and time when the task was created; remains unchanged for the task's lifetime. */
    createdAt: Date;

    /** Date and time of the most recent update; equal to or later than `createdAt`. */
    updatedAt: Date;
}

/**
 * Client-provided fields required to create or fully replace a task.
 * Server-generated fields such as `id`, `createdAt`, and `updatedAt` are excluded.
 */
export interface TaskInput {
    /** Non-empty task title after surrounding whitespace is removed; no maximum length is enforced. */
    title: string;

    /** Task details; any string, including an empty string, is valid. */
    description: string;

    /** Requested workflow state: `todo`, `in-progress`, or `done`. */
    status: TaskStatus;
}