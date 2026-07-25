import path from 'path';
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

  // Serve Static Frontend Assets (HTML, CSS, JS, Images)
  app.use(express.static(process.cwd()));

  // Mount API Router
  app.use(ENV.API_PREFIX, apiRouter);

  // API Status Endpoint
  app.get(`${ENV.API_PREFIX}`, (req, res) => {
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

  // Page Route Handlers for Static Frontend
  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
  });

  app.get('/browse', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'browse.html'));
  });

  app.get('/browse-books', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'browse.html'));
  });

  app.get('/exchange', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'exchange.html'));
  });

  app.get('/donate', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'donate.html'));
  });

  app.get('/about', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'about.html'));
  });

  app.get('/contact', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'contact.html'));
  });

  app.get('/login', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'login.html'));
  });

  app.get('/register', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'register.html'));
  });

  app.get('/admin', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'admin.html'));
  });

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
};
