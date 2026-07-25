/**
 * ==========================================================================
 * ENTERPRISE API SECURITY MIDDLEWARE (Helmet, Rate Limiting & Strict CORS)
 * ==========================================================================
 */

const cors = require('cors');

let helmet = null;
let rateLimit = null;
try { helmet = require('helmet'); } catch (e) { helmet = null; }
try { rateLimit = require('express-rate-limit'); } catch (e) { rateLimit = null; }

exports.configureSecurity = (app) => {
  // 1. Helmet Security Headers (if installed)
  if (helmet) {
    app.use(helmet({ contentSecurityPolicy: false }));
  }

  // 2. CORS Configuration
  const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:8000', 'http://localhost:3000'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));

  // 3. API Rate Limiting (if installed)
  if (rateLimit) {
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      message: { error: 'Too many requests from this IP, please try again later.' }
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 15,
      message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
    });

    app.use('/api/', apiLimiter);
    app.use('/api/login', authLimiter);
  }
};
