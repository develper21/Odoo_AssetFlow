const { body } = require('express-validator');

/**
 * @desc Validation rules for updating employee profile
 * All fields are optional — role changes must use the promote endpoint
 */
const updateEmployeeRules = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation must not exceed 100 characters'),

  body('department')
    .optional()
    .isMongoId()
    .withMessage('Department must be a valid department ID'),
];

/**
 * @desc Validation rules for promoting an employee to a new role
 * Role must be one of the four defined application roles
 */
const promoteEmployeeRules = [
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'asset_manager', 'department_head', 'employee'])
    .withMessage(
      'Role must be one of: admin, asset_manager, department_head, employee'
    ),
];

module.exports = {
  updateEmployeeRules,
  promoteEmployeeRules,
};
