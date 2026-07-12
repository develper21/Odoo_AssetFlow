const NotificationService = require('../services/notification.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Get current user's notifications (paginated)
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await NotificationService.getUserNotifications(req.user.id, req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Notifications retrieved successfully', {
    notifications: result.notifications,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markRead(req.params.id, req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Notification marked as read successfully', {
    notification,
  });
});

/**
 * @desc    Mark all user's notifications as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await NotificationService.markAllRead(req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'All notifications marked as read successfully', {
    modifiedCount: result.modifiedCount,
  });
});

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
