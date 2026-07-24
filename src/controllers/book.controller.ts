import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/book.service';
import { CreateBookSchema } from '../validation/schemas';

export class BookController {
  public async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, branch, maxPrice, page, limit } = req.query;
      const filters = {
        query: query ? String(query) : undefined,
        branch: branch ? String(branch) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      };
      const result = await bookService.getBooks(filters);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await bookService.getBookById(req.params.id);
      res.json(book);
    } catch (err) {
      next(err);
    }
  }

  public async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = CreateBookSchema.parse(req.body);
      const book = await bookService.createBook(validated);
      res.status(201).json(book);
    } catch (err) {
      next(err);
    }
  }

  public async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await bookService.updateBook(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  public async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await bookService.deleteBook(req.params.id);
      res.json({ message: 'Book deleted successfully', deleted });
    } catch (err) {
      next(err);
    }
  }

  public async searchBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, q } = req.body;
      const searchStr = query || q || '';
      const result = await bookService.getBooks({ query: searchStr });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async recommendBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { branch, semester } = req.body;
      const result = await bookService.getBooks({ branch: branch || 'CE' });
      res.json({
        recommendations: result.books.slice(0, 3),
        note: 'AI Picks tailored to your GTU course curriculum'
      });
    } catch (err) {
      next(err);
    }
  }
}

export const bookController = new BookController();
