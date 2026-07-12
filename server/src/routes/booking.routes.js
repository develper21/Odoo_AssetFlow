const router = require('express').Router();
const {
  createBooking,
  cancelBooking,
  rescheduleBooking,
  getBookings,
  getResourceBookingHistory,
} = require('../controllers/booking.controller');
const { createBookingRules, rescheduleRules } = require('../validators/booking.validator');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');

// Protect all booking routes
router.use(protect);

router.post('/', createBookingRules, validate, createBooking);
router.get('/', getBookings);
router.post('/:id/cancel', cancelBooking);
router.put('/:id/reschedule', rescheduleRules, validate, rescheduleBooking);
router.get('/resource/:resourceId', getResourceBookingHistory);

module.exports = router;
