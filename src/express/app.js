import express from 'express';
import { errorHandlingMiddleware } from './middlewares/error-handling-middleware.js';
import apiRouter from './routers/api-router.js';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);
app.use(errorHandlingMiddleware);

export default app;
