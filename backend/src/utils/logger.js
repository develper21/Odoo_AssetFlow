/**
 * @fileoverview Lightweight colour-coded console logger.
 * Provides info / warn / error / debug methods with timestamps.
 * In production, this can be swapped for a transport-backed logger
 * (e.g. Winston) without changing call-sites.
 */

// ANSI colour codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
};

/**
 * Returns an ISO-style timestamp string for log prefixes.
 * @returns {string}
 */
const timestamp = () => new Date().toISOString();

/**
 * @namespace logger
 */
const logger = {
  /**
   * Informational messages (server start, DB connected, etc.)
   * @param {string} message
   * @param  {...any} args  Additional values to log
   */
  info(message, ...args) {
    console.log(
      `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.green}[INFO]${COLORS.reset}  ${message}`,
      ...args,
    );
  },

  /**
   * Warnings that do not halt execution but deserve attention.
   * @param {string} message
   * @param  {...any} args
   */
  warn(message, ...args) {
    console.warn(
      `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.yellow}[WARN]${COLORS.reset}  ${message}`,
      ...args,
    );
  },

  /**
   * Error-level messages (failed DB connection, unhandled rejection, etc.)
   * @param {string} message
   * @param  {...any} args
   */
  error(message, ...args) {
    console.error(
      `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.red}[ERROR]${COLORS.reset} ${message}`,
      ...args,
    );
  },

  /**
   * Debug-level messages; only printed when NODE_ENV !== 'production'.
   * @param {string} message
   * @param  {...any} args
   */
  debug(message, ...args) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.magenta}[DEBUG]${COLORS.reset} ${message}`,
        ...args,
      );
    }
  },
};

module.exports = logger;
