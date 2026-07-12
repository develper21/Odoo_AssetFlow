const { body } = require('express-validator');

const createAssetRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Asset name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Asset name must be between 2 and 100 characters'),

  body('serialNumber')
    .trim()
    .notEmpty()
    .withMessage('Serial number is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial number must be between 1 and 100 characters'),

  body('category')
    .notEmpty()
    .withMessage('Asset category is required')
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),

  body('acquisitionDate')
    .notEmpty()
    .withMessage('Acquisition date is required')
    .isISO8601()
    .withMessage('Acquisition date must be a valid ISO8601 date'),

  body('acquisitionCost')
    .notEmpty()
    .withMessage('Acquisition cost is required')
    .isFloat({ min: 0 })
    .withMessage('Acquisition cost must be a positive number'),

  body('condition')
    .optional()
    .isIn(['new', 'good', 'fair', 'damaged', 'poor'])
    .withMessage('Condition must be one of: new, good, fair, damaged, poor'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),

  body('isBookable')
    .optional()
    .isBoolean()
    .withMessage('isBookable must be a boolean value'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('photo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Photo must be a valid URL'),

  body('documents')
    .optional()
    .isArray()
    .withMessage('Documents must be an array of string URLs'),

  body('documents.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Each document must be a valid URL'),
];

const updateAssetRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Asset name must be between 2 and 100 characters'),

  body('serialNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial number must be between 1 and 100 characters'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),

  body('acquisitionDate')
    .optional()
    .isISO8601()
    .withMessage('Acquisition date must be a valid ISO8601 date'),

  body('acquisitionCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Acquisition cost must be a positive number'),

  body('condition')
    .optional()
    .isIn(['new', 'good', 'fair', 'damaged', 'poor'])
    .withMessage('Condition must be one of: new, good, fair, damaged, poor'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),

  body('isBookable')
    .optional()
    .isBoolean()
    .withMessage('isBookable must be a boolean value'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('photo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Photo must be a valid URL'),

  body('documents')
    .optional()
    .isArray()
    .withMessage('Documents must be an array of string URLs'),

  body('documents.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Each document must be a valid URL'),
];

module.exports = {
  createAssetRules,
  updateAssetRules,
};
