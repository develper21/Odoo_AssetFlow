const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const ActivityLogService = require('./activityLog.service');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS, TRANSFER_STATUS, ASSET_STATUS, ALLOCATION_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class TransferService
 * @desc Handles the workflow of requesting, approving, and rejecting asset transfers.
 */
class TransferService {
  /**
   * @desc Request an asset transfer to another user
   * @param {Object} data - Transfer request data
   * @param {string} userId - User requesting the transfer
   * @returns {Promise<Object>} The created transfer request
   */
  static async createRequest(data, userId) {
    const asset = await Asset.findById(data.asset);
    if (!asset) {
      throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND);
    }

    // Business Rule: Only currently allocated assets can be transferred
    if (asset.status !== ASSET_STATUS.ALLOCATED) {
      throw new AppError('Asset must be currently allocated to request a transfer', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if target user exists
    const toUser = await User.findById(data.toUser);
    if (!toUser) {
      throw new AppError('Target user for transfer not found', HTTP_STATUS.NOT_FOUND);
    }
    if (!toUser.isActive) {
      throw new AppError('Target user is currently inactive', HTTP_STATUS.BAD_REQUEST);
    }

    // Find the current active allocation to determine source department
    const currentAllocation = await Allocation.findOne({
      asset: asset._id,
      status: ALLOCATION_STATUS.ACTIVE,
    }).populate('allocatedTo');

    let fromDepartment = null;
    if (currentAllocation) {
      if (allocationTargetIsUser(currentAllocation)) {
        // Source is a user; get their department
        const sourceUser = await User.findById(currentAllocation.allocatedTo._id);
        fromDepartment = sourceUser ? sourceUser.department : null;
      } else {
        // Source is a department directly
        fromDepartment = currentAllocation.allocatedTo._id;
      }
    }

    // Create the transfer record
    const transfer = await Transfer.create({
      asset: asset._id,
      requestedBy: userId,
      fromDepartment,
      toDepartment: data.toDepartment || toUser.department || null,
      toUser: toUser._id,
      requestReason: data.requestReason,
      status: TRANSFER_STATUS.PENDING,
    });

    // Log Activity
    await ActivityLogService.log(
      userId,
      'REQUEST_TRANSFER',
      'Transfer',
      transfer._id,
      `Requested transfer of asset ${asset.assetTag} to user ${toUser.fullName}`
    );

    return transfer;
  }

  /**
   * @desc Approve a transfer request (Admin or Asset Manager)
   * @param {string} id - Transfer request ID
   * @param {string} userId - Actioning user ID (approver)
   * @returns {Promise<Object>} Approved transfer request
   */
  static async approveRequest(id, userId) {
    const request = await Transfer.findById(id);
    if (!request) {
      throw new AppError('Transfer request not found', HTTP_STATUS.NOT_FOUND);
    }

    if (request.status !== TRANSFER_STATUS.PENDING) {
      throw new AppError(`Transfer request is not pending (Current status: ${request.status})`, HTTP_STATUS.BAD_REQUEST);
    }

    // Business Rule: Prevent self-approval (cannot approve your own transfer request)
    if (request.requestedBy.toString() === userId.toString()) {
      throw new AppError('Self-approval of transfer requests is strictly prohibited', HTTP_STATUS.FORBIDDEN);
    }

    const asset = await Asset.findById(request.asset);
    if (!asset) {
      throw new AppError('Asset associated with transfer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Find the current active allocation
    const currentAllocation = await Allocation.findOne({
      asset: request.asset,
      status: ALLOCATION_STATUS.ACTIVE,
    });

    if (currentAllocation) {
      // 1. Mark previous allocation as Transferred
      currentAllocation.status = ALLOCATION_STATUS.TRANSFERRED;
      currentAllocation.actualReturnDate = Date.now();
      await currentAllocation.save();
    }

    // 2. Create new Allocation for the target user
    const newAllocation = await Allocation.create({
      asset: request.asset,
      allocateToType: 'User',
      allocatedTo: request.toUser,
      allocatedBy: userId,
      checkOutCondition: asset.condition || 'good',
      status: ALLOCATION_STATUS.ACTIVE,
    });

    // 3. Update the Asset holder
    asset.currentHolderType = 'User';
    asset.currentHolder = request.toUser;
    asset.status = ASSET_STATUS.ALLOCATED;
    await asset.save();

    // 4. Update transfer request status
    request.status = TRANSFER_STATUS.APPROVED;
    request.actionedBy = userId;
    request.actionedAt = Date.now();
    await request.save();

    // Log Activity
    await ActivityLogService.log(
      userId,
      'APPROVE_TRANSFER',
      'Transfer',
      request._id,
      `Approved transfer of asset ${asset.assetTag} to user ${request.toUser}`
    );

    return request;
  }

  /**
   * @desc Reject a transfer request
   * @param {string} id - Transfer request ID
   * @param {Object} data - Rejection reason data
   * @param {string} userId - Actioning user ID
   * @returns {Promise<Object>} Rejected transfer request
   */
  static async rejectRequest(id, data, userId) {
    const request = await Transfer.findById(id);
    if (!request) {
      throw new AppError('Transfer request not found', HTTP_STATUS.NOT_FOUND);
    }

    if (request.status !== TRANSFER_STATUS.PENDING) {
      throw new AppError(`Transfer request is not pending (Current status: ${request.status})`, HTTP_STATUS.BAD_REQUEST);
    }

    // Update request
    request.status = TRANSFER_STATUS.REJECTED;
    request.actionedBy = userId;
    request.actionedAt = Date.now();
    request.rejectionReason = data.rejectionReason;
    await request.save();

    // Log Activity
    await ActivityLogService.log(
      userId,
      'REJECT_TRANSFER',
      'Transfer',
      request._id,
      `Rejected transfer request for asset ID ${request.asset}. Reason: ${data.rejectionReason}`
    );

    return request;
  }

  /**
   * @desc Get all transfers with pagination and optional status filter
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} { transfers, total, page, limit }
   */
  static async getAll(query) {
    const { page, limit, skip } = buildPaginationQuery(query.page, query.limit);
    const filter = {};

    if (query.status) {
      filter.status = query.status;
    }
    if (query.asset) {
      filter.asset = query.asset;
    }

    const [transfers, total] = await Promise.all([
      Transfer.find(filter)
        .populate('asset', 'name assetTag serialNumber')
        .populate('requestedBy', 'firstName lastName email')
        .populate('toUser', 'firstName lastName email')
        .populate('actionedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transfer.countDocuments(filter),
    ]);

    return { transfers, total, page, limit };
  }
}

// Private helper to check if allocation is to a user
function allocationTargetIsUser(allocation) {
  return allocation.allocateToType === 'User';
}

module.exports = TransferService;
