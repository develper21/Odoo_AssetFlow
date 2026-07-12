const router = require('express').Router();
const {
  getUtilizationTrendsReport,
  getUsageComparisonReport,
  getMaintenanceFrequencyReport,
  getRetirementForecastReport,
  getDepartmentSummaryReport,
  getBookingHeatmapReport,
} = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants');

// Protect all reporting routes - restrict to managers & admin only
router.use(protect);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER));

router.get('/utilization', getUtilizationTrendsReport);
router.get('/usage-comparison', getUsageComparisonReport);
router.get('/maintenance-frequency', getMaintenanceFrequencyReport);
router.get('/retirement-forecast', getRetirementForecastReport);
router.get('/departments-summary', getDepartmentSummaryReport);
router.get('/bookings-heatmap', getBookingHeatmapReport);

module.exports = router;
