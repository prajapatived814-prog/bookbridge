import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/analytics', authenticateJWT, (req, res, next) => adminController.getAnalytics(req, res, next));
router.get('/admin/export/csv', authenticateJWT, requireRoles('ADMIN'), (req, res, next) => adminController.exportCSV(req, res, next));
router.get('/admin/export/pdf', authenticateJWT, requireRoles('ADMIN'), (req, res, next) => adminController.exportPDF(req, res, next));

export default router;
