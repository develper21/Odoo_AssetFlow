const router = require('express').Router();
const { getActivityLogs } = require('../controllers/activityLog.controller');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants');

router.get(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  getActivityLogs
);

module.exports = router;
