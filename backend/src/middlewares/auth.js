/**
 * @fileoverview Authentication & authorization middlewares.
 *
 * protect  – Verifies JWT from Authorization header or cookie,
 *            loads the user document, and attaches it to req.user.
 *
 * authorize – Restricts access to one or more roles.
 */

const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/errors/AppError');
const asyncHandler = require('./asyncHandler');
const { HTTP_STATUS } = require('../constants');

// Lazy-require to avoid circular dependency issues at startup.
// The User model file may not exist yet, but will at runtime.
let User;
const getUser = () => {
  if (!User) {
    User = require('../models/User');
  }
  return User;
};

/**
 * Middleware: Protect routes – require a valid JWT.
 *
 * Token lookup order:
 *  1. Authorization: Bearer <token>
 *  2. req.cookies.token
 */
const protect = asyncHandler(async (req, _res, next) => {
  let token;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fallback to cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new AppError('Access denied. No authentication token provided.', HTTP_STATUS.UNAUTHORIZED),
    );
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Attach user (excluding password) to the request
    const UserModel = getUser();
    const currentUser = await UserModel.findById(decoded.id).select('-password');

    if (!currentUser) {
      return next(
        new AppError('The user associated with this token no longer exists.', HTTP_STATUS.UNAUTHORIZED),
      );
    }

    // Optional: check if user is active
    if (currentUser.isActive === false) {
      return next(
        new AppError('Your account has been deactivated. Contact an administrator.', HTTP_STATUS.FORBIDDEN),
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(
      new AppError('Access denied. Invalid or expired token.', HTTP_STATUS.UNAUTHORIZED),
    );
  }
});

/**
 * Middleware factory: Restrict access to specific roles.
 *
 * Usage:
 *   router.delete('/asset/:id', protect, authorize('admin', 'asset_manager'), deleteAsset);
 *
 * @param  {...string} roles  Allowed role strings
 * @returns {Function}        Express middleware
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required before authorization check.', HTTP_STATUS.UNAUTHORIZED),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource.`,
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
