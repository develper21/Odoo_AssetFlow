const MaintenanceService = require('../services/maintenance.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Raise a new maintenance request
 * @route   POST /api/v1/maintenance
 * @access  Private
 */
const createRequest = asyncHandler(async (req, res) => {
  const request = await MaintenanceService.createRequest(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Maintenance request raised successfully', {
    request,
  });
});

/**
 * @desc    Transition status of a maintenance request (state machine)
 * @route   PATCH /api/v1/maintenance/:id/status
 * @access  Private
 */
const transitionStatus = asyncHandler(async (req, res) => {
  const { status, ...extraData } = req.body;
  const request = await MaintenanceService.updateStatus(req.params.id, status, extraData, req.user);
  sendSuccess(res, HTTP_STATUS.OK, `Maintenance request status updated to ${status} successfully`, {
    request,
  });
});

/**
 * @desc    List maintenance requests with pagination and filters
 * @route   GET /api/v1/maintenance
 * @access  Private
 */
const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const result = await MaintenanceService.getAll(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Maintenance requests retrieved successfully', {
    requests: result.requests,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * @desc    Get maintenance history list for a specific asset
 * @route   GET /api/v1/maintenance/asset/:assetId
 * @access  Private
 */
const getAssetMaintenanceHistory = asyncHandler(async (req, res) => {
  const history = await MaintenanceService.getByAsset(req.params.assetId);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset maintenance history retrieved successfully', {
    history,
  });
});

module.exports = {
  createRequest,
  transitionStatus,
  getMaintenanceRequests,
  getAssetMaintenanceHistory,
};
