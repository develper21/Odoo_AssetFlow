const { body } = require('express-validator');

const createBookingRules = [
  body('resource')
    .notEmpty()
    .withMessage('Resource (Asset ID) is required')
    .isMongoId()
    .withMessage('Resource ID must be a valid MongoDB ObjectId'),

  body('startDateTime')
    .notEmpty()
    .withMessage('Start date and time is required')
    .isISO8601()
    .withMessage('Start date and time must be a valid ISO8601 datetime')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date and time must be in the future');
      }
      return true;
    }),

  body('endDateTime')
    .notEmpty()
    .withMessage('End date and time is required')
    .isISO8601()
    .withMessage('End date and time must be a valid ISO8601 datetime')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date and time must be after the start date and time');
      }
      return true;
    }),

  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose of booking is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Purpose must be between 2 and 200 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const rescheduleRules = [
  body('startDateTime')
    .notEmpty()
    .withMessage('Start date and time is required')
    .isISO8601()
    .withMessage('Start date and time must be a valid ISO8601 datetime')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date and time must be in the future');
      }
      return true;
    }),

  body('endDateTime')
    .notEmpty()
    .withMessage('End date and time is required')
    .isISO8601()
    .withMessage('End date and time must be a valid ISO8601 datetime')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date and time must be after the start date and time');
      }
      return true;
    }),
];

module.exports = {
  createBookingRules,
  rescheduleRules,
};
