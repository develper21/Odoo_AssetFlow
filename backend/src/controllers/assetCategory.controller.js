const AssetCategoryService = require('../services/assetCategory.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Create a new asset category
 * @route   POST /api/v1/asset-categories
 * @access  Private/Admin, Asset Manager
 */
const createCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategoryService.create(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Asset category created successfully', {
    category,
  });
});

/**
 * @desc    Get all asset categories with filtering and pagination
 * @route   GET /api/v1/asset-categories
 * @access  Private
 */
const getCategories = asyncHandler(async (req, res) => {
  const result = await AssetCategoryService.getAll(req.query);
  sendPaginated(
    res,
    HTTP_STATUS.OK,
    'Asset categories retrieved successfully',
    {
      categories: result.categories,
      total: result.total,
      page: result.page,
      limit: result.limit,
    }
  );
});

/**
 * @desc    Get a single asset category by ID
 * @route   GET /api/v1/asset-categories/:id
 * @access  Private
 */
const getCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategoryService.getById(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset category retrieved successfully', {
    category,
  });
});

/**
 * @desc    Update an asset category
 * @route   PUT /api/v1/asset-categories/:id
 * @access  Private/Admin, Asset Manager
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategoryService.update(req.params.id, req.body);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset category updated successfully', {
    category,
  });
});

/**
 * @desc    Activate an asset category
 * @route   PATCH /api/v1/asset-categories/:id/activate
 * @access  Private/Admin, Asset Manager
 */
const activateCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategoryService.activate(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset category activated successfully', {
    category,
  });
});

/**
 * @desc    Deactivate an asset category
 * @route   PATCH /api/v1/asset-categories/:id/deactivate
 * @access  Private/Admin, Asset Manager
 */
const deactivateCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategoryService.deactivate(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset category deactivated successfully', {
    category,
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  activateCategory,
  deactivateCategory,
};
