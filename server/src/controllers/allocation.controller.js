const AllocationService = require('../services/allocation.service');
const Allocation = require('../models/Allocation');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @desc    Get all allocations with pagination
 * @route   GET /api/v1/allocations
 * @access  Private
 */
const getAllAllocations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query.page, req.query.limit);

  const [allocations, total] = await Promise.all([
    Allocation.find()
      .populate('asset', 'name assetTag serialNumber')
      .populate('allocatedTo', 'firstName lastName email')
      .populate('allocatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Allocation.countDocuments(),
  ]);

  sendPaginated(res, HTTP_STATUS.OK, 'Allocations retrieved successfully', {
    allocations,
    total,
    page,
    limit,
  });
});

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
  getAllAllocations,
};
