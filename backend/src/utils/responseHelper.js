/**
 * @fileoverview Standardised JSON response helpers.
 * Every API response passes through one of these functions
 * to guarantee a consistent envelope shape.
 *
 * Envelope:
 * {
 *   "success": true | false,
 *   "message": "Human-readable message",
 *   "data":    { ... } | null,
 *   "meta":    { "pagination": { page, limit, total, pages } } | undefined
 * }
 */

const { HTTP_STATUS } = require('../constants');

/**
 * Send a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {number}  statusCode  HTTP status (default 200)
 * @param {string}  message     Human-readable success message
 * @param {*}       [data=null] Payload
 * @param {Object}  [meta]      Optional metadata (pagination, etc.)
 */
const sendSuccess = (res, statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = undefined) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error JSON response.
 *
 * @param {import('express').Response} res
 * @param {number}  statusCode  HTTP status (default 500)
 * @param {string}  message     Human-readable error message
 * @param {Array}   [errors]    Optional field-level validation errors
 */
const sendError = (res, statusCode = HTTP_STATUS.INTERNAL_SERVER, message = 'Something went wrong', errors = undefined) => {
  const response = {
    success: false,
    message,
  };

  if (errors && errors.length) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response.
 *
 * @param {import('express').Response} res
 * @param {Array}   data    Array of documents
 * @param {number}  page    Current page
 * @param {number}  limit   Items per page
 * @param {number}  total   Total matching documents
 * @param {string}  [message='Success'] Human-readable message
 */
const sendPaginated = (res, statusCode, message, payload) => {
  const { total, page, limit, ...data } = payload;
  const pages = Math.ceil(total / limit) || 0;

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
