-- ==========================================================================
-- BOOKBRIDGE PRODUCTION SQL SCHEMA (MY UPLOADS & MULTI-STEP UPLOADER)
-- ==========================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enrollment_number TEXT UNIQUE DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  branch TEXT DEFAULT 'CE',
  semester INTEGER DEFAULT 5,
  division TEXT DEFAULT 'Div A',
  academic_year TEXT DEFAULT '2025-2026',
  whatsapp TEXT DEFAULT '',
  role TEXT DEFAULT 'student', -- student, faculty, alumni, admin
  avatar TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Books / Resources Table (Physical & Digital)
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  category TEXT DEFAULT 'physical', -- physical, digital
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT DEFAULT 'N/A',
  gtu_code TEXT DEFAULT '',
  resource_type TEXT DEFAULT 'textbook',
  genre TEXT DEFAULT 'Computer Engineering',
  subject TEXT DEFAULT 'General',
  semester INTEGER DEFAULT 5,
  branch TEXT DEFAULT 'CE',
  edition TEXT DEFAULT '2025 Ed',
  publisher TEXT DEFAULT 'Atul Prakashan',
  condition TEXT DEFAULT 'Good', -- Brand New, Like New, Excellent, Good, Fair
  language TEXT DEFAULT 'English', -- English, Gujarati, Hindi
  mode TEXT DEFAULT 'exchange', -- exchange, sell, buy, donate
  price REAL DEFAULT 0.0,
  exchange_for TEXT DEFAULT '',
  description TEXT DEFAULT '',
  pdf_url TEXT DEFAULT '',
  contact_preference TEXT DEFAULT 'Both', -- Chat Only, Phone, Email, Both
  seller_id TEXT,
  seller_name TEXT DEFAULT 'Student',
  seller_role TEXT DEFAULT 'student',
  seller_email TEXT DEFAULT '',
  seller_whatsapp TEXT DEFAULT '',
  location TEXT DEFAULT 'RCTI Campus, Ahmedabad',
  cover_gradient TEXT DEFAULT 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  icon TEXT DEFAULT '📚',
  status TEXT DEFAULT 'Available', -- Available, Reserved, Sold
  views_count INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- 3. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  amount REAL DEFAULT 0.0,
  payment_status TEXT DEFAULT 'completed',
  order_status TEXT DEFAULT 'delivered',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Exchanges Table
CREATE TABLE IF NOT EXISTS exchanges (
  id TEXT PRIMARY KEY,
  target_book_id TEXT NOT NULL,
  offered_book_title TEXT NOT NULL,
  proposer_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  note TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Donations Table
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  donor_id TEXT NOT NULL,
  claimant_id TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  book_id TEXT,
  text TEXT NOT NULL,
  read_status INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  comment TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
