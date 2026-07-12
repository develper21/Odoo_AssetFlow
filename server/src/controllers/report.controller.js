const ReportService = require('../services/report.service');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * Helper to convert JSON arrays to CSV format
 */
function jsonToCsv(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return 'No data available';
  }

  // Flatten nested objects one level for CSV headers
  const flattened = dataArray.map(item => {
    const flatItem = {};
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'object' && value !== null) {
        for (const [subKey, subVal] of Object.entries(value)) {
          flatItem[`${key}_${subKey}`] = subVal;
        }
      } else {
        flatItem[key] = value;
      }
    }
    return flatItem;
  });

  const headers = Object.keys(flattened[0]);
  const rows = flattened.map(item =>
    headers.map(header => {
      const value = item[header] ?? '';
      // Escape double quotes
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Helper to dynamically respond in JSON or CSV format
 */
function sendFormattedReport(res, reportData, reportName) {
  // If format is requested as csv, stream file attachment download
  if (res.req.query.format === 'csv') {
    const csvContent = jsonToCsv(reportData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportName || 'report'}.csv`);
    return res.status(HTTP_STATUS.OK).send(csvContent);
  }

  // Otherwise return standard JSON format
  return sendSuccess(res, HTTP_STATUS.OK, 'Report compiled successfully', reportData);
}

/**
 * @desc    Get asset utilization trends
 * @route   GET /api/v1/reports/utilization
 * @access  Private/Admin, Asset Manager
 */
const getUtilizationTrendsReport = asyncHandler(async (req, res) => {
  const data = await ReportService.getUtilizationTrends(req.query);
  sendFormattedReport(res, data, 'utilization_trends');
});

/**
 * @desc    Get most-used vs idle assets
 * @route   GET /api/v1/reports/usage-comparison
 * @access  Private/Admin, Asset Manager
 */
const getUsageComparisonReport = asyncHandler(async (req, res) => {
  const data = await ReportService.getIdleVsMostUsed(req.query);
  
  if (req.query.format === 'csv') {
    // If CSV is requested, we merge them or pick one
    const merged = [
      ...data.mostUsed.map(a => ({ ...a, type: 'Most Used' })),
      ...data.idle.map(a => ({ ...a, type: 'Idle' }))
    ];
    return sendFormattedReport(res, merged, 'usage_comparison');
  }

  sendSuccess(res, HTTP_STATUS.OK, 'Usage comparison report compiled successfully', data);
});

/**
 * @desc    Get maintenance frequency report
 * @route   GET /api/v1/reports/maintenance-frequency
 * @access  Private/Admin, Asset Manager
 */
const getMaintenanceFrequencyReport = asyncHandler(async (req, res) => {
  const data = await ReportService.getMaintenanceFrequency(req.query);
  sendFormattedReport(res, data, 'maintenance_frequency');
});

/**
 * @desc    Get assets nearing retirement forecast
 * @route   GET /api/v1/reports/retirement-forecast
 * @access  Private/Admin, Asset Manager
 */
const getRetirementForecastReport = asyncHandler(async (req, res) => {
  const data = await ReportService.getRetirementForecast(req.query);
  sendFormattedReport(res, data, 'retirement_forecast');
});

/**
 * @desc    Get department asset summary reports
 * @route   GET /api/v1/reports/departments-summary
 * @access  Private/Admin, Asset Manager
 */
const getDepartmentSummaryReport = asyncHandler(async (req, res) => {
  const data = await ReportService.getDepartmentSummary(req.query);
  sendFormattedReport(res, data, 'departments_summary');
});

/**
 * @desc    Get bookings heatmap analytics
 * @route   GET /api/v1/reports/bookings-heatmap
 * @access  Private/Admin, Asset Manager
 */
const getBookingHeatmapReport = asyncHandler(async (req, res) => {
  const data = await ReportService.getBookingHeatmap(req.query);
  sendFormattedReport(res, data, 'bookings_heatmap');
});

module.exports = {
  getUtilizationTrendsReport,
  getUsageComparisonReport,
  getMaintenanceFrequencyReport,
  getRetirementForecastReport,
  getDepartmentSummaryReport,
  getBookingHeatmapReport,
};
