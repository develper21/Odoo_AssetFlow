const router = require('express').Router();
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth');

// Protect all notification routes
router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllNotificationsRead); // Must be before /:id/read
router.patch('/:id/read', markNotificationRead);

module.exports = router;
