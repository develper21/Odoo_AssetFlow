const Department = require('../models/Department');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class DepartmentService
 * @desc Handles all department-related business logic including CRUD,
 *       search, pagination, and status management.
 */
class DepartmentService {
  /**
   * @desc Create a new department
   * @param {Object} data - Department data
   * @param {string} userId - ID of the user creating the department
   * @returns {Object} Created department with populated references
   * @throws {AppError} If department code already exists
   */
  static async create(data, userId) {
    // Set the creator
    data.createdBy = userId;

    // Check for duplicate department code
    const existingDept = await Department.findOne({ code: data.code });
    if (existingDept) {
      throw new AppError(
        `Department with code '${data.code}' already exists`,
        HTTP_STATUS.CONFLICT
      );
    }

    const department = await Department.create(data);

    // Return with populated references for immediate UI consumption
    const populated = await Department.findById(department._id)
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('parentDepartment', 'name code');

    return populated;
  }

  /**
   * @desc Get all departments with filtering, searching, and pagination
   * @param {Object} query - Query parameters from request
   * @returns {Object} Paginated departments result { departments, total, page, limit }
   */
  static async getAll(query) {
    const filter = {};

    // Filter by active status if specified
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    // Search by name (case-insensitive partial match)
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    // Build pagination parameters from query string
    const { skip, limit, page } = buildPaginationQuery(query);

    // Execute count and find queries in parallel for performance
    const [departments, total] = await Promise.all([
      Department.find(filter)
        .populate('headOfDepartment', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Department.countDocuments(filter),
    ]);

    return { departments, total, page, limit };
  }

  /**
   * @desc Get a single department by ID
   * @param {string} id - Department MongoDB ObjectId
   * @returns {Object} Department with populated references
   * @throws {AppError} If department not found
   */
  static async getById(id) {
    const department = await Department.findById(id)
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('parentDepartment', 'name code');

    if (!department) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }

    return department;
  }

  /**
   * @desc Update a department by ID
   * @param {string} id - Department MongoDB ObjectId
   * @param {Object} data - Fields to update
   * @returns {Object} Updated department
   * @throws {AppError} If department not found
   */
  static async update(id, data) {
    const department = await Department.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('headOfDepartment', 'firstName lastName email')
      .populate('parentDepartment', 'name code');

    if (!department) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }

    return department;
  }

  /**
   * @desc Activate a department
   * @param {string} id - Department MongoDB ObjectId
   * @returns {Object} Updated department with isActive = true
   * @throws {AppError} If department not found
   */
  static async activate(id) {
    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!department) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }

    return department;
  }

  /**
   * @desc Deactivate a department
   * @param {string} id - Department MongoDB ObjectId
   * @returns {Object} Updated department with isActive = false
   * @throws {AppError} If department not found
   */
  static async deactivate(id) {
    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND);
    }

    return department;
  }
}

module.exports = DepartmentService;
