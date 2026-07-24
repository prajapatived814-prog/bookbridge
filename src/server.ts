import http from 'http';
import { createApp } from './app';
import { ENV } from './config/env.config';
import { logger } from './config/logger';

const app = createApp();
const server = http.createServer(app);

// Start Production Server Listener
server.listen(ENV.PORT, () => {
  logger.info(`========================================================`);
  logger.info(` 🌉 BOOKBRIDGE ENTERPRISE ENGINE RUNNING`);
  logger.info(` 📍 URL: http://localhost:${ENV.PORT}`);
  logger.info(` ⚡ API Prefix: ${ENV.API_PREFIX}`);
  logger.info(`========================================================`);
});

// Graceful Shutdown Handlers
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });
});
