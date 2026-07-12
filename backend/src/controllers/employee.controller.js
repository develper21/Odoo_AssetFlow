const EmployeeService = require('../services/employee.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Get all employees with filtering and pagination
 * @route   GET /api/v1/employees
 * @access  Private/Admin, Department Head
 */
const getEmployees = asyncHandler(async (req, res) => {
  const result = await EmployeeService.getAll(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Employees retrieved successfully', {
    employees: result.employees,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * @desc    Get a single employee by ID
 * @route   GET /api/v1/employees/:id
 * @access  Private/Admin, Department Head
 */
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.getById(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Employee retrieved successfully', {
    employee,
  });
});

/**
 * @desc    Update an employee's profile
 * @route   PUT /api/v1/employees/:id
 * @access  Private/Admin
 */
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.update(
    req.params.id,
    req.body,
    req.user.id
  );
  sendSuccess(res, HTTP_STATUS.OK, 'Employee updated successfully', {
    employee,
  });
});

/**
 * @desc    Promote an employee to a new role
 * @route   PATCH /api/v1/employees/:id/promote
 * @access  Private/Admin
 */
const promoteEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.promote(
    req.params.id,
    req.body.role,
    req.user.id
  );
  sendSuccess(res, HTTP_STATUS.OK, 'Employee role updated successfully', {
    employee,
  });
});

/**
 * @desc    Deactivate an employee account
 * @route   PATCH /api/v1/employees/:id/deactivate
 * @access  Private/Admin
 */
const deactivateEmployee = asyncHandler(async (req, res) => {
  const employee = await EmployeeService.deactivate(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Employee deactivated successfully', {
    employee,
  });
});

module.exports = {
  getEmployees,
  getEmployee,
  updateEmployee,
  promoteEmployee,
  deactivateEmployee,
};
