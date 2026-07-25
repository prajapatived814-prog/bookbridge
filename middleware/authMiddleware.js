/**
 * ==========================================================================
 * JWT AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * ==========================================================================
 */

let jwt = null;
try { jwt = require('jsonwebtoken'); } catch (e) { jwt = null; }

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_bookbridge_key_2026';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Graceful fallback for local development if token is not sent
    req.user = { id: 'usr-guest', email: 'guest@rcti.ac.in', role: 'student' };
    return next();
  }

  if (!jwt) return next();

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired access token.' });
    req.user = decoded;
    next();
  });
};

exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied. Insufficient role access.' });
    }
    next();
  };
};
