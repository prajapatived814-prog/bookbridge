/**
 * ==========================================================================
 * BOOKBRIDGE PRODUCTION SERVER WITH REAL-TIME SOCKET.IO & EDIT BROADCASTS
 * ==========================================================================
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

let io = null;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
} catch (err) {
  console.log('[Socket.IO] Module not installed, continuing in REST mode.');
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { users: [], books: [], transactions: [], offers: [], wishlist: [], messages: [], reviews: [] };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    if (!db.users) db.users = [];
    if (!db.wishlist) db.wishlist = [];
    if (!db.messages) db.messages = [];
    if (!db.reviews) db.reviews = [];
    return db;
  } catch (err) {
    return { users: [], books: [], transactions: [], offers: [], wishlist: [], messages: [], reviews: [] };
  }
}

function writeDatabase(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {}
}

/* API Endpoints */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BookBridge Real-time Server Running' });
});

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  const db = readDatabase();
  res.json({
    totalUsers: (db.users || []).length,
    totalListings: (db.books || []).length,
    totalTransactions: (db.transactions || []).length,
    totalOffers: (db.offers || []).length
  });
});

// Admin Users
app.get('/api/admin/users', (req, res) => {
  const db = readDatabase();
  res.json(db.users || []);
});

// Auth Register
app.post('/api/register', (req, res) => {
  const db = readDatabase();
  const { name, email, password, branch, semester, whatsapp, enrollment, role, division, academicYear } = req.body;

  if (!email || !name) return res.status(400).json({ error: 'Name and email are required' });

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(400).json({ error: 'User email already exists' });

  const userRole = role || (email.toLowerCase().includes('admin') ? 'admin' : 'student');
  const newUser = {
    id: 'usr-' + Date.now(),
    name,
    enrollment: enrollment || '246400307192',
    email,
    branch: branch || 'CE',
    semester: parseInt(semester || 5),
    division: division || 'Div A',
    academicYear: academicYear || '2025-2026',
    whatsapp: whatsapp || '',
    role: userRole,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDatabase(db);
  res.status(201).json(newUser);
});

// Auth Login
app.post('/api/login', (req, res) => {
  const db = readDatabase();
  const { email } = req.body;

  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const userRole = email.toLowerCase().includes('admin') ? 'admin' : (email.toLowerCase().includes('faculty') ? 'faculty' : 'student');
    user = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0].toUpperCase(),
      enrollment: '246400307210',
      email: email,
      branch: 'CE',
      semester: 5,
      role: userRole,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDatabase(db);
  }

  res.json(user);
});

// GET /api/books
app.get('/api/books', (req, res) => {
  const db = readDatabase();
  let books = db.books || [];
  const { query, mode, genre, semester, branch, resourceType, condition, sort, category } = req.query;

  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    books = books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      (b.subject && b.subject.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all') books = books.filter(b => (b.category || 'physical') === category);
  if (mode && mode !== 'all') books = books.filter(b => b.mode === mode);
  if (genre && genre !== 'all') books = books.filter(b => b.genre.toLowerCase() === genre.toLowerCase() || b.branch === genre);
  if (semester && semester !== 'all') books = books.filter(b => b.semester && b.semester.toString() === semester.toString());
  if (branch && branch !== 'all') books = books.filter(b => b.branch === 'All' || b.branch === branch);
  if (resourceType && resourceType !== 'all') books = books.filter(b => b.resourceType === resourceType);
  if (condition && condition !== 'all') books = books.filter(b => b.condition === condition);

  res.json(books);
});

// POST /api/books
app.post('/api/books', (req, res) => {
  const db = readDatabase();
  const newBook = {
    id: 'rcti-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.books.unshift(newBook);
  writeDatabase(db);

  if (io) io.emit('newBook', newBook);
  res.status(201).json(newBook);
});

// PUT /api/books/:id
app.put('/api/books/:id', (req, res) => {
  const db = readDatabase();
  const index = db.books.findIndex(b => b.id === req.params.id);
  if (index >= 0) {
    db.books[index] = { ...db.books[index], ...req.body };
    writeDatabase(db);
    if (io) io.emit('bookUpdated', db.books[index]);
    return res.json(db.books[index]);
  }
  res.status(404).json({ error: 'Book not found' });
});

// GET /api/books/:id
app.get('/api/books/:id', (req, res) => {
  const db = readDatabase();
  const book = db.books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// DELETE /api/books/:id
app.delete('/api/books/:id', (req, res) => {
  const db = readDatabase();
  const bookId = req.params.id;
  db.books = db.books.filter(b => b.id !== bookId);
  writeDatabase(db);

  if (io) io.emit('bookDeleted', bookId);
  res.json({ message: 'Book deleted successfully', id: bookId });
});

// Messages API
app.get('/api/messages', (req, res) => {
  const db = readDatabase();
  res.json(db.messages || []);
});

app.post('/api/messages', (req, res) => {
  const db = readDatabase();
  const newMsg = {
    id: 'msg-' + Date.now(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  db.messages.push(newMsg);
  writeDatabase(db);

  if (io) io.emit('newMessage', newMsg);
  res.status(201).json(newMsg);
});

// Reviews API
app.get('/api/reviews', (req, res) => {
  const db = readDatabase();
  res.json(db.reviews || []);
});

app.post('/api/reviews', (req, res) => {
  const db = readDatabase();
  const newReview = {
    id: 'rev-' + Date.now(),
    ...req.body,
    date: new Date().toISOString()
  };
  db.reviews.unshift(newReview);
  writeDatabase(db);

  if (io) io.emit('newReview', newReview);
  res.status(201).json(newReview);
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` BookBridge Real-time Server Running on http://localhost:${PORT}`);
  console.log(` Socket.IO Available on /socket.io/socket.io.js`);
  console.log(`===================================================`);
});
