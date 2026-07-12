const AuditService = require('../services/audit.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Create a new audit cycle scoped by department/location
 * @route   POST /api/v1/audits
 * @access  Private/Admin, Asset Manager
 */
const createCycle = asyncHandler(async (req, res) => {
  const result = await AuditService.createCycle(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Audit cycle created successfully in draft status', {
    cycle: result.cycle,
    itemsCount: result.itemsCount,
  });
});

/**
 * @desc    Start draft audit cycle
 * @route   POST /api/v1/audits/:id/start
 * @access  Private/Admin, Asset Manager
 */
const startCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditService.startCycle(req.params.id, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Audit cycle started successfully and is now active', {
    cycle,
  });
});

/**
 * @desc    Verify asset status (Auditor action)
 * @route   POST /api/v1/audits/:id/verify/:assetId
 * @access  Private/Auditor
 */
const verifyAsset = asyncHandler(async (req, res) => {
  const item = await AuditService.verifyAsset(req.params.id, req.params.assetId, req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset verification status recorded successfully', {
    item,
  });
});

/**
 * @desc    Finalize audit cycle (Admin/Manager only)
 * @route   POST /api/v1/audits/:id/close
 * @access  Private/Admin, Asset Manager
 */
const closeCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditService.closeCycle(req.params.id, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Audit cycle closed and locked successfully', {
    cycle,
  });
});

/**
 * @desc    Get discrepancy report for a cycle
 * @route   GET /api/v1/audits/:id/discrepancies
 * @access  Private/Admin, Asset Manager, Auditor
 */
const getDiscrepancyReport = asyncHandler(async (req, res) => {
  const discrepancies = await AuditService.getDiscrepancyReport(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Audit discrepancy report retrieved successfully', {
    discrepancies,
  });
});

/**
 * @desc    Get detailed audit cycle with items
 * @route   GET /api/v1/audits/:id
 * @access  Private
 */
const getCycleDetails = asyncHandler(async (req, res) => {
  const result = await AuditService.getCycleDetails(req.params.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Audit cycle details retrieved successfully', {
    cycle: result.cycle,
    items: result.items,
  });
});

/**
 * @desc    List all audit cycles
 * @route   GET /api/v1/audits
 * @access  Private
 */
const getCycles = asyncHandler(async (req, res) => {
  const result = await AuditService.getAllCycles(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Audit cycles retrieved successfully', {
    cycles: result.cycles,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

module.exports = {
  createCycle,
  startCycle,
  verifyAsset,
  closeCycle,
  getDiscrepancyReport,
  getCycleDetails,
  getCycles,
};
