const DashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Get dashboard statistics based on user role
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await DashboardService.getStats(req.user);
  sendSuccess(
    res,
    HTTP_STATUS.OK,
    'Dashboard statistics retrieved successfully',
    stats
  );
});

module.exports = {
  getStats,
};
