/**
 * ==========================================================================
 * BOOK CONTROLLER (Mongoose Queries + JSON Fallback Engine)
 * ==========================================================================
 */

const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const { getMongoStatus } = require('../config/db');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

function readJSONDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return { users: [], books: [], messages: [], reviews: [] };
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!db.books) db.books = [];
    return db;
  } catch (err) {
    return { users: [], books: [], messages: [], reviews: [] };
  }
}

function writeJSONDB(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {}
}

exports.getBooks = async (req, res, next) => {
  try {
    const { query, mode, genre, semester, branch, resourceType, condition, category } = req.query;

    if (getMongoStatus() && Book) {
      let filter = {};
      if (query) filter.$text = { $search: query };
      if (category && category.toLowerCase() !== 'all') filter.category = category;
      if (mode && mode.toLowerCase() !== 'all') filter.mode = mode;
      if (branch && branch.toLowerCase() !== 'all') filter.branch = branch;
      if (semester && semester.toLowerCase() !== 'all') filter.semester = parseInt(semester);
      if (resourceType && resourceType.toLowerCase() !== 'all') filter.resourceType = resourceType;
      if (condition && condition.toLowerCase() !== 'all') filter.condition = condition;

      const books = await Book.find(filter).sort({ createdAt: -1 });
      return res.json(books);
    }

    // JSON Fallback Engine
    const db = readJSONDB();
    let books = db.books || [];

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      books = books.filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.genre || '').toLowerCase().includes(q) ||
        (b.subject || '').toLowerCase().includes(q)
      );
    }

    if (category && category.toLowerCase() !== 'all') books = books.filter(b => (b.category || 'physical').toLowerCase() === category.toLowerCase());
    if (mode && mode.toLowerCase() !== 'all') books = books.filter(b => b.mode.toLowerCase() === mode.toLowerCase());
    if (genre && genre.toLowerCase() !== 'all') books = books.filter(b => b.genre.toLowerCase() === genre.toLowerCase() || (b.branch && b.branch.toLowerCase() === genre.toLowerCase()));
    if (semester && semester.toLowerCase() !== 'all') books = books.filter(b => b.semester && b.semester.toString() === semester.toString());
    if (branch && branch.toLowerCase() !== 'all') books = books.filter(b => b.branch === 'All' || (b.branch && b.branch.toLowerCase() === branch.toLowerCase()));
    if (resourceType && resourceType.toLowerCase() !== 'all') books = books.filter(b => b.resourceType === resourceType);
    if (condition && condition.toLowerCase() !== 'all') books = books.filter(b => b.condition === condition);

    res.json(books);
  } catch (error) {
    next(error);
  }
};

exports.createBook = async (req, res, next, io) => {
  try {
    if (getMongoStatus() && Book) {
      const newBook = await Book.create({
        ...req.body,
        semester: parseInt(req.body.semester || 5),
        price: parseFloat(req.body.price || 0)
      });
      if (io) io.emit('newBook', newBook);
      return res.status(201).json(newBook);
    }

    // JSON Fallback Engine
    const db = readJSONDB();
    const newBook = {
      id: 'rcti-' + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    db.books.unshift(newBook);
    writeJSONDB(db);

    if (io) io.emit('newBook', newBook);
    res.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next, io) => {
  try {
    const bookId = req.params.id;

    if (getMongoStatus() && Book) {
      const updatedBook = await Book.findByIdAndUpdate(bookId, req.body, { new: true });
      if (io) io.emit('bookUpdated', updatedBook);
      return res.json(updatedBook);
    }

    // JSON Fallback Engine
    const db = readJSONDB();
    const index = db.books.findIndex(b => b.id === bookId);
    if (index >= 0) {
      db.books[index] = { ...db.books[index], ...req.body };
      writeJSONDB(db);
      if (io) io.emit('bookUpdated', db.books[index]);
      return res.json(db.books[index]);
    }
    res.status(404).json({ error: 'Resource not found' });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next, io) => {
  try {
    const bookId = req.params.id;

    if (getMongoStatus() && Book) {
      await Book.findByIdAndDelete(bookId);
      if (io) io.emit('bookDeleted', bookId);
      return res.json({ message: 'Book deleted successfully', id: bookId });
    }

    // JSON Fallback Engine
    const db = readJSONDB();
    db.books = db.books.filter(b => b.id !== bookId);
    writeJSONDB(db);

    if (io) io.emit('bookDeleted', bookId);
    res.json({ message: 'Book deleted successfully', id: bookId });
  } catch (error) {
    next(error);
  }
};
