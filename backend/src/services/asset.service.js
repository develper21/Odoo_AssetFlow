const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Transfer = require('../models/Transfer');
const User = require('../models/User');
const ActivityLogService = require('./activityLog.service');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS, ASSET_STATUS, ALLOCATION_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class AssetService
 * @desc Handles business logic for registering, retrieving, updating, retiring, and summarizing assets.
 */
class AssetService {
  /**
   * @desc Register a new asset in the system
   * @param {Object} data - Asset registry data
   * @param {string} userId - ID of the creating user
   * @returns {Promise<Object>} The registered asset
   */
  static async create(data, userId) {
    // Check for duplicate serial number
    const existing = await Asset.findOne({ serialNumber: data.serialNumber });
    if (existing) {
      throw new AppError('Asset with this serial number already exists', HTTP_STATUS.CONFLICT);
    }

    data.createdBy = userId;
    const asset = await Asset.create(data);

    // Write audit trail
    await ActivityLogService.log(
      userId,
      'CREATE_ASSET',
      'Asset',
      asset._id,
      `Registered asset: ${asset.name} with Tag ${asset.assetTag}`
    );

    return asset;
  }

  /**
   * @desc List assets with search, filters, and pagination
   * @param {Object} query - Express request query params
   * @returns {Promise<Object>} { assets, total, page, limit }
   */
  static async getAll(query) {
    const { page, limit, skip } = buildPaginationQuery(query.page, query.limit);
    const filter = {};

    // 1. Text / Regex Search
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { assetTag: searchRegex },
        { serialNumber: searchRegex },
        { location: searchRegex },
      ];
    }

    // 2. Exact Filters
    if (query.category) {
      filter.category = query.category;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.location) {
      filter.location = query.location;
    }
    if (query.isBookable !== undefined) {
      filter.isBookable = query.isBookable === 'true';
    }

    // 3. Filter by Department
    if (query.department) {
      // Find all users in this department
      const usersInDept = await User.find({ department: query.department }).select('_id');
      const userIds = usersInDept.map((u) => u._id);

      filter.$or = [
        // Case A: Asset is allocated directly to this Department
        { currentHolderType: 'Department', currentHolder: query.department },
        // Case B: Asset is allocated to an Employee who belongs to this Department
        { currentHolderType: 'User', currentHolder: { $in: userIds } },
      ];
    }

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('category', 'name code')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Asset.countDocuments(filter),
    ]);

    return { assets, total, page, limit };
  }

  /**
   * @desc Retrieve asset by ID along with its history of allocations and transfers
   * @param {string} id - Asset MongoDB ObjectId
   * @returns {Promise<Object>} Asset with historical records
   */
  static async getById(id) {
    const asset = await Asset.findById(id)
      .populate('category', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .populate({
        path: 'currentHolder',
        select: 'firstName lastName email name code' // department/user common fields
      });

    if (!asset) {
      throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND);
    }

    // Fetch allocations history
    const allocations = await Allocation.find({ asset: id })
      .populate('allocatedTo', 'firstName lastName email name code')
      .populate('allocatedBy', 'firstName lastName email')
      .populate('returnedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Fetch transfers history
    const transfers = await Transfer.find({ asset: id })
      .populate('requestedBy', 'firstName lastName email')
      .populate('toUser', 'firstName lastName email')
      .populate('fromDepartment', 'name code')
      .populate('toDepartment', 'name code')
      .populate('actionedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const assetObj = asset.toObject();
    assetObj.history = {
      allocations,
      transfers,
    };

    return assetObj;
  }

  /**
   * @desc Update an existing asset's data
   * @param {string} id - Asset ID
   * @param {Object} data - Update data
   * @param {string} userId - Actioning user ID
   * @returns {Promise<Object>} Updated asset
   */
  static async update(id, data, userId) {
    const asset = await Asset.findById(id);
    if (!asset) {
      throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check serial number uniqueness if changed
    if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
      const existing = await Asset.findOne({ serialNumber: data.serialNumber });
      if (existing) {
        throw new AppError('Asset with this serial number already exists', HTTP_STATUS.CONFLICT);
      }
    }

    // Prevent direct status modification through update endpoint (must use allocate/return/transfer flows)
    delete data.status;
    delete data.currentHolder;
    delete data.currentHolderType;
    delete data.assetTag;

    const updatedAsset = await Asset.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('category', 'name code');

    // Write audit trail
    await ActivityLogService.log(
      userId,
      'UPDATE_ASSET',
      'Asset',
      id,
      `Updated asset details for Tag ${asset.assetTag}`
    );

    return updatedAsset;
  }

  /**
   * @desc Soft delete / retire an asset
   * @param {string} id - Asset ID
   * @param {string} userId - Actioning user ID
   * @returns {Promise<Object>} Retired asset
   */
  static async retire(id, userId) {
    const asset = await Asset.findById(id);
    if (!asset) {
      throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND);
    }

    // Only allow retiring available, retired, or under_maintenance assets (cannot retire allocated assets directly)
    if (asset.status === ASSET_STATUS.ALLOCATED) {
      throw new AppError('Cannot retire an asset that is currently allocated', HTTP_STATUS.CONFLICT);
    }

    asset.status = ASSET_STATUS.RETIRED;
    // Clear holder reference if any
    asset.currentHolder = null;
    asset.currentHolderType = null;
    await asset.save();

    // Write audit trail
    await ActivityLogService.log(
      userId,
      'RETIRE_ASSET',
      'Asset',
      id,
      `Retired asset with Tag ${asset.assetTag}`
    );

    return asset;
  }

  /**
   * @desc Get aggregate KPIs for the Asset Registry
   * @returns {Promise<Object>} Asset summary counters
   */
  static async getSummary() {
    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      retiredAssets,
      overdueAllocationsCount,
      recentlyAdded,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: ASSET_STATUS.AVAILABLE }),
      Asset.countDocuments({ status: ASSET_STATUS.ALLOCATED }),
      Asset.countDocuments({ status: ASSET_STATUS.RETIRED }),
      Allocation.countDocuments({
        status: ALLOCATION_STATUS.ACTIVE,
        expectedReturnDate: { $lt: new Date() },
      }),
      Asset.find()
        .populate('category', 'name code')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      totalAssets,
      availableAssets,
      allocatedAssets,
      retiredAssets,
      overdueAllocations: overdueAllocationsCount,
      recentlyAddedAssets: recentlyAdded,
    };
  }
}

module.exports = AssetService;
