/**
 * ==========================================================================
 * MONGOOSE BOOK / RESOURCE MODEL (Compound Index & Category Attributes)
 * ==========================================================================
 */

let mongoose = null;
try { mongoose = require('mongoose'); } catch (e) { mongoose = null; }

if (mongoose) {
  const BookSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    author: { type: String, required: true },
    gtuCode: { type: String, index: true, default: '' },
    category: { type: String, enum: ['physical', 'digital'], default: 'physical' },
    resourceType: { type: String, default: 'textbook' },
    genre: { type: String, default: 'Computer Engineering' },
    subject: { type: String, default: 'General' },
    semester: { type: Number, required: true, index: true },
    branch: { type: String, required: true, index: true },
    edition: { type: String, default: 'GTU Edition' },
    condition: { type: String, enum: ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair'], default: 'Good' },
    mode: { type: String, enum: ['exchange', 'sell', 'buy', 'donate'], required: true },
    price: { type: Number, default: 0 },
    exchangeFor: { type: String, default: '' },
    description: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    status: { type: String, enum: ['Available', 'Reserved', 'Sold'], default: 'Available', index: true },
    seller: {
      id: String,
      name: String,
      email: String,
      role: String,
      whatsapp: String
    }
  }, { timestamps: true });

  BookSchema.index({ title: 'text', author: 'text', subject: 'text', gtuCode: 'text' });

  module.exports = mongoose.models.Book || mongoose.model('Book', BookSchema);
} else {
  module.exports = null;
}
