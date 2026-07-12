const TransferService = require('../services/transfer.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Request an asset transfer to another user
 * @route   POST /api/v1/transfers/request
 * @access  Private/Employee, Department Head, Asset Manager, Admin
 */
const createRequest = asyncHandler(async (req, res) => {
  const transfer = await TransferService.createRequest(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Transfer request submitted successfully', {
    transfer,
  });
});

/**
 * @desc    Approve a transfer request
 * @route   PATCH /api/v1/transfers/:id/approve
 * @access  Private/Admin, Asset Manager, Department Head
 */
const approveRequest = asyncHandler(async (req, res) => {
  const transfer = await TransferService.approveRequest(req.params.id, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Transfer request approved successfully', {
    transfer,
  });
});

/**
 * @desc    Reject a transfer request
 * @route   PATCH /api/v1/transfers/:id/reject
 * @access  Private/Admin, Asset Manager, Department Head
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const transfer = await TransferService.rejectRequest(req.params.id, req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Transfer request rejected successfully', {
    transfer,
  });
});

/**
 * @desc    Get all transfer requests with pagination
 * @route   GET /api/v1/transfers
 * @access  Private
 */
const getTransfers = asyncHandler(async (req, res) => {
  const result = await TransferService.getAll(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Transfer requests retrieved successfully', {
    transfers: result.transfers,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

module.exports = {
  createRequest,
  approveRequest,
  rejectRequest,
  getTransfers,
};
