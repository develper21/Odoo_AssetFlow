/**
 * @fileoverview MongoDB connection manager.
 * Connects to MongoDB Atlas via Mongoose and logs lifecycle events.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Establish a connection to MongoDB Atlas.
 * Retries are handled internally by the Mongoose driver.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 uses the new URL parser and unified topology by default.
      // Additional options can be added here if needed.
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners for ongoing lifecycle monitoring
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection…');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    // Exit process with failure code so process manager (pm2/docker) can restart
    process.exit(1);
  }
};

module.exports = connectDB;
