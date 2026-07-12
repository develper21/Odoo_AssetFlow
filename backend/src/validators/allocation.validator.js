const { body } = require('express-validator');

const allocateRules = [
  body('asset')
    .notEmpty()
    .withMessage('Asset ID is required')
    .isMongoId()
    .withMessage('Asset ID must be a valid MongoDB ObjectId'),

  body('allocateToType')
    .notEmpty()
    .withMessage('Allocation target type is required')
    .isIn(['User', 'Department'])
    .withMessage('Allocation target type must be either User or Department'),

  body('allocatedTo')
    .notEmpty()
    .withMessage('Allocation target ID (allocatedTo) is required')
    .isMongoId()
    .withMessage('Allocation target ID must be a valid MongoDB ObjectId'),

  body('expectedReturnDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Expected return date must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expected return date must be in the future');
      }
      return true;
    }),

  body('checkOutCondition')
    .trim()
    .notEmpty()
    .withMessage('Check-out condition description is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Check-out condition description must be between 2 and 500 characters'),
];

const returnRules = [
  body('checkInCondition')
    .trim()
    .notEmpty()
    .withMessage('Check-in condition is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Check-in condition description must be between 2 and 500 characters'),

  body('checkInNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Check-in notes cannot exceed 1000 characters'),
];

module.exports = {
  allocateRules,
  returnRules,
};
