const { body } = require('express-validator');

/**
 * @desc Validation rules for creating a new asset category
 * Requires name and code; depreciation and lifecycle fields are optional
 */
const createCategoryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Category code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Category code must be between 2 and 20 characters')
    .isAlphanumeric()
    .withMessage('Category code must contain only letters and numbers'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Parent category must be a valid category ID'),

  body('depreciationRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Depreciation rate must be between 0 and 100'),

  body('usefulLifeYears')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Useful life years must be a non-negative integer'),
];

/**
 * @desc Validation rules for updating an existing asset category
 * All fields are optional — only provided fields are validated
 */
const updateCategoryRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),

  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Category code must be between 2 and 20 characters')
    .isAlphanumeric()
    .withMessage('Category code must contain only letters and numbers'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Parent category must be a valid category ID'),

  body('depreciationRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Depreciation rate must be between 0 and 100'),

  body('usefulLifeYears')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Useful life years must be a non-negative integer'),
];

module.exports = {
  createCategoryRules,
  updateCategoryRules,
};
