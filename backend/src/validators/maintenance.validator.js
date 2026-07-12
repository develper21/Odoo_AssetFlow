const { body } = require('express-validator');

const createMaintenanceRules = [
  body('asset')
    .notEmpty()
    .withMessage('Asset ID is required')
    .isMongoId()
    .withMessage('Asset ID must be a valid MongoDB ObjectId'),

  body('issueDescription')
    .trim()
    .notEmpty()
    .withMessage('Issue description is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Issue description must be between 5 and 1000 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array of string URLs'),

  body('attachments.*')
    .optional()
    .trim()
    .isURL()
    .withMessage('Each attachment must be a valid URL'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const assignTechnicianRules = [
  body('technician')
    .notEmpty()
    .withMessage('Technician User ID is required')
    .isMongoId()
    .withMessage('Technician ID must be a valid MongoDB ObjectId'),
];

const rejectMaintenanceRules = [
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Rejection reason must be between 3 and 500 characters'),
];

module.exports = {
  createMaintenanceRules,
  assignTechnicianRules,
  rejectMaintenanceRules,
};
