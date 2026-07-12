const { body } = require('express-validator');

/**
 * @desc Validation rules for creating a new department
 * Requires name and code; all other fields are optional
 */
const createDepartmentRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Department code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Department code must be between 2 and 20 characters')
    .isAlphanumeric()
    .withMessage('Department code must contain only letters and numbers'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('headOfDepartment')
    .optional()
    .isMongoId()
    .withMessage('Head of department must be a valid user ID'),

  body('parentDepartment')
    .optional()
    .isMongoId()
    .withMessage('Parent department must be a valid department ID'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),

  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
];

/**
 * @desc Validation rules for updating an existing department
 * All fields are optional — only provided fields are validated
 */
const updateDepartmentRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),

  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Department code must be between 2 and 20 characters')
    .isAlphanumeric()
    .withMessage('Department code must contain only letters and numbers'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('headOfDepartment')
    .optional()
    .isMongoId()
    .withMessage('Head of department must be a valid user ID'),

  body('parentDepartment')
    .optional()
    .isMongoId()
    .withMessage('Parent department must be a valid department ID'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),

  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
];

module.exports = {
  createDepartmentRules,
  updateDepartmentRules,
};
