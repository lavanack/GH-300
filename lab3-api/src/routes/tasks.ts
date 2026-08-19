import { RequestHandler, Router } from 'express';
import { TaskRepository } from '../task-repository';
import { PaginationQuery, TaskInput } from '../types';
import { validatePaginationQuery, validateTaskInput } from '../validation';

const tasks = new TaskRepository();

/**
 * Returns a page of tasks sorted by creation date, newest first.
 * @param _request - The Express request whose validated `limit` and `cursor` are read from `response.locals`.
 * @param response - The Express response used to return the page of tasks.
 * @returns A `200 OK` response containing `data`, `nextCursor`, and `hasMore`, or a `400 VALIDATION_ERROR` response.
 * @example
 * curl "http://localhost:3000/tasks?limit=5"
 */
const listTasks: RequestHandler = (_request, response) => {
    response.status(200).json(tasks.findPage(response.locals.pagination as PaginationQuery));
};

/**
 * Returns a task by its unique identifier.
 * @param request - The Express request whose `params.id` identifies the task.
 * @param response - The Express response used to return the matching task.
 * @returns A `200 OK` response containing a task object, or a `404 NOT_FOUND` error response.
 * @example
 * curl http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000
 */
const getTask: RequestHandler = (request, response) => {
    response.status(200).json(tasks.findById(request.params.id as string));
};

/**
 * Creates a task from a validated JSON request body.
 * @param request - The Express request containing `title`, `description`, and `status` in its body.
 * @param response - The Express response used to return the newly created task.
 * @returns A `201 Created` response containing the created task, or a `400 VALIDATION_ERROR` response.
 * @example
 * curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Write tests","description":"Cover the task API","status":"todo"}'
 */
const createTask: RequestHandler = (request, response) => {
    const task = tasks.create(request.body as TaskInput);
    response.status(201).json(task);
};

/**
 * Replaces a task's editable fields using a validated JSON request body.
 * @param request - The Express request whose `params.id` identifies the task and whose body contains its new values.
 * @param response - The Express response used to return the updated task.
 * @returns A `200 OK` response containing the updated task, a `400 VALIDATION_ERROR`, or a `404 NOT_FOUND` response.
 * @example
 * curl -X PUT http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000 -H "Content-Type: application/json" -d '{"title":"Write tests","description":"Task API tests complete","status":"done"}'
 */
const updateTask: RequestHandler = (request, response) => {
    response.status(200).json(tasks.update(request.params.id as string, request.body as TaskInput));
};

/**
 * Deletes a task by its unique identifier.
 * @param request - The Express request whose `params.id` identifies the task to delete.
 * @param response - The Express response used to complete the request without a body.
 * @returns A `204 No Content` response, or a `404 NOT_FOUND` error response.
 * @example
 * curl -X DELETE http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000
 */
const deleteTask: RequestHandler = (request, response) => {
    tasks.delete(request.params.id as string);
    response.status(204).send();
};

export const taskRouter = Router();

taskRouter.get('/', validatePaginationQuery, listTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', validateTaskInput, createTask);
taskRouter.put('/:id', validateTaskInput, updateTask);
taskRouter.delete('/:id', deleteTask);