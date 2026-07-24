import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/', authRoutes);
router.use('/', bookRoutes);
router.use('/', adminRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BookBridge AI Enterprise Engine',
    timestamp: new Date().toISOString()
  });
});

export default router;
