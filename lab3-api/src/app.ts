import express from 'express';
import { errorHandler, notFoundHandler } from './error-handler';
import { requestLogger } from './request-logger';
import { taskRouter } from './routes/tasks';

export const app = express();

app.use(requestLogger);
app.use(express.json());

app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
});

app.use('/tasks', taskRouter);

app.use(notFoundHandler);
app.use(errorHandler);