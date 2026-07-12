const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const User = require('../models/User');
const NotificationService = require('./notification.service');
const ActivityLogService = require('./activityLog.service');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS, ASSET_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class MaintenanceService
 * @desc Manages asset maintenance workflows and the state machine.
 */
class MaintenanceService {
  /**
   * @desc Raise a new maintenance request for an asset
   * @param {Object} data - Maintenance request parameters
   * @param {string} userId - User raising the request
   * @returns {Promise<Object>} The created maintenance request document
   */
  static async createRequest(data, userId) {
    const asset = await Asset.findById(data.asset);
    if (!asset) {
      throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND);
    }

    if ([ASSET_STATUS.RETIRED, ASSET_STATUS.DISPOSED].includes(asset.status)) {
      throw new AppError(`Cannot raise maintenance for a retired or disposed asset`, HTTP_STATUS.BAD_REQUEST);
    }

    data.raisedBy = userId;
    data.status = 'pending';

    const request = await MaintenanceRequest.create(data);

    // Log Activity
    await ActivityLogService.log(
      userId,
      'CREATE_MAINTENANCE',
      'MaintenanceRequest',
      request._id,
      `Raised maintenance request for asset ${asset.assetTag}: ${data.issueDescription}`
    );

    return request;
  }

  /**
   * @desc Transition a maintenance request status (State Machine)
   * @param {string} id - Maintenance Request ID
   * @param {string} newStatus - Target status state
   * @param {Object} extraData - Input fields depending on target state
   * @param {Object} user - User executing the transition (contains role)
   * @returns {Promise<Object>} The updated maintenance request
   */
  static async updateStatus(id, newStatus, extraData, user) {
    const request = await MaintenanceRequest.findById(id).populate('asset');
    if (!request) {
      throw new AppError('Maintenance request not found', HTTP_STATUS.NOT_FOUND);
    }

    const currentStatus = request.status;

    // Authorization Guard: Only Admin / Asset Manager can change states for approval, assignment, or rejection
    const isManagerialTransition = ['approved', 'rejected', 'technician_assigned'].includes(newStatus);
    const isManager = ['admin', 'asset_manager'].includes(user.role);
    if (isManagerialTransition && !isManager) {
      throw new AppError('You are not authorized to perform this administrative transition', HTTP_STATUS.FORBIDDEN);
    }

    // State Machine transitions enforcement
    switch (newStatus) {
      case 'approved':
        if (currentStatus !== 'pending') {
          throw new AppError('Only pending requests can be approved', HTTP_STATUS.BAD_REQUEST);
        }
        request.status = 'approved';
        request.actionedBy = user.id;
        request.actionedAt = Date.now();

        // Business Rule: Asset status must automatically change to Under Maintenance when approved
        request.asset.status = ASSET_STATUS.UNDER_MAINTENANCE;
        // Break any active holder possession since it goes to repair
        request.asset.currentHolder = null;
        request.asset.currentHolderType = null;
        await request.asset.save();

        // Notification
        await NotificationService.notify(
          request.raisedBy,
          'Maintenance Approved',
          `Your maintenance request for asset ${request.asset.name} has been approved.`,
          'maintenance_approved',
          'MaintenanceRequest',
          request._id
        );
        break;

      case 'rejected':
        if (currentStatus !== 'pending') {
          throw new AppError('Only pending requests can be rejected', HTTP_STATUS.BAD_REQUEST);
        }
        if (!extraData.rejectionReason) {
          throw new AppError('Rejection reason is required', HTTP_STATUS.BAD_REQUEST);
        }
        request.status = 'rejected';
        request.actionedBy = user.id;
        request.actionedAt = Date.now();
        request.rejectionReason = extraData.rejectionReason;

        // Notification
        await NotificationService.notify(
          request.raisedBy,
          'Maintenance Rejected',
          `Your maintenance request for asset ${request.asset.name} has been rejected. Reason: ${extraData.rejectionReason}`,
          'maintenance_rejected',
          'MaintenanceRequest',
          request._id
        );
        break;

      case 'technician_assigned':
        if (!['approved', 'technician_assigned'].includes(currentStatus)) {
          throw new AppError('Request must be approved before assigning a technician', HTTP_STATUS.BAD_REQUEST);
        }
        if (!extraData.technician) {
          throw new AppError('Technician ID is required', HTTP_STATUS.BAD_REQUEST);
        }
        // Verify technician exists
        const techUser = await User.findById(extraData.technician);
        if (!techUser) {
          throw new AppError('Technician user not found', HTTP_STATUS.NOT_FOUND);
        }

        request.status = 'technician_assigned';
        request.technician = techUser._id;

        // Notify Technician
        await NotificationService.notify(
          techUser._id,
          'New Maintenance Task Assigned',
          `You have been assigned to repair asset ${request.asset.name} (${request.asset.assetTag}).`,
          'maintenance_assigned',
          'MaintenanceRequest',
          request._id
        );

        // Notify Creator
        await NotificationService.notify(
          request.raisedBy,
          'Technician Assigned',
          `Technician ${techUser.fullName} has been assigned to your maintenance request for ${request.asset.name}.`,
          'maintenance_assigned',
          'MaintenanceRequest',
          request._id
        );
        break;

      case 'in_progress':
        if (currentStatus !== 'technician_assigned') {
          throw new AppError('Technician must be assigned before starting repair work', HTTP_STATUS.BAD_REQUEST);
        }
        // Allow assigned technician or admin/manager to start work
        const isTech = request.technician && request.technician.toString() === user.id.toString();
        if (!isTech && !isManager) {
          throw new AppError('Only the assigned technician or manager can start this work', HTTP_STATUS.FORBIDDEN);
        }

        request.status = 'in_progress';
        break;

      case 'resolved':
        if (currentStatus !== 'in_progress') {
          throw new AppError('Repair work must be in progress to resolve request', HTTP_STATUS.BAD_REQUEST);
        }
        // Allow technician or admin/manager to resolve
        const isAssignedTech = request.technician && request.technician.toString() === user.id.toString();
        if (!isAssignedTech && !isManager) {
          throw new AppError('Only the assigned technician or manager can resolve this request', HTTP_STATUS.FORBIDDEN);
        }

        request.status = 'resolved';
        request.notes = extraData.notes || 'Repair complete.';

        // Business Rule: Asset status must automatically change back to Available when resolved
        request.asset.status = ASSET_STATUS.AVAILABLE;
        await request.asset.save();

        // Notify Creator
        await NotificationService.notify(
          request.raisedBy,
          'Maintenance Request Resolved',
          `Your maintenance request for asset ${request.asset.name} has been resolved.`,
          'maintenance_resolved',
          'MaintenanceRequest',
          request._id
        );
        break;

      default:
        throw new AppError('Invalid maintenance status transition target', HTTP_STATUS.BAD_REQUEST);
    }

    await request.save();

    // Log Activity
    await ActivityLogService.log(
      user.id,
      'UPDATE_MAINTENANCE_STATUS',
      'MaintenanceRequest',
      request._id,
      `Transitioned maintenance request for asset ${request.asset.assetTag} from '${currentStatus}' to '${newStatus}'`
    );

    return request;
  }

  /**
   * @desc Get maintenance requests history list per asset
   * @param {string} assetId - Asset ID
   * @returns {Promise<Array>} Maintenance requests history
   */
  static async getByAsset(assetId) {
    return await MaintenanceRequest.find({ asset: assetId })
      .populate('raisedBy', 'firstName lastName email')
      .populate('technician', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  /**
   * @desc List maintenance requests with filter and pagination
   * @param {Object} query - Express query params
   * @returns {Promise<Object>} { requests, total, page, limit }
   */
  static async getAll(query) {
    const { page, limit, skip } = buildPaginationQuery(query.page, query.limit);
    const filter = {};

    if (query.asset) {
      filter.asset = query.asset;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.priority) {
      filter.priority = query.priority;
    }
    if (query.technician) {
      filter.technician = query.technician;
    }
    if (query.raisedBy) {
      filter.raisedBy = query.raisedBy;
    }

    const [requests, total] = await Promise.all([
      MaintenanceRequest.find(filter)
        .populate('asset', 'name assetTag serialNumber location status')
        .populate('raisedBy', 'firstName lastName email')
        .populate('technician', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MaintenanceRequest.countDocuments(filter),
    ]);

    return { requests, total, page, limit };
  }
}

module.exports = MaintenanceService;
