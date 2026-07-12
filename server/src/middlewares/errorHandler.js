/**
 * @fileoverview Global Express error handler.
 *
 * Catches all errors forwarded via next(err) and responds with
 * a consistent JSON envelope. Handles:
 *   - AppError (operational / expected errors)
 *   - Mongoose CastError (invalid ObjectId)
 *   - Mongoose ValidationError (schema validation)
 *   - MongoDB duplicate key (code 11000)
 *   - JWT errors (JsonWebTokenError, TokenExpiredError)
 *   - Unknown / unexpected errors
 *
 * In development mode the stack trace is included; in production
 * it is omitted for security.
 */

const AppError = require('../utils/errors/AppError');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../constants');

/**
 * Normalise a Mongoose CastError into an AppError.
 * @param {Error} err
 * @returns {AppError}
 */
const handleCastError = (err) => {
  const message = `Invalid value '${err.value}' for field '${err.path}'.`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Normalise a Mongoose ValidationError into an AppError.
 * @param {Error} err
 * @returns {AppError}
 */
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  const message = `Validation failed: ${messages.join('. ')}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Normalise a MongoDB duplicate key error into an AppError.
 * @param {Error} err
 * @returns {AppError}
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {}).join(', ');
  const value = Object.values(err.keyValue || {}).join(', ');
  const message = `Duplicate value '${value}' for field '${field}'. Please use a different value.`;
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Normalise a JWT verification error into an AppError.
 * @returns {AppError}
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Normalise a JWT expiration error into an AppError.
 * @returns {AppError}
 */
const handleJWTExpiredError = () => {
  return new AppError('Token has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
};

// ── Main error handler ────────────────────────────────────────

/**
 * Express error-handling middleware (4 params).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Clone so mutations don't affect the original
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // ── Mongoose CastError ────────────────────────────────────
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // ── Mongoose ValidationError ──────────────────────────────
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // ── MongoDB duplicate key ─────────────────────────────────
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // ── JWT errors ────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Determine final status code
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER;

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`${statusCode} – ${error.message}`);
    if (error.stack) {
      logger.debug(error.stack);
    }
  }

  // Build response
  const response = {
    success: false,
    message: error.isOperational
      ? error.message
      : 'An unexpected error occurred. Please try again later.',
  };

  // Include stack trace in development for debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    // For non-operational errors, show the real message in dev
    if (!error.isOperational) {
      response.message = error.message || response.message;
    }
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
