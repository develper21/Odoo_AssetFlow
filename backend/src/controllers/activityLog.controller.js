const ActivityLog = require('../models/ActivityLog');
const { sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @desc    Get all activity logs with pagination and optional user/action filters
 * @route   GET /api/v1/activity-logs
 * @access  Private/Admin, Asset Manager
 */
const getActivityLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPaginationQuery(req.query.page, req.query.limit);
  const filter = {};

  if (req.query.user) {
    filter.user = req.query.user;
  }
  if (req.query.action) {
    filter.action = req.query.action;
  }
  if (req.query.targetType) {
    filter.targetType = req.query.targetType;
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  sendPaginated(res, HTTP_STATUS.OK, 'Activity logs retrieved successfully', {
    logs,
    total,
    page,
    limit,
  });
});

module.exports = {
  getActivityLogs,
};
