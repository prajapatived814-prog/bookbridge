import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.config';

export const configureSecurityMiddleware = (app: Express) => {
  // Helmet HTTP Security Headers (XSS, Clickjacking, MIME-sniffing protection)
  app.use(helmet({
    contentSecurityPolicy: false, // Allow inline assets for development/documentation
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // CORS Configuration
  app.use(cors({
    origin: ENV.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // General API Rate Limiter (100 requests per 15 minutes)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
  });

  app.use(ENV.API_PREFIX, apiLimiter);
};
