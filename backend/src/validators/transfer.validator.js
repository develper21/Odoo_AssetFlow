const { body } = require('express-validator');

const requestRules = [
  body('asset')
    .notEmpty()
    .withMessage('Asset ID is required')
    .isMongoId()
    .withMessage('Asset ID must be a valid MongoDB ObjectId'),

  body('toUser')
    .notEmpty()
    .withMessage('Target user ID (toUser) is required')
    .isMongoId()
    .withMessage('Target user ID must be a valid MongoDB ObjectId'),

  body('toDepartment')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Target department ID must be a valid MongoDB ObjectId'),

  body('requestReason')
    .trim()
    .notEmpty()
    .withMessage('Request reason is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Request reason must be between 5 and 500 characters'),
];

const approveRules = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const rejectRules = [
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Rejection reason must be between 3 and 500 characters'),
];

module.exports = {
  requestRules,
  approveRules,
  rejectRules,
};
