const AllocationService = require('../services/allocation.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Allocate an asset (check-out)
 * @route   POST /api/v1/allocations/checkout
 * @access  Private/Admin, Asset Manager
 */
const allocateAsset = asyncHandler(async (req, res) => {
  const allocation = await AllocationService.allocate(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Asset checked out successfully', {
    allocation,
  });
});

/**
 * @desc    Return an asset (check-in)
 * @route   POST /api/v1/allocations/check-in/:id
 * @access  Private/Admin, Asset Manager
 */
const returnAsset = asyncHandler(async (req, res) => {
  const allocation = await AllocationService.returnAsset(req.params.id, req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Asset checked in successfully', {
    allocation,
  });
});

/**
 * @desc    Get overdue allocations list
 * @route   GET /api/v1/allocations/overdue
 * @access  Private/Admin, Asset Manager
 */
const getOverdueAllocations = asyncHandler(async (req, res) => {
  const result = await AllocationService.getOverdueAllocations(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Overdue allocations retrieved successfully', {
    allocations: result.allocations,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

module.exports = {
  allocateAsset,
  returnAsset,
  getOverdueAllocations,
};
