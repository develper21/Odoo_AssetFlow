const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * @class ActivityLogService
 * @desc Handles the creation of system audit logs.
 */
class ActivityLogService {
  /**
   * @desc Create an activity log record in the database
   * @param {string} userId - ID of the user performing the action
   * @param {string} action - Action name (e.g., 'CREATE_ASSET')
   * @param {string} targetType - Model type (e.g., 'Asset')
   * @param {string} targetId - ID of target document
   * @param {string} description - Descriptive message of the activity
   * @param {Object} [req] - Express request object to extract IP/User-Agent
   * @returns {Promise<Object>} Created ActivityLog document
   */
  static async log(userId, action, targetType, targetId, description, req = null) {
    try {
      const logData = {
        user: userId,
        action,
        targetType,
        targetId,
        description,
      };

      if (req) {
        logData.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        logData.userAgent = req.headers['user-agent'] || null;
      }

      const log = await ActivityLog.create(logData);
      logger.info(`Activity Logged: [${action}] by User ${userId} on ${targetType} ${targetId}`);
      return log;
    } catch (err) {
      // Graceful error handling for logging: write warning to console, do not fail parent process
      logger.warn(`Failed to write activity log: ${err.message}`);
      return null;
    }
  }
}

module.exports = ActivityLogService;
