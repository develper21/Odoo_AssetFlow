const AuditCycle = require('../models/AuditCycle');
const AuditItem = require('../models/AuditItem');
const Asset = require('../models/Asset');
const User = require('../models/User');
const NotificationService = require('./notification.service');
const ActivityLogService = require('./activityLog.service');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS, ASSET_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class AuditService
 * @desc Manages audit cycles, asset verification, discrepancy lists, and locking actions.
 */
class AuditService {
  /**
   * @desc Create a new audit cycle in draft state
   */
  static async createCycle(data, userId) {
    // Verify auditors exist
    const auditorCount = await User.countDocuments({ _id: { $in: data.auditors } });
    if (auditorCount !== data.auditors.length) {
      throw new AppError('One or more assigned auditors were not found', HTTP_STATUS.BAD_REQUEST);
    }

    data.status = 'draft';
    const cycle = await AuditCycle.create(data);

    // Build query scope based on filters
    const assetFilter = { status: { $nin: [ASSET_STATUS.RETIRED, ASSET_STATUS.DISPOSED] } };
    if (data.department) {
      assetFilter.department = data.department;
    }
    if (data.location) {
      // Case-insensitive sub-string search
      assetFilter.location = { $regex: data.location, $options: 'i' };
    }

    // Locate scope assets
    const assets = await Asset.find(assetFilter);

    // Create AuditItems
    if (assets.length > 0) {
      const items = assets.map((asset) => ({
        auditCycle: cycle._id,
        asset: asset._id,
        status: 'pending',
      }));
      await AuditItem.insertMany(items);
    }

    // Log Activity
    await ActivityLogService.log(
      userId,
      'CREATE_AUDIT_CYCLE',
      'AuditCycle',
      cycle._id,
      `Created audit cycle: ${cycle.name} with ${assets.length} scoped assets.`
    );

    return { cycle, itemsCount: assets.length };
  }

  /**
   * @desc Transition cycle from draft to active
   */
  static async startCycle(id, userId) {
    const cycle = await AuditCycle.findById(id);
    if (!cycle) {
      throw new AppError('Audit cycle not found', HTTP_STATUS.NOT_FOUND);
    }

    if (cycle.status !== 'draft') {
      throw new AppError('Only draft audit cycles can be started', HTTP_STATUS.BAD_REQUEST);
    }

    cycle.status = 'active';
    await cycle.save();

    // Notify assigned auditors
    for (const auditorId of cycle.auditors) {
      await NotificationService.notify(
        auditorId,
        'Audit Cycle Active',
        `You have been assigned to audit cycle: ${cycle.name}. Start auditing scoped assets.`,
        'audit_started',
        'AuditCycle',
        cycle._id
      );
    }

    // Log Activity
    await ActivityLogService.log(
      userId,
      'START_AUDIT_CYCLE',
      'AuditCycle',
      cycle._id,
      `Started audit cycle: ${cycle.name}`
    );

    return cycle;
  }

  /**
   * @desc Auditor verifies an asset's condition/existence
   */
  static async verifyAsset(cycleId, assetId, data, auditorId) {
    const cycle = await AuditCycle.findById(cycleId);
    if (!cycle) {
      throw new AppError('Audit cycle not found', HTTP_STATUS.NOT_FOUND);
    }

    // Lock condition check: Prevent editing of a closed audit cycle
    if (cycle.status !== 'active') {
      throw new AppError(`Cannot verify assets in a ${cycle.status} audit cycle`, HTTP_STATUS.BAD_REQUEST);
    }

    // Auditor authentication: Must be assigned or an admin
    const user = await User.findById(auditorId);
    const isAssigned = cycle.auditors.some((aId) => aId.toString() === auditorId.toString());
    const isAdmin = user && user.role === 'admin';
    if (!isAssigned && !isAdmin) {
      throw new AppError('You are not assigned as an auditor for this cycle', HTTP_STATUS.FORBIDDEN);
    }

    const item = await AuditItem.findOne({ auditCycle: cycleId, asset: assetId }).populate('asset');
    if (!item) {
      throw new AppError('Scoped asset item not found in this audit cycle', HTTP_STATUS.NOT_FOUND);
    }

    item.status = data.status;
    item.notes = data.notes || null;
    item.verifiedBy = auditorId;
    item.verifiedAt = Date.now();
    await item.save();

    // Trigger discrepancy notification for missing or damaged
    if (['missing', 'damaged'].includes(data.status)) {
      // Find admin/managers
      const managers = await User.find({ role: { $in: ['admin', 'asset_manager'] } });
      for (const mgr of managers) {
        await NotificationService.notify(
          mgr._id,
          'Audit Discrepancy Flagged',
          `Discrepancy: Asset ${item.asset.name} (${item.asset.assetTag}) flagged as ${data.status} during ${cycle.name}.`,
          'audit_discrepancy_flagged',
          'AuditItem',
          item._id
        );
      }
    }

    // Log Activity
    await ActivityLogService.log(
      auditorId,
      'VERIFY_AUDIT_ITEM',
      'AuditItem',
      item._id,
      `Auditor verified asset ${item.asset.assetTag} as ${data.status}`
    );

    return item;
  }

  /**
   * @desc Finalize audit and lock states
   */
  static async closeCycle(id, userId) {
    const cycle = await AuditCycle.findById(id);
    if (!cycle) {
      throw new AppError('Audit cycle not found', HTTP_STATUS.NOT_FOUND);
    }

    if (cycle.status !== 'active') {
      throw new AppError('Only active audit cycles can be closed', HTTP_STATUS.BAD_REQUEST);
    }

    // Verification check: All items must be processed
    const pendingCount = await AuditItem.countDocuments({ auditCycle: id, status: 'pending' });
    if (pendingCount > 0) {
      throw new AppError(
        `Cannot close cycle. ${pendingCount} assets are still pending verification.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    cycle.status = 'closed';
    cycle.closedBy = userId;
    cycle.closedAt = Date.now();
    await cycle.save();

    // Business Rule: confirmed missing assets should become Lost post-closure
    const missingItems = await AuditItem.find({ auditCycle: id, status: 'missing' });
    if (missingItems.length > 0) {
      const assetIds = missingItems.map((item) => item.asset);
      await Asset.updateMany(
        { _id: { $in: assetIds } },
        { $set: { status: ASSET_STATUS.LOST, currentHolder: null, currentHolderType: null } }
      );
    }

    // Notify auditors
    for (const auditorId of cycle.auditors) {
      await NotificationService.notify(
        auditorId,
        'Audit Cycle Closed',
        `Audit cycle ${cycle.name} has been successfully closed. Results locked.`,
        'audit_closed',
        'AuditCycle',
        cycle._id
      );
    }

    // Log Activity
    await ActivityLogService.log(
      userId,
      'CLOSE_AUDIT_CYCLE',
      'AuditCycle',
      cycle._id,
      `Closed audit cycle: ${cycle.name}. Statuses updated.`
    );

    return cycle;
  }

  /**
   * @desc Get discrepancy list
   */
  static async getDiscrepancyReport(id) {
    return await AuditItem.find({
      auditCycle: id,
      status: { $in: ['missing', 'damaged'] },
    })
      .populate('asset', 'name assetTag serialNumber location condition status')
      .populate('verifiedBy', 'firstName lastName email');
  }

  /**
   * @desc Retrieve full cycle and items
   */
  static async getCycleDetails(id) {
    const cycle = await AuditCycle.findById(id).populate('auditors', 'firstName lastName email');
    if (!cycle) {
      throw new AppError('Audit cycle not found', HTTP_STATUS.NOT_FOUND);
    }

    const items = await AuditItem.find({ auditCycle: id })
      .populate('asset', 'name assetTag serialNumber location status')
      .populate('verifiedBy', 'firstName lastName email');

    return { cycle, items };
  }

  /**
   * @desc List cycles with filters and pagination
   */
  static async getAllCycles(query) {
    const { page, limit, skip } = buildPaginationQuery(query.page, query.limit);
    const filter = {};

    if (query.status) {
      filter.status = query.status;
    }

    const [cycles, total] = await Promise.all([
      AuditCycle.find(filter)
        .populate('auditors', 'firstName lastName email')
        .populate('closedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditCycle.countDocuments(filter),
    ]);

    return { cycles, total, page, limit };
  }
}

module.exports = AuditService;
