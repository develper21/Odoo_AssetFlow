const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Department = require('../models/Department');
const ActivityLogService = require('./activityLog.service');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS, ASSET_STATUS, ALLOCATION_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class AllocationService
 * @desc Handles asset check-outs (allocations) and returns (check-ins).
 */
class AllocationService {
  /**
   * @desc Allocate an asset to an employee or department
   * @param {Object} data - Allocation data
   * @param {string} userId - Actioning user ID (who allocates)
   * @returns {Promise<Object>} The created allocation record
   */
  static async allocate(data, userId) {
    const asset = await Asset.findById(data.asset);
    if (!asset) {
      throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND);
    }

    // Business Rule: Prevent double allocation of the same asset
    if (asset.status !== ASSET_STATUS.AVAILABLE) {
      throw new AppError(
        `Asset is currently not available for allocation (Status: ${asset.status})`,
        HTTP_STATUS.CONFLICT
      );
    }

    // Verify target exists
    if (data.allocateToType === 'User') {
      const userExists = await User.findById(data.allocatedTo);
      if (!userExists) {
        throw new AppError('Target user for allocation does not exist', HTTP_STATUS.NOT_FOUND);
      }
      if (!userExists.isActive) {
        throw new AppError('Cannot allocate assets to a deactivated user', HTTP_STATUS.BAD_REQUEST);
      }
    } else if (data.allocateToType === 'Department') {
      const deptExists = await Department.findById(data.allocatedTo);
      if (!deptExists) {
        throw new AppError('Target department for allocation does not exist', HTTP_STATUS.NOT_FOUND);
      }
      if (!deptExists.isActive) {
        throw new AppError('Cannot allocate assets to a deactivated department', HTTP_STATUS.BAD_REQUEST);
      }
    }

    data.allocatedBy = userId;
    data.status = ALLOCATION_STATUS.ACTIVE;

    const allocation = await Allocation.create(data);

    // Update asset holder and status
    asset.status = ASSET_STATUS.ALLOCATED;
    asset.currentHolderType = data.allocateToType;
    asset.currentHolder = data.allocatedTo;
    await asset.save();

    // Log Activity
    const holderName = data.allocateToType === 'User' ? 'employee' : 'department';
    await ActivityLogService.log(
      userId,
      'ALLOCATE_ASSET',
      'Asset',
      asset._id,
      `Allocated asset ${asset.assetTag} to ${holderName} ${data.allocatedTo}`
    );

    return allocation;
  }

  /**
   * @desc Process a return flow with condition check-in notes
   * @param {string} id - Allocation ID to return
   * @param {Object} returnData - Return parameters (condition, notes)
   * @param {string} userId - User recording the return
   * @returns {Promise<Object>} The returned allocation record
   */
  static async returnAsset(id, returnData, userId) {
    const allocation = await Allocation.findById(id);
    if (!allocation) {
      throw new AppError('Allocation record not found', HTTP_STATUS.NOT_FOUND);
    }

    if (allocation.status !== ALLOCATION_STATUS.ACTIVE) {
      throw new AppError('This allocation is already inactive/returned', HTTP_STATUS.BAD_REQUEST);
    }

    // Update allocation
    allocation.actualReturnDate = Date.now();
    allocation.status = ALLOCATION_STATUS.RETURNED;
    allocation.checkInCondition = returnData.checkInCondition;
    allocation.checkInNotes = returnData.checkInNotes || '';
    allocation.returnedBy = userId;
    await allocation.save();

    // Update Asset
    const asset = await Asset.findById(allocation.asset);
    if (asset) {
      asset.status = ASSET_STATUS.AVAILABLE;
      asset.currentHolder = null;
      asset.currentHolderType = null;
      // Propagate physical condition update to asset registry if returned in a different condition
      if (returnData.checkInCondition) {
        asset.condition = returnData.checkInCondition;
      }
      await asset.save();

      // Log Activity
      await ActivityLogService.log(
        userId,
        'RETURN_ASSET',
        'Asset',
        asset._id,
        `Returned asset ${asset.assetTag} with condition: ${returnData.checkInCondition}`
      );
    }

    return allocation;
  }

  /**
   * @desc List all overdue allocations (expectedReturnDate exceeded)
   * @param {Object} query - Pagination and filtering options
   * @returns {Promise<Object>} { allocations, total, page, limit }
   */
  static async getOverdueAllocations(query) {
    const { page, limit, skip } = buildPaginationQuery(query.page, query.limit);

    const filter = {
      status: ALLOCATION_STATUS.ACTIVE,
      expectedReturnDate: { $lt: new Date() },
    };

    const [allocations, total] = await Promise.all([
      Allocation.find(filter)
        .populate('asset', 'name assetTag serialNumber')
        .populate('allocatedTo', 'firstName lastName email name code') // user / department
        .populate('allocatedBy', 'firstName lastName email')
        .sort({ expectedReturnDate: 1 })
        .skip(skip)
        .limit(limit),
      Allocation.countDocuments(filter),
    ]);

    return { allocations, total, page, limit };
  }
}

module.exports = AllocationService;
