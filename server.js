/**
 * ==========================================================================
 * BOOKBRIDGE PRODUCTION ENTERPRISE SERVER ENGINE
 * Node.js + Express + Socket.IO + MongoDB (Mongoose Pooling) & JSON Fallback
 * ==========================================================================
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const { connectDB } = require('./config/db');
const { configureSecurity } = require('./middleware/security');
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');
const { validateBookInput } = require('./middleware/validate');

const authController = require('./controllers/authController');
const bookController = require('./controllers/bookController');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Initialize MongoDB Connection (with connection pooling & graceful local JSON fallback)
connectDB();

// Initialize Socket.IO
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
    console.log(`[Socket.IO Client Connected] ID: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket.IO Client Disconnected] ID: ${socket.id}`);
    });
  });
} catch (err) {
  console.log('[Socket.IO] Module not installed. Operating in standard REST mode.');
}

// Global Core Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Serve Static HTML Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/browse', (req, res) => {
  res.sendFile(path.join(__dirname, 'browse.html'));
});

app.get('/browse-books', (req, res) => {
  res.sendFile(path.join(__dirname, 'browse.html'));
});

app.get('/exchange', (req, res) => {
  res.sendFile(path.join(__dirname, 'exchange.html'));
});

app.get('/donate', (req, res) => {
  res.sendFile(path.join(__dirname, 'donate.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Apply Security Middleware (Helmet Headers, CORS, Express Rate Limiters)
configureSecurity(app);

/* Helper function for JSON Messages & Reviews fallback */
function readJSONData(key) {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return db[key] || [];
  } catch (err) {
    return [];
  }
}

function writeJSONData(key, list) {
  try {
    let db = {};
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    db[key] = list;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {}
}

/* ==========================================================================
   REST API ENDPOINTS
   ========================================================================== */

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BookBridge Enterprise Engine',
    timestamp: new Date().toISOString()
  });
});

// Admin Analytics & Users
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const books = readJSONData('books');
  const users = readJSONData('users');
  res.json({
    totalUsers: users.length || 2,
    totalListings: books.length || 2,
    totalTransactions: 0,
    totalOffers: 0
  });
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  res.json(readJSONData('users'));
});

// Auth Endpoints (Bcrypt Hashing + JWT Generation)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Book / Resource Endpoints
app.get('/api/books', bookController.getBooks);
app.post('/api/books', authenticateToken, validateBookInput, (req, res, next) => bookController.createBook(req, res, next, io));
app.put('/api/books/:id', authenticateToken, validateBookInput, (req, res, next) => bookController.updateBook(req, res, next, io));
app.delete('/api/books/:id', authenticateToken, (req, res, next) => bookController.deleteBook(req, res, next, io));

// Messages Endpoints
app.get('/api/messages', authenticateToken, (req, res) => {
  res.json(readJSONData('messages'));
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const messages = readJSONData('messages');
  const newMsg = {
    id: 'msg-' + Date.now(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  messages.push(newMsg);
  writeJSONData('messages', messages);

  if (io) io.emit('newMessage', newMsg);
  res.status(201).json(newMsg);
});

// Reviews Endpoints
app.get('/api/reviews', (req, res) => {
  res.json(readJSONData('reviews'));
});

app.post('/api/reviews', authenticateToken, (req, res) => {
  const reviews = readJSONData('reviews');
  const newReview = {
    id: 'rev-' + Date.now(),
    ...req.body,
    date: new Date().toISOString()
  };
  reviews.unshift(newReview);
  writeJSONData('reviews', reviews);

  if (io) io.emit('newReview', newReview);
  res.status(201).json(newReview);
});

// Centralized Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Unhandled Enterprise Error] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Start Production HTTP Server in standalone mode
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` 🌉 BookBridge Production Engine Running`);
    console.log(` 📍 URL: http://localhost:${PORT}`);
    console.log(` ⚡ Socket.IO Ready on /socket.io/socket.io.js`);
    console.log(`===================================================`);
  });
}

module.exports = app;
