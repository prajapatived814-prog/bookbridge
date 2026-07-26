import fs from 'fs';
import path from 'path';
import express, { Express, Response } from 'express';
import { ENV } from './config/env.config';
import { configureSecurityMiddleware } from './middleware/security.middleware';
import { globalErrorHandler } from './middleware/errorHandler';
import apiRouter from './routes';

const serveStaticFile = (res: Response, filename: string) => {
  const candidates = [
    path.resolve(process.cwd(), filename),
    path.resolve(__dirname, filename),
    path.resolve(__dirname, '..', filename),
    path.resolve(__dirname, '..', '..', filename)
  ];

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(htmlContent);
      }
    } catch (err) {
      console.error(`[Static File Error] Failed reading ${filePath}:`, err);
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BookBridge</title><script>window.location.href="/browse";</script></head><body><h2>BookBridge Online</h2><p><a href="/browse">Go to Browse Books</a></p></body></html>`);
};

export const createApp = (): Express => {
  const app = express();

  // Core Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security Headers & CORS
  configureSecurityMiddleware(app);

  // Serve Static Frontend Assets (HTML, CSS, JS, Images)
  app.use(express.static(process.cwd()));
  app.use(express.static(__dirname));

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

  // Page Route Handlers for Static Frontend (supporting clean paths & .html extensions)
  app.get(['/', '/index.html'], (req, res) => serveStaticFile(res, 'index.html'));
  app.get(['/browse', '/browse.html', '/browse-books', '/browse-books.html'], (req, res) => serveStaticFile(res, 'browse.html'));
  app.get(['/exchange', '/exchange.html'], (req, res) => serveStaticFile(res, 'exchange.html'));
  app.get(['/donate', '/donate.html'], (req, res) => serveStaticFile(res, 'donate.html'));
  app.get(['/about', '/about.html'], (req, res) => serveStaticFile(res, 'about.html'));
  app.get(['/contact', '/contact.html'], (req, res) => serveStaticFile(res, 'contact.html'));
  app.get(['/login', '/login.html'], (req, res) => serveStaticFile(res, 'login.html'));
  app.get(['/register', '/register.html'], (req, res) => serveStaticFile(res, 'register.html'));
  app.get(['/admin', '/admin.html'], (req, res) => serveStaticFile(res, 'admin.html'));
  app.get(['/dashboard', '/dashboard.html'], (req, res) => serveStaticFile(res, 'dashboard.html'));

  // Catch-all route for any filename.html request
  app.get('/:page.html', (req, res) => {
    const pageFile = `${req.params.page}.html`;
    serveStaticFile(res, pageFile);
  });

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
};
