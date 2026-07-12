const AssetCategory = require('../models/AssetCategory');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class AssetCategoryService
 * @desc Handles all asset category business logic including CRUD,
 *       search, pagination, and status management.
 */
class AssetCategoryService {
  /**
   * @desc Create a new asset category
   * @param {Object} data - Category data
   * @param {string} userId - ID of the user creating the category
   * @returns {Object} Created category with populated references
   * @throws {AppError} If category code already exists
   */
  static async create(data, userId) {
    // Set the creator
    data.createdBy = userId;

    // Check for duplicate category code
    const existingCategory = await AssetCategory.findOne({ code: data.code });
    if (existingCategory) {
      throw new AppError(
        `Asset category with code '${data.code}' already exists`,
        HTTP_STATUS.CONFLICT
      );
    }

    const category = await AssetCategory.create(data);

    // Return with populated parent category for immediate UI consumption
    const populated = await AssetCategory.findById(category._id).populate(
      'parentCategory',
      'name code'
    );

    return populated;
  }

  /**
   * @desc Get all asset categories with filtering, searching, and pagination
   * @param {Object} query - Query parameters from request
   * @returns {Object} Paginated categories result { categories, total, page, limit }
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
    const [categories, total] = await Promise.all([
      AssetCategory.find(filter)
        .populate('parentCategory', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AssetCategory.countDocuments(filter),
    ]);

    return { categories, total, page, limit };
  }

  /**
   * @desc Get a single asset category by ID
   * @param {string} id - Category MongoDB ObjectId
   * @returns {Object} Category with populated references
   * @throws {AppError} If category not found
   */
  static async getById(id) {
    const category = await AssetCategory.findById(id).populate(
      'parentCategory',
      'name code'
    );

    if (!category) {
      throw new AppError('Asset category not found', HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  /**
   * @desc Update an asset category by ID
   * @param {string} id - Category MongoDB ObjectId
   * @param {Object} data - Fields to update
   * @returns {Object} Updated category
   * @throws {AppError} If category not found
   */
  static async update(id, data) {
    const category = await AssetCategory.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('parentCategory', 'name code');

    if (!category) {
      throw new AppError('Asset category not found', HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  /**
   * @desc Activate an asset category
   * @param {string} id - Category MongoDB ObjectId
   * @returns {Object} Updated category with isActive = true
   * @throws {AppError} If category not found
   */
  static async activate(id) {
    const category = await AssetCategory.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!category) {
      throw new AppError('Asset category not found', HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  /**
   * @desc Deactivate an asset category
   * @param {string} id - Category MongoDB ObjectId
   * @returns {Object} Updated category with isActive = false
   * @throws {AppError} If category not found
   */
  static async deactivate(id) {
    const category = await AssetCategory.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      throw new AppError('Asset category not found', HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }
}

module.exports = AssetCategoryService;
