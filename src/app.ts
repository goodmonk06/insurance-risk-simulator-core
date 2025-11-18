/**
 * Express application configuration
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  const apiPrefix = process.env.API_PREFIX || '/api';
  app.use(apiPrefix, routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Insurance Risk Simulator API',
      version: '1.0.0',
      docs: `${apiPrefix}/health`,
    });
  });

  // Error handling
  app.use(errorHandler);

  return app;
}
