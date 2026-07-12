/**
 * @fileoverview Rate limiting middlewares using express-rate-limit.
 *
 * Two pre-configured limiters:
 *   apiLimiter  – General API routes  (100 req / 15 min per IP)
 *   authLimiter – Auth endpoints      (10 req / 15 min per IP)
 */

const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../constants');

/**
 * General API rate limiter.
 * Applied globally or to non-auth API route groups.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per window
  standardHeaders: true,    // Send RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  statusCode: HTTP_STATUS.BAD_REQUEST, // 429 is more accurate but 400 keeps it simple
});

/**
 * Stricter rate limiter for authentication endpoints
 * (login, register, forgot-password, etc.).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  statusCode: HTTP_STATUS.BAD_REQUEST,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
