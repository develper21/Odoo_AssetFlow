const DepartmentService = require('../services/department.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Create a new department
 * @route   POST /api/v1/departments
 * @access  Private/Admin
 */
const createDepartment = asyncHandler(async (req, res) => {
  const department = await DepartmentService.create(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Department created successfully', {
    department,
  });
});

/**
 * @desc    Get all departments with filtering and pagination
 * @route   GET /api/v1/departments
 * @access  Private
 */
const getDepartments = asyncHandler(async (req, res) => {
  const result = await DepartmentService.getAll(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Departments retrieved successfully', {
    departments: result.departments,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * @desc    Get a single department by ID
 * @route   GET /api/v1/departments/:id
 * @access  Private
 */
const getDepartment = asyncHandler(async (req, res) => {
  const department = await DepartmentService.getById(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Department retrieved successfully', {
    department,
  });
});

/**
 * @desc    Update a department
 * @route   PUT /api/v1/departments/:id
 * @access  Private/Admin
 */
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await DepartmentService.update(req.params.id, req.body);
  sendSuccess(res, HTTP_STATUS.OK, 'Department updated successfully', {
    department,
  });
});

/**
 * @desc    Activate a department
 * @route   PATCH /api/v1/departments/:id/activate
 * @access  Private/Admin
 */
const activateDepartment = asyncHandler(async (req, res) => {
  const department = await DepartmentService.activate(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Department activated successfully', {
    department,
  });
});

/**
 * @desc    Deactivate a department
 * @route   PATCH /api/v1/departments/:id/deactivate
 * @access  Private/Admin
 */
const deactivateDepartment = asyncHandler(async (req, res) => {
  const department = await DepartmentService.deactivate(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Department deactivated successfully', {
    department,
  });
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  activateDepartment,
  deactivateDepartment,
};
