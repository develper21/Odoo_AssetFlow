const BookingService = require('../services/booking.service');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Create a resource booking
 * @route   POST /api/v1/bookings
 * @access  Private
 */
const createBooking = asyncHandler(async (req, res) => {
  const booking = await BookingService.create(req.body, req.user.id);
  sendSuccess(res, HTTP_STATUS.CREATED, 'Booking reserved successfully', {
    booking,
  });
});

/**
 * @desc    Cancel a booking
 * @route   POST /api/v1/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await BookingService.cancel(req.params.id, req.user);
  sendSuccess(res, HTTP_STATUS.OK, 'Booking cancelled successfully', {
    booking,
  });
});

/**
 * @desc    Reschedule an existing booking
 * @route   PUT /api/v1/bookings/:id/reschedule
 * @access  Private
 */
const rescheduleBooking = asyncHandler(async (req, res) => {
  const booking = await BookingService.reschedule(req.params.id, req.body, req.user);
  sendSuccess(res, HTTP_STATUS.OK, 'Booking rescheduled successfully', {
    booking,
  });
});

/**
 * @desc    List bookings with search, filters, and pagination
 * @route   GET /api/v1/bookings
 * @access  Private
 */
const getBookings = asyncHandler(async (req, res) => {
  const result = await BookingService.getAll(req.query);
  sendPaginated(res, HTTP_STATUS.OK, 'Bookings retrieved successfully', {
    bookings: result.bookings,
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * @desc    Get booking history for a specific resource
 * @route   GET /api/v1/bookings/resource/:resourceId
 * @access  Private
 */
const getResourceBookingHistory = asyncHandler(async (req, res) => {
  const history = await BookingService.getByResource(req.params.resourceId);
  sendSuccess(res, HTTP_STATUS.OK, 'Resource booking history retrieved successfully', {
    history,
  });
});

module.exports = {
  createBooking,
  cancelBooking,
  rescheduleBooking,
  getBookings,
  getResourceBookingHistory,
};
