import { Router } from 'express';
import { bookController } from '../controllers/book.controller';
import { authenticateJWT, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/books', (req, res, next) => bookController.getBooks(req, res, next));
router.get('/books/:id', (req, res, next) => bookController.getBookById(req, res, next));
router.post('/books', authenticateJWT, requireAuth, (req, res, next) => bookController.createBook(req, res, next));
router.put('/books/:id', authenticateJWT, requireAuth, (req, res, next) => bookController.updateBook(req, res, next));
router.delete('/books/:id', authenticateJWT, requireAuth, (req, res, next) => bookController.deleteBook(req, res, next));

router.post('/search', (req, res, next) => bookController.searchBooks(req, res, next));
router.post('/recommend', (req, res, next) => bookController.recommendBooks(req, res, next));

export default router;
