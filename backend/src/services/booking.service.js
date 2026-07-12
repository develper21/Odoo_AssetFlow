const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const NotificationService = require('./notification.service');
const ActivityLogService = require('./activityLog.service');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS, ASSET_STATUS } = require('../constants');
const { buildPaginationQuery } = require('../utils/helpers');

/**
 * @class BookingService
 * @desc Handles booking reservations, overlap checks, reschedules, cancellations, and logs.
 */
class BookingService {
  /**
   * @desc Reserve a shared bookable asset/resource
   * @param {Object} data - Booking reservation details
   * @param {string} userId - User creating the booking
   * @returns {Promise<Object>} The reserved booking record
   */
  static async create(data, userId) {
    const asset = await Asset.findById(data.resource);
    if (!asset) {
      throw new AppError('Resource asset not found', HTTP_STATUS.NOT_FOUND);
    }

    // Business Rule: Booking only allowed for shared/bookable assets
    if (!asset.isBookable) {
      throw new AppError('This resource is not marked as bookable/shared', HTTP_STATUS.BAD_REQUEST);
    }

    if ([ASSET_STATUS.RETIRED, ASSET_STATUS.DISPOSED].includes(asset.status)) {
      throw new AppError(`Cannot book a retired or disposed resource (Status: ${asset.status})`, HTTP_STATUS.BAD_REQUEST);
    }

    // Convert dates
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);

    // Business Rule: Booking system must reject overlapping bookings
    const overlap = await Booking.findOne({
      resource: asset._id,
      status: { $ne: 'cancelled' },
      startDateTime: { $lt: end },
      endDateTime: { $gt: start },
    });

    if (overlap) {
      throw new AppError(
        'Overlapping reservation exists for this resource during the requested timeframe',
        HTTP_STATUS.CONFLICT
      );
    }

    data.bookedBy = userId;
    data.status = 'upcoming';

    const booking = await Booking.create(data);

    // Auto-create notification
    await NotificationService.notify(
      userId,
      'Booking Confirmed',
      `Your reservation for resource ${asset.name} (${asset.assetTag}) is confirmed for ${start.toLocaleString()}.`,
      'booking_confirmed',
      'Booking',
      booking._id
    );

    // Log Activity
    await ActivityLogService.log(
      userId,
      'CREATE_BOOKING',
      'Booking',
      booking._id,
      `Reserved resource ${asset.assetTag} from ${start.toISOString()} to ${end.toISOString()}`
    );

    return booking;
  }

  /**
   * @desc Cancel an upcoming booking
   * @param {string} id - Booking ID to cancel
   * @param {Object} user - User requestor profile (for role checks)
   * @returns {Promise<Object>} Updated booking record
   */
  static async cancel(id, user) {
    const booking = await Booking.findById(id).populate('resource');
    if (!booking) {
      throw new AppError('Booking reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    // Enforce authorization: creator or admin/manager
    const isOwner = booking.bookedBy.toString() === user.id.toString();
    const isAuthorizedRole = ['admin', 'asset_manager'].includes(user.role);
    if (!isOwner && !isAuthorizedRole) {
      throw new AppError('You are not authorized to cancel this booking', HTTP_STATUS.FORBIDDEN);
    }

    if (booking.status === 'cancelled') {
      throw new AppError('This booking is already cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    booking.status = 'cancelled';
    await booking.save();

    // Auto-create notification
    await NotificationService.notify(
      booking.bookedBy,
      'Booking Cancelled',
      `Your reservation for resource ${booking.resource.name} has been cancelled.`,
      'booking_cancelled',
      'Booking',
      booking._id
    );

    // Log Activity
    await ActivityLogService.log(
      user.id,
      'CANCEL_BOOKING',
      'Booking',
      booking._id,
      `Cancelled reservation for resource ${booking.resource.assetTag}`
    );

    return booking;
  }

  /**
   * @desc Reschedule an upcoming booking
   * @param {string} id - Booking ID to reschedule
   * @param {Object} data - New start/end times
   * @param {Object} user - User requestor profile
   * @returns {Promise<Object>} Updated booking record
   */
  static async reschedule(id, data, user) {
    const booking = await Booking.findById(id).populate('resource');
    if (!booking) {
      throw new AppError('Booking reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    // Authorization checks
    const isOwner = booking.bookedBy.toString() === user.id.toString();
    const isAuthorizedRole = ['admin', 'asset_manager'].includes(user.role);
    if (!isOwner && !isAuthorizedRole) {
      throw new AppError('You are not authorized to reschedule this booking', HTTP_STATUS.FORBIDDEN);
    }

    if (booking.status === 'cancelled') {
      throw new AppError('Cannot reschedule a cancelled booking', HTTP_STATUS.BAD_REQUEST);
    }

    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);

    // Check overlap excluding this booking's own ID
    const overlap = await Booking.findOne({
      _id: { $ne: id },
      resource: booking.resource._id,
      status: { $ne: 'cancelled' },
      startDateTime: { $lt: end },
      endDateTime: { $gt: start },
    });

    if (overlap) {
      throw new AppError(
        'Overlapping reservation exists for this resource during the requested timeframe',
        HTTP_STATUS.CONFLICT
      );
    }

    booking.startDateTime = start;
    booking.endDateTime = end;
    booking.status = 'upcoming'; // Reset back to upcoming if it was ongoing/completed (unlikely edge case)
    await booking.save();

    // Auto-create notification
    await NotificationService.notify(
      booking.bookedBy,
      'Booking Rescheduled',
      `Your reservation for resource ${booking.resource.name} is rescheduled to ${start.toLocaleString()}.`,
      'booking_confirmed',
      'Booking',
      booking._id
    );

    // Log Activity
    await ActivityLogService.log(
      user.id,
      'RESCHEDULE_BOOKING',
      'Booking',
      booking._id,
      `Rescheduled reservation for resource ${booking.resource.assetTag} to ${start.toISOString()} - ${end.toISOString()}`
    );

    return booking;
  }

  /**
   * @desc Get booking history list per resource (calendar readiness)
   * @param {string} resourceId - Asset ID
   * @returns {Promise<Array>} Bookings array
   */
  static async getByResource(resourceId) {
    return await Booking.find({ resource: resourceId })
      .populate('bookedBy', 'firstName lastName email')
      .sort({ startDateTime: 1 });
  }

  /**
   * @desc List bookings with filter and pagination
   * @param {Object} query - Express query params
   * @returns {Promise<Object>} { bookings, total, page, limit }
   */
  static async getAll(query) {
    const { page, limit, skip } = buildPaginationQuery(query.page, query.limit);
    const filter = {};

    if (query.resource) {
      filter.resource = query.resource;
    }
    if (query.bookedBy) {
      filter.bookedBy = query.bookedBy;
    }
    if (query.status) {
      filter.status = query.status;
    }

    // Support start/end time queries for calendar UI matching
    if (query.startBefore) {
      filter.startDateTime = { $lte: new Date(query.startBefore) };
    }
    if (query.endAfter) {
      filter.endDateTime = { $gte: new Date(query.endAfter) };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('resource', 'name assetTag serialNumber location')
        .populate('bookedBy', 'firstName lastName email')
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return { bookings, total, page, limit };
  }
}

module.exports = BookingService;
