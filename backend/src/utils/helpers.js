/**
 * @fileoverview General-purpose helper functions.
 */

const { v4: uuidv4 } = require('uuid');
const { PAGINATION } = require('../constants');

/**
 * Generate a unique employee ID in the format EMP-XXXXXXXX.
 * Uses the first 8 hex characters of a UUID v4.
 *
 * @returns {string} e.g. "EMP-a1b2c3d4"
 */
const generateEmployeeId = () => {
  const segment = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `EMP-${segment}`;
};

/**
 * Convert a string to a URL-friendly slug.
 *
 * @param {string} text  Raw text (e.g. "IT Department")
 * @returns {string}     Slug (e.g. "it-department")
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')     // Remove non-word characters
    .replace(/--+/g, '-')        // Collapse consecutive hyphens
    .replace(/^-+/, '')          // Trim leading hyphens
    .replace(/-+$/, '');         // Trim trailing hyphens
};

/**
 * Build pagination parameters from raw query values.
 * Clamps limit to PAGINATION.MAX_LIMIT and ensures page >= 1.
 *
 * @param {number|string} [rawPage]   Requested page number
 * @param {number|string} [rawLimit]  Requested items per page
 * @returns {{ skip: number, limit: number, page: number }}
 */
const buildPaginationQuery = (rawPage, rawLimit) => {
  let page = parseInt(rawPage, 10) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(rawLimit, 10) || PAGINATION.DEFAULT_LIMIT;

  // Enforce bounds
  if (page < 1) page = 1;
  if (limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  const skip = (page - 1) * limit;

  return { skip, limit, page };
};

module.exports = {
  generateEmployeeId,
  slugify,
  buildPaginationQuery,
};
