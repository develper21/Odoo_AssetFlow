/**
 * @fileoverview Custom application error class.
 * Extends the native Error to carry an HTTP status code and
 * an operational flag so the global error handler can distinguish
 * programmer bugs from expected failures.
 */

class AppError extends Error {
  /**
   * @param {string} message  Human-readable error description.
   * @param {number} statusCode  HTTP status code (e.g. 400, 404, 500).
   */
  constructor(message, statusCode) {
    super(message);

    /** @type {number} HTTP status code */
    this.statusCode = statusCode;

    /** @type {'fail'|'error'} 4xx → fail, 5xx → error */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    /**
     * Operational errors are expected (bad input, not found, etc.).
     * Non-operational errors are programming bugs that should be logged.
     */
    this.isOperational = true;

    // Exclude this constructor from the stack trace for cleaner output
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
