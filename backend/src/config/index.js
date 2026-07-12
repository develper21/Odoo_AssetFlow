/**
 * @fileoverview Centralized configuration object.
 * Reads all environment variables from .env and exports a single
 * frozen config object consumed across the application.
 *
 * Usage: const config = require('./config');
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root (one level above /src)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  /** @type {'development'|'production'|'test'} */
  env: process.env.NODE_ENV || 'development',

  /** Server port */
  port: parseInt(process.env.PORT, 10) || 5000,

  /** MongoDB connection string */
  mongoUri: process.env.MONGO_URI,

  /** JWT authentication settings */
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7,
  },

  /** SMTP / email settings */
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    email: process.env.SMTP_EMAIL,
    password: process.env.SMTP_PASSWORD,
    fromName: process.env.FROM_NAME || 'AssetFlow',
    fromEmail: process.env.FROM_EMAIL || 'noreply@assetflow.com',
  },

  /** Frontend origin for CORS & email links */
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  /** Cloudinary CDN (future use) */
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = config;
