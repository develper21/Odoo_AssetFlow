/**
 * @fileoverview Express async handler wrapper.
 * Wraps an async route handler so that any rejected promise
 * is automatically forwarded to Express's next() error handler,
 * eliminating the need for try/catch in every controller.
 *
 * Usage:
 *   router.get('/items', asyncHandler(async (req, res) => { ... }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
