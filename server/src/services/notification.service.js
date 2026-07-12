const Notification = require('../models/Notification');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * @class NotificationService
 * @desc Handles creating, fetching, and reading user notifications.
 */
class NotificationService {
  /**
   * @desc Dispatch a notification to a specific user
   * @param {string} userId - Target user ID
   * @param {string} title - Title of notification
   * @param {string} message - Message body
   * @param {string} type - Notification classification
   * @param {string} [targetType=null] - Linked model name
   * @param {string} [targetId=null] - Linked model ObjectId
   * @returns {Promise<Object>} Created notification document
   */
  static async notify(userId, title, message, type, targetType = null, targetId = null) {
    try {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        targetType,
        targetId,
      });
      logger.info(`Notification dispatched to User ${userId}: ${title}`);
      return notification;
    } catch (err) {
      logger.warn(`Failed to dispatch notification: ${err.message}`);
      return null;
    }
  }

  /**
   * @desc Get paginated notifications list for a user
   * @param {string} userId - User ObjectId
   * @param {Object} query - Query parameters (page, limit, read)
   * @returns {Promise<Object>} { notifications, total, page, limit }
   */
  static async getUserNotifications(userId, query) {
    const { page, limit, skip } = buildPaginationQuery(query.page, query.limit);
    const filter = { user: userId };

    if (query.read !== undefined) {
      filter.read = query.read === 'true';
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    return { notifications, total, page, limit };
  }

  /**
   * @desc Mark a single notification as read
   * @param {string} id - Notification ID
   * @param {string} userId - Owner user ID
   * @returns {Promise<Object>} Updated notification
   */
  static async markRead(id, userId) {
    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
      throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
    }

    notification.read = true;
    await notification.save();
    return notification;
  }

  /**
   * @desc Mark all user's notifications as read
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Write result
   */
  static async markAllRead(userId) {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );
    return { modifiedCount: result.modifiedCount };
  }
}

module.exports = NotificationService;
