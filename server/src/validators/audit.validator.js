const { body } = require('express-validator');

const createAuditCycleRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Audit cycle name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('department')
    .optional()
    .isMongoId()
    .withMessage('Department ID must be a valid MongoDB ObjectId'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after the start date');
      }
      return true;
    }),

  body('auditors')
    .isArray({ min: 1 })
    .withMessage('Auditors list must be an array with at least one auditor ID'),

  body('auditors.*')
    .isMongoId()
    .withMessage('Each auditor must be a valid MongoDB ObjectId'),
];

const verifyAssetRules = [
  body('status')
    .notEmpty()
    .withMessage('Verification status is required')
    .isIn(['verified', 'missing', 'damaged'])
    .withMessage('Status must be verified, missing, or damaged'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

module.exports = {
  createAuditCycleRules,
  verifyAssetRules,
};
