const router = require('express').Router();
const {
  createRequest,
  approveRequest,
  rejectRequest,
  getTransfers,
} = require('../controllers/transfer.controller');
const { requestRules, approveRules, rejectRules } = require('../validators/transfer.validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants');

// Apply protection to all transfer routes
router.use(protect);

router.post(
  '/request',
  requestRules,
  validate,
  createRequest
);

router.patch(
  '/:id/approve',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER, USER_ROLES.DEPARTMENT_HEAD),
  approveRules,
  validate,
  approveRequest
);

router.patch(
  '/:id/reject',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER, USER_ROLES.DEPARTMENT_HEAD),
  rejectRules,
  validate,
  rejectRequest
);

router.get('/', getTransfers);

module.exports = router;
