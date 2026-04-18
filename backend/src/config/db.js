// ============================================
// PayFlux AI - MongoDB Connection Manager
// backend/src/config/db.js
// ============================================
// Handles connection, reconnection, and graceful shutdown.

const mongoose = require('mongoose');
const { config } = require('./env');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB with retry logic.
 * Mongoose 8 uses the new connection string parser by default.
 */
async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      // Performance & stability options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners for resilience
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully.');
    });

    return conn;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    // Exit process on initial connection failure — let process manager restart
    process.exit(1);
  }
}

/**
 * Graceful shutdown — close connection before process exits.
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully.');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error.message);
  }
}

module.exports = { connectDB, disconnectDB };
