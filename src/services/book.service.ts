import { BookSearchFilters } from '../models/types';
import { NotFoundError } from '../utils/errors';

export class BookService {
  private static booksDb = [
    {
      id: 'rcti-lab-1',
      title: 'GTU DATA STRUCTURES (DS: 3330704) PRACTICAL LAB MANUAL',
      author: 'RCTI COMPUTER ENGG DEPT',
      subject: 'Computer Science',
      branch: 'CE',
      semester: 3,
      edition: 'Latest Edition',
      condition: 'Like New',
      mode: 'DONATE',
      price: 0,
      originalPrice: 450,
      rating: 4.8,
      status: 'Available',
      seller: { name: 'RCTI Comp Dept Admin', email: 'admin@rcti.ac.in' }
    },
    {
      id: 'bb-algos-1',
      title: 'Introduction to Algorithms (3rd Edition)',
      author: 'Cormen, Leiserson, Rivest',
      subject: 'Computer Science',
      branch: 'CE',
      semester: 5,
      edition: '3rd Edition',
      condition: 'Good',
      mode: 'SELL',
      price: 950,
      originalPrice: 3200,
      rating: 4.8,
      status: 'Available',
      seller: { name: 'Ved V. Patel', email: 'ved.ce@rcti.ac.in' }
    },
    {
      id: 'bb-mech-2',
      title: 'Engineering Mechanics: Statics (14th Ed)',
      author: 'R.C. Hibbeler',
      subject: 'Engineering',
      branch: 'ME',
      semester: 1,
      edition: '4th Edition',
      condition: 'Like New',
      mode: 'SELL',
      price: 620,
      originalPrice: 1800,
      rating: 4.6,
      status: 'Available',
      seller: { name: 'RCTI Mech Dept Admin', email: 'admin@rcti.ac.in' }
    }
  ];

  public async getBooks(filters: BookSearchFilters = {}) {
    let result = [...BookService.booksDb];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }

    if (filters.branch && filters.branch.toLowerCase() !== 'all') {
      result = result.filter(b => b.branch.toLowerCase() === filters.branch!.toLowerCase());
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(b => b.price <= filters.maxPrice!);
    }

    return {
      total: result.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
      books: result
    };
  }

  public async getBookById(id: string) {
    const book = BookService.booksDb.find(b => b.id === id);
    if (!book) throw new NotFoundError(`Book with ID ${id} not found`);
    return book;
  }

  public async createBook(data: any) {
    const newBook = {
      id: `book-${Date.now()}`,
      title: data.title,
      author: data.author || 'RCTI Faculty',
      subject: data.subject || 'Computer Science',
      branch: data.branch || 'CE',
      semester: data.semester || 5,
      edition: data.edition || 'Latest Edition',
      condition: data.condition || 'Good',
      mode: (data.mode || 'SELL').toUpperCase(),
      price: data.price || 0,
      originalPrice: data.originalPrice || 1200,
      rating: 5.0,
      status: 'Available',
      seller: { name: data.sellerName || 'Student Seller', email: data.sellerEmail || 'student@rcti.ac.in' }
    };
    BookService.booksDb.unshift(newBook);
    return newBook;
  }

  public async updateBook(id: string, updates: any) {
    const book = await this.getBookById(id);
    Object.assign(book, updates);
    return book;
  }

  public async deleteBook(id: string) {
    const index = BookService.booksDb.findIndex(b => b.id === id);
    if (index === -1) throw new NotFoundError(`Book with ID ${id} not found`);
    const deleted = BookService.booksDb.splice(index, 1);
    return deleted[0];
  }

  public calculateFine(dueDate: Date, returnedDate: Date = new Date()): { daysOverdue: number; fineAmount: number } {
    const diffTime = returnedDate.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const fineRatePerDay = 5; // ₹5 per overdue day
    return {
      daysOverdue,
      fineAmount: daysOverdue * fineRatePerDay
    };
  }
}

export const bookService = new BookService();
