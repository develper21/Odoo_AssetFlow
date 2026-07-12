const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Department = require('../models/Department');
const AssetCategory = require('../models/AssetCategory');
const mongoose = require('mongoose');

/**
 * @class ReportService
 * @desc Uses Mongoose Aggregation pipelines to fetch clean, production-ready operational statistics.
 */
class ReportService {
  /**
   * @desc utilization trends: total checkout count and active counts grouped by month
   */
  static async getUtilizationTrends(filters = {}) {
    const match = {};
    if (filters.startDate || filters.endDate) {
      match.createdAt = {};
      if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
    }

    return await Allocation.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalAllocations: { $sum: 1 },
          activeAllocations: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  }

  /**
   * @desc Most used vs Idle assets
   */
  static async getIdleVsMostUsed(filters = {}) {
    const limit = parseInt(filters.limit, 10) || 5;

    // Most used (assets with most allocations)
    const mostUsed = await Allocation.aggregate([
      {
        $group: {
          _id: '$asset',
          checkoutCount: { $sum: 1 },
        },
      },
      { $sort: { checkoutCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'assetInfo',
        },
      },
      { $unwind: '$assetInfo' },
      {
        $project: {
          _id: 1,
          name: '$assetInfo.name',
          assetTag: '$assetInfo.assetTag',
          status: '$assetInfo.status',
          checkoutCount: 1,
        },
      },
    ]);

    // Idle assets (available assets with zero active checkouts or lowest overall allocations)
    const idleMatch = { status: 'available' };
    if (filters.category) {
      idleMatch.category = new mongoose.Types.ObjectId(filters.category);
    }

    const idle = await Asset.aggregate([
      { $match: idleMatch },
      {
        $lookup: {
          from: 'allocations',
          localField: '_id',
          foreignField: 'asset',
          as: 'allocationsInfo',
        },
      },
      {
        $project: {
          name: 1,
          assetTag: 1,
          condition: 1,
          location: 1,
          allocationCount: { $size: '$allocationsInfo' },
        },
      },
      { $sort: { allocationCount: 1 } },
      { $limit: limit },
    ]);

    return { mostUsed, idle };
  }

  /**
   * @desc Maintenance frequency by asset and category
   */
  static async getMaintenanceFrequency(filters = {}) {
    const match = {};
    if (filters.startDate || filters.endDate) {
      match.createdAt = {};
      if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
    }

    return await MaintenanceRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$asset',
          maintenanceCount: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { maintenanceCount: -1 } },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'assetInfo',
        },
      },
      { $unwind: '$assetInfo' },
      {
        $project: {
          _id: 1,
          name: '$assetInfo.name',
          assetTag: '$assetInfo.assetTag',
          maintenanceCount: 1,
          resolvedCount: 1,
        },
      },
    ]);
  }

  /**
   * @desc Assets nearing retirement based on category usefulLifeYears
   */
  static async getRetirementForecast(filters = {}) {
    // We aggregate assets and look up their category depreciation/life spans
    return await Asset.aggregate([
      {
        $lookup: {
          from: 'assetcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          name: 1,
          assetTag: 1,
          acquisitionDate: 1,
          acquisitionCost: 1,
          status: 1,
          usefulLifeYears: '$categoryInfo.usefulLifeYears',
          yearsInService: {
            $divide: [
              { $subtract: [new Date(), '$acquisitionDate'] },
              1000 * 60 * 60 * 24 * 365.25,
            ],
          },
        },
      },
      {
        $project: {
          name: 1,
          assetTag: 1,
          acquisitionDate: 1,
          status: 1,
          usefulLifeYears: 1,
          yearsInService: 1,
          remainingYears: { $subtract: ['$usefulLifeYears', '$yearsInService'] },
        },
      },
      // Show assets with <= 1 year left or already exceeded useful life
      { $match: { remainingYears: { $lte: 1.0 }, status: { $ne: 'retired' } } },
      { $sort: { remainingYears: 1 } },
    ]);
  }

  /**
   * @desc Department-wise asset value and allocation count summary
   */
  static async getDepartmentSummary(filters = {}) {
    return await Asset.aggregate([
      { $match: { department: { $ne: null } } },
      {
        $group: {
          _id: '$department',
          totalAssetCount: { $sum: 1 },
          totalValue: { $sum: '$acquisitionCost' },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo',
        },
      },
      { $unwind: '$deptInfo' },
      {
        $project: {
          _id: 1,
          departmentName: '$deptInfo.name',
          departmentCode: '$deptInfo.code',
          totalAssetCount: 1,
          totalValue: 1,
        },
      },
      { $sort: { totalValue: -1 } },
    ]);
  }

  /**
   * @desc Resource booking heatmap / peak usage windows
   */
  static async getBookingHeatmap(filters = {}) {
    return await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: '$startDateTime' },
          hourOfDay: { $hour: '$startDateTime' },
        },
      },
      {
        $group: {
          _id: {
            dayOfWeek: '$dayOfWeek',
            hourOfDay: '$hourOfDay',
          },
          bookingCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: '$_id.dayOfWeek',
          hourOfDay: '$_id.hourOfDay',
          bookingCount: 1,
        },
      },
      { $sort: { bookingCount: -1 } },
    ]);
  }
}

module.exports = ReportService;
