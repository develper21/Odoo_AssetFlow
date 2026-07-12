const AssetService = require('../services/asset.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Register a new asset
 * @route   POST /api/v1/assets
 * @access  Private/Admin, Asset Manager
 */
const createAsset = asyncHandler(async (req, res) => {
  const asset = await AssetService.create(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Asset registered successfully', {
    asset,
  });
});

/**
 * @desc    Get all assets with filtering, searching, and pagination
 * @route   GET /api/v1/assets
 * @access  Private
 */
const getAssets = asyncHandler(async (req, res) => {
  const result = await AssetService.getAll(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Assets retrieved successfully', {
    assets: result.assets,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * @desc    Get a single asset's details by ID including history
 * @route   GET /api/v1/assets/:id
 * @access  Private
 */
const getAsset = asyncHandler(async (req, res) => {
  const asset = await AssetService.getById(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset details retrieved successfully', {
    asset,
  });
});

/**
 * @desc    Update asset details
 * @route   PUT /api/v1/assets/:id
 * @access  Private/Admin, Asset Manager
 */
const updateAsset = asyncHandler(async (req, res) => {
  const asset = await AssetService.update(req.params.id, req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset details updated successfully', {
    asset,
  });
});

/**
 * @desc    Retire/Soft delete an asset
 * @route   DELETE /api/v1/assets/:id
 * @access  Private/Admin, Asset Manager
 */
const retireAsset = asyncHandler(async (req, res) => {
  const asset = await AssetService.retire(req.params.id, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset retired successfully', {
    asset,
  });
});

/**
 * @desc    Get asset metrics summary
 * @route   GET /api/v1/assets/summary
 * @access  Private/Admin, Asset Manager
 */
const getAssetSummary = asyncHandler(async (req, res) => {
  const summary = await AssetService.getSummary();
  sendSuccess(res, HTTP_STATUS.OK, 'Asset summary metrics retrieved successfully', {
    summary,
  });
});

module.exports = {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  retireAsset,
  getAssetSummary,
};
