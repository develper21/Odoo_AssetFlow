const User = require('../models/User');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class EmployeeService
 * @desc Handles all employee management business logic including
 *       listing, searching, updating, role promotion, and deactivation.
 */
class EmployeeService {
  /**
   * @desc Get all employees with filtering, searching, and pagination
   * @param {Object} query - Query parameters from request
   * @returns {Object} Paginated employees result { employees, total, page, limit }
   */
  static async getAll(query) {
    const filter = {};

    // Filter by role if specified
    if (query.role) {
      filter.role = query.role;
    }

    // Filter by department if specified
    if (query.department) {
      filter.department = query.department;
    }

    // Filter by active status if specified
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    // Search across firstName, lastName, and email (case-insensitive)
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Build pagination parameters from query string
    const { skip, limit, page } = buildPaginationQuery(query);

    // Execute count and find queries in parallel — exclude password field
    const [employees, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return { employees, total, page, limit };
  }

  /**
   * @desc Get a single employee by ID
   * @param {string} id - User MongoDB ObjectId
   * @returns {Object} Employee with populated department (password excluded)
   * @throws {AppError} If employee not found
   */
  static async getById(id) {
    const employee = await User.findById(id)
      .select('-password')
      .populate('department', 'name code');

    if (!employee) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND);
    }

    return employee;
  }

  /**
   * @desc Update employee profile information
   * @param {string} id - User MongoDB ObjectId
   * @param {Object} data - Fields to update
   * @param {string} adminId - ID of the admin performing the update
   * @returns {Object} Updated employee (password excluded)
   * @throws {AppError} If employee not found
   * @note Does NOT allow role or password updates — use promote() for role changes
   */
  static async update(id, data, adminId) {
    // Prevent role updates through this method — use promote() instead
    if (data.role) {
      delete data.role;
    }

    // Prevent password updates through this endpoint
    if (data.password) {
      delete data.password;
    }

    const employee = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('department', 'name code');

    if (!employee) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND);
    }

    return employee;
  }

  /**
   * @desc Promote or change an employee's role
   * @param {string} id - User MongoDB ObjectId
   * @param {string} newRole - The new role to assign
   * @param {string} adminId - ID of the admin performing the promotion
   * @returns {Object} Updated employee with new role
   * @throws {AppError} If employee not found or invalid role
   */
  static async promote(id, newRole, adminId) {
    // Validate that the role is one of the allowed roles
    const validRoles = ['admin', 'asset_manager', 'department_head', 'employee'];
    if (!validRoles.includes(newRole)) {
      throw new AppError(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const employee = await User.findById(id).select('-password');

    if (!employee) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND);
    }

    // Update the role
    employee.role = newRole;
    await employee.save({ validateBeforeSave: false });

    return employee;
  }

  /**
   * @desc Deactivate an employee account
   * @param {string} id - User MongoDB ObjectId
   * @returns {Object} Updated employee with isActive set to false
   * @throws {AppError} If employee not found
   */
  static async deactivate(id) {
    const employee = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!employee) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND);
    }

    return employee;
  }
}

module.exports = EmployeeService;
