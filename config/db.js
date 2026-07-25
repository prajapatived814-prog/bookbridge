/**
 * ==========================================================================
 * ENTERPRISE DATABASE CONFIGURATION (MongoDB Mongoose + Pooling & Fallback)
 * ==========================================================================
 */

let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = null;
}

let isMongoConnected = false;

const connectDB = async () => {
  if (!mongoose) {
    console.log('[DB Info] Mongoose module not installed. Operating in high-performance JSON fallback mode.');
    return false;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookbridge';

  try {
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 100, // Handle high concurrency
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
    });

    isMongoConnected = true;
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log(`[DB Info] Local MongoDB offline (${error.message}). Gracefully using JSON DB fallback engine.`);
    isMongoConnected = false;
    return false;
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = { connectDB, getMongoStatus };
