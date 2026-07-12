const User = require('../models/User');
const Department = require('../models/Department');
const AssetCategory = require('../models/AssetCategory');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Transfer = require('../models/Transfer');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const AuditCycle = require('../models/AuditCycle');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS, ASSET_STATUS, TRANSFER_STATUS } = require('../constants');

/**
 * @class DashboardService
 * @desc Provides role-based dashboard statistics and KPIs.
 *       Executes live database queries and aggregations for all models.
 */
class DashboardService {
  /**
   * @desc Get dashboard statistics based on the authenticated user's role
   * @param {Object} user - The authenticated user object (from req.user)
   * @returns {Object} Role-specific dashboard statistics
   */
  static async getStats(user) {
    switch (user.role) {
      case 'admin':
        return await DashboardService._getAdminStats();

      case 'asset_manager':
        return await DashboardService._getAssetManagerStats();

      case 'department_head':
        return await DashboardService._getDepartmentHeadStats(user);

      case 'employee':
        return await DashboardService._getEmployeeStats(user);

      default:
        throw new AppError('Invalid user role', HTTP_STATUS.FORBIDDEN);
    }
  }

  /**
   * @desc Get admin-level dashboard statistics
   * @returns {Object} Admin KPIs with real counts
   * @private
   */
  static async _getAdminStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalCategories,
      totalAssets,
      allocatedAssets,
      pendingTransfers,
      pendingMaintenance,
      activeBookings,
      overdueReturns,
      maintenanceToday,
      openAuditCycles,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Department.countDocuments(),
      AssetCategory.countDocuments(),
      Asset.countDocuments(),
      Asset.countDocuments({ status: ASSET_STATUS.ALLOCATED }),
      Transfer.countDocuments({ status: TRANSFER_STATUS.PENDING }),
      MaintenanceRequest.countDocuments({ status: { $in: ['pending', 'approved', 'technician_assigned', 'in_progress'] } }),
      Booking.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } }),
      Allocation.countDocuments({ status: 'active', expectedReturnDate: { $lt: new Date() } }),
      MaintenanceRequest.countDocuments({ createdAt: { $gte: todayStart } }),
      AuditCycle.countDocuments({ status: { $in: ['draft', 'active'] } }),
      ActivityLog.find()
        .populate('user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalCategories,
      totalAssets,
      allocatedAssets,
      pendingMaintenance,
      pendingTransfers,
      activeBookings,
      overdueReturns,
      maintenanceToday,
      openAuditCycles,
      recentActivities,
    };
  }

  /**
   * @desc Get asset manager dashboard statistics
   * @returns {Object} Asset manager KPIs
   * @private
   */
  static async _getAssetManagerStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalAssets,
      allocatedAssets,
      availableAssets,
      underMaintenance,
      pendingTransfers,
      activeBookings,
      overdueReturns,
      maintenanceToday,
      openAuditCycles,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: ASSET_STATUS.ALLOCATED }),
      Asset.countDocuments({ status: ASSET_STATUS.AVAILABLE }),
      Asset.countDocuments({ status: ASSET_STATUS.UNDER_MAINTENANCE }),
      Transfer.countDocuments({ status: TRANSFER_STATUS.PENDING }),
      Booking.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } }),
      Allocation.countDocuments({ status: 'active', expectedReturnDate: { $lt: new Date() } }),
      MaintenanceRequest.countDocuments({ createdAt: { $gte: todayStart } }),
      AuditCycle.countDocuments({ status: { $in: ['draft', 'active'] } }),
    ]);

    return {
      totalAssets,
      allocatedAssets,
      availableAssets,
      underMaintenance,
      pendingTransfers,
      activeBookings,
      overdueReturns,
      maintenanceToday,
      openAuditCycles,
    };
  }

  /**
   * @desc Get department head dashboard statistics
   * @param {Object} user - The authenticated department head user
   * @returns {Object} Department-specific KPIs
   * @private
   */
  static async _getDepartmentHeadStats(user) {
    if (!user.department) {
      return {
        departmentEmployees: 0,
        departmentAssets: 0,
        pendingBookings: 0,
        pendingTransfers: 0,
      };
    }

    const deptId = user.department;

    // Find all users in this department
    const deptUsers = await User.find({ department: deptId }).select('_id');
    const deptUserIds = deptUsers.map((u) => u._id);

    const [departmentEmployees, departmentAssets, pendingTransfers, pendingBookings] = await Promise.all([
      User.countDocuments({ department: deptId, isActive: true }),
      Asset.countDocuments({
        $or: [
          { currentHolderType: 'Department', currentHolder: deptId },
          { currentHolderType: 'User', currentHolder: { $in: deptUserIds } },
        ],
      }),
      Transfer.countDocuments({
        status: TRANSFER_STATUS.PENDING,
        $or: [
          { fromDepartment: deptId },
          { toDepartment: deptId },
        ],
      }),
      Booking.countDocuments({
        bookedBy: { $in: deptUserIds },
        status: { $in: ['upcoming', 'ongoing'] },
      }),
    ]);

    return {
      departmentEmployees,
      departmentAssets,
      pendingBookings,
      pendingTransfers,
    };
  }

  /**
   * @desc Get employee dashboard statistics
   * @param {Object} user - The authenticated employee user
   * @returns {Object} Employee-specific KPIs
   * @private
   */
  static async _getEmployeeStats(user) {
    const userId = user._id;

    const [myAssets, pendingRequests, activeBookings, maintenanceRequests] = await Promise.all([
      Asset.countDocuments({
        currentHolderType: 'User',
        currentHolder: userId,
        status: ASSET_STATUS.ALLOCATED,
      }),
      Transfer.countDocuments({
        status: TRANSFER_STATUS.PENDING,
        requestedBy: userId,
      }),
      Booking.countDocuments({
        bookedBy: userId,
        status: { $in: ['upcoming', 'ongoing'] },
      }),
      MaintenanceRequest.countDocuments({
        raisedBy: userId,
        status: { $ne: 'resolved' },
      }),
    ]);

    return {
      myAssets,
      pendingRequests,
      activeBookings,
      maintenanceRequests,
    };
  }
}

module.exports = DashboardService;
