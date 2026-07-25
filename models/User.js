/**
 * ==========================================================================
 * MONGOOSE USER MODEL (GTU Attributes, Bcrypt Hashing, RBAC)
 * ==========================================================================
 */

let mongoose = null;
try { mongoose = require('mongoose'); } catch (e) { mongoose = null; }

if (mongoose) {
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    enrollment: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    branch: { type: String, default: 'CE', enum: ['CE', 'IT', 'ICT', 'EE', 'ME', 'CIVIL', 'PRINT', 'TMT', 'TPT'] },
    semester: { type: Number, default: 5, min: 1, max: 6 },
    division: { type: String, default: 'Div A' },
    academicYear: { type: String, default: '2025-2026' },
    whatsapp: { type: String, default: '' },
    role: { type: String, enum: ['student', 'faculty', 'alumni', 'admin'], default: 'student' }
  }, { timestamps: true });

  module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
} else {
  module.exports = null;
}
