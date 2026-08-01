/**
 * ==========================================================================
 * ENTERPRISE DATABASE CONFIGURATION (MySQL Sequelize + Pooling & Fallback)
 * ==========================================================================
 */

let Sequelize = null;
try {
  Sequelize = require('sequelize').Sequelize;
} catch (e) {
  Sequelize = null;
}

let sequelizeInstance = null;
let isSQLConnected = false;

const host = process.env.MYSQL_HOST || '127.0.0.1';
const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
const database = process.env.MYSQL_DATABASE || 'bookbridge';
const username = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || '';

if (Sequelize) {
  sequelizeInstance = new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 50,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

const connectDB = async () => {
  if (!sequelizeInstance) {
    console.log('[DB Info] Sequelize / mysql2 module not installed. Operating in high-performance JSON fallback mode.');
    return false;
  }

  try {
    await sequelizeInstance.authenticate();
    // Sync models automatically with database
    await sequelizeInstance.sync({ alter: false });
    isSQLConnected = true;
    console.log(`[MySQL Connected] Host: ${host}:${port} | Database: ${database}`);
    return true;
  } catch (error) {
    console.log(`[DB Info] MySQL offline (${error.message}). Gracefully using JSON DB fallback engine.`);
    isSQLConnected = false;
    return false;
  }
};

const getSQLStatus = () => isSQLConnected;
const getMongoStatus = () => isSQLConnected; // Backward compatibility alias

module.exports = {
  connectDB,
  getSQLStatus,
  getMongoStatus,
  sequelize: sequelizeInstance
};
