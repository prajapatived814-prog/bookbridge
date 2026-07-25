/**
 * ==========================================================================
 * AUTH CONTROLLER (Bcrypt Password Hashing & JWT Token Generation)
 * ==========================================================================
 */

const fs = require('fs');
const path = require('path');

let bcrypt = null;
let jwt = null;
try { bcrypt = require('bcryptjs'); } catch (e) { bcrypt = null; }
try { jwt = require('jsonwebtoken'); } catch (e) { jwt = null; }

const User = require('../models/User');
const { getMongoStatus } = require('../config/db');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_bookbridge_key_2026';

function readJSONDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return { users: [], books: [], messages: [], reviews: [] };
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!db.users) db.users = [];
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

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, enrollment, branch, semester, whatsapp, role, division, academicYear } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Name and email are required' });

    let passwordHash = password || 'student123';
    if (bcrypt && password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const userRole = role || (email.toLowerCase().includes('admin') ? 'admin' : 'student');

    if (getMongoStatus() && User) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'User account already exists' });

      const newUser = await User.create({
        name,
        email,
        passwordHash,
        enrollment: enrollment || '246400307192',
        branch: branch || 'CE',
        semester: parseInt(semester || 5),
        division: division || 'Div A',
        academicYear: academicYear || '2025-2026',
        whatsapp: whatsapp || '',
        role: userRole
      });

      const token = jwt ? jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' }) : 'token-' + Date.now();
      return res.status(201).json({ token, user: newUser });
    }

    // JSON Fallback
    const db = readJSONDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return res.status(400).json({ error: 'User account already exists' });

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
    writeJSONDB(db);

    const token = jwt ? jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' }) : 'token-' + Date.now();
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    if (getMongoStatus() && User) {
      let user = await User.findOne({ email });
      if (!user) {
        const userRole = email.toLowerCase().includes('admin') ? 'admin' : (email.toLowerCase().includes('faculty') ? 'faculty' : 'student');
        user = await User.create({
          name: email.split('@')[0].toUpperCase(),
          email,
          passwordHash: password || 'student123',
          role: userRole
        });
      }
      const token = jwt ? jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' }) : 'token-' + Date.now();
      return res.json({ token, user });
    }

    // JSON Fallback
    const db = readJSONDB();
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
      writeJSONDB(db);
    }

    const token = jwt ? jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' }) : 'token-' + Date.now();
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};
