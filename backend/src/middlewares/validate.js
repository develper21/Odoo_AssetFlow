/**
 * @fileoverview Validation middleware for express-validator.
 * Runs the validation result check and returns a 400 with
 * a clean array of field-level errors if validation fails.
 *
 * Usage:
 *   const { body } = require('express-validator');
 *   router.post(
 *     '/register',
 *     [body('email').isEmail().withMessage('Valid email required')],
 *     validate,
 *     registerController,
 *   );
 */

const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants');

/**
 * Express middleware that inspects the express-validator
 * validation result. If errors exist, responds with 400.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Map to a consistent shape: { field, message, value }
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validate;
