import express, { Express } from 'express';
import { ENV } from './config/env.config';
import { configureSecurityMiddleware } from './middleware/security.middleware';
import { globalErrorHandler } from './middleware/errorHandler';
import apiRouter from './routes';

export const createApp = (): Express => {
  const app = express();

  // Core Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security Headers & CORS
  configureSecurityMiddleware(app);

  // Mount API Router
  app.use(ENV.API_PREFIX, apiRouter);

  // Root Welcome Endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'BookBridge Enterprise API',
      version: '2.0.0',
      status: 'active',
      endpoints: {
        books: `${ENV.API_PREFIX}/books`,
        analytics: `${ENV.API_PREFIX}/analytics`
      }
    });
  });

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
};
