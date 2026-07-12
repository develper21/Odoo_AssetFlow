/**
 * @fileoverview Named error codes with default messages.
 * Controllers and services throw AppError with these codes so that
 * error messages stay consistent across the API.
 */

const ERROR_CODES = Object.freeze({
  // ── Authentication ──────────────────────────────────────────
  AUTH_NO_TOKEN: {
    code: 'AUTH_NO_TOKEN',
    message: 'Access denied. No authentication token provided.',
    statusCode: 401,
  },
  AUTH_INVALID_TOKEN: {
    code: 'AUTH_INVALID_TOKEN',
    message: 'Access denied. Invalid or expired token.',
    statusCode: 401,
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    message: 'Access denied. Token has expired. Please log in again.',
    statusCode: 401,
  },
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    message: 'Invalid email or password.',
    statusCode: 401,
  },
  AUTH_ACCOUNT_DISABLED: {
    code: 'AUTH_ACCOUNT_DISABLED',
    message: 'Your account has been deactivated. Contact an administrator.',
    statusCode: 403,
  },

  // ── Authorization ───────────────────────────────────────────
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action.',
    statusCode: 403,
  },

  // ── Resource ────────────────────────────────────────────────
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    message: 'The requested resource was not found.',
    statusCode: 404,
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 'RESOURCE_ALREADY_EXISTS',
    message: 'A resource with the given identifier already exists.',
    statusCode: 409,
  },

  // ── Validation ──────────────────────────────────────────────
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'One or more fields failed validation.',
    statusCode: 400,
  },
  INVALID_OBJECT_ID: {
    code: 'INVALID_OBJECT_ID',
    message: 'The provided ID is not a valid identifier.',
    statusCode: 400,
  },

  // ── Asset ───────────────────────────────────────────────────
  ASSET_NOT_AVAILABLE: {
    code: 'ASSET_NOT_AVAILABLE',
    message: 'This asset is not currently available for allocation.',
    statusCode: 400,
  },
  ASSET_ALREADY_ALLOCATED: {
    code: 'ASSET_ALREADY_ALLOCATED',
    message: 'This asset is already allocated to another user.',
    statusCode: 409,
  },

  // ── Booking ─────────────────────────────────────────────────
  BOOKING_CONFLICT: {
    code: 'BOOKING_CONFLICT',
    message: 'The requested time slot conflicts with an existing booking.',
    statusCode: 409,
  },
  BOOKING_PAST_DATE: {
    code: 'BOOKING_PAST_DATE',
    message: 'Cannot create a booking in the past.',
    statusCode: 400,
  },

  // ── Transfer ────────────────────────────────────────────────
  TRANSFER_INVALID_STATUS: {
    code: 'TRANSFER_INVALID_STATUS',
    message: 'Transfer cannot be updated in its current status.',
    statusCode: 400,
  },

  // ── Maintenance ─────────────────────────────────────────────
  MAINTENANCE_INVALID_STATUS: {
    code: 'MAINTENANCE_INVALID_STATUS',
    message: 'Maintenance request cannot be updated in its current status.',
    statusCode: 400,
  },

  // ── Server ──────────────────────────────────────────────────
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  },
  EMAIL_SEND_FAILED: {
    code: 'EMAIL_SEND_FAILED',
    message: 'Failed to send email notification.',
    statusCode: 500,
  },
});

module.exports = ERROR_CODES;
