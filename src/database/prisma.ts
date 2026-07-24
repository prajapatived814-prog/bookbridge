import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
});

// Log long queries for optimization
(prisma as any).$on('query', (e: any) => {
  if (e.duration > 200) {
    logger.warn(`[Slow Query Detected] Duration: ${e.duration}ms | Query: ${e.query}`);
  }
});
