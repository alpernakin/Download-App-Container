import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { middleware, errorHandler, mapRoutes } from './middleware.js';

// create the app
const app = express();
// app configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// use the middleware handle callbacks before and after execution
app.use(middleware);
app.use(errorHandler);
// map the routes through the controller actions
app.use('/', mapRoutes(express.Router()));

export default app;