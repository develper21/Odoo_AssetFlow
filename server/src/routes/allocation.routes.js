const router = require('express').Router();
const {
  allocateAsset,
  returnAsset,
  getOverdueAllocations,
  getAllAllocations,
} = require('../controllers/allocation.controller');
const { allocateRules, returnRules } = require('../validators/allocation.validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants');

// Apply protection to all allocation routes
router.use(protect);

router.get('/', getAllAllocations);

router.get(
  '/overdue',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  getOverdueAllocations
);

router.post(
  '/checkout',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  allocateRules,
  validate,
  allocateAsset
);

router.post(
  '/check-in/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  returnRules,
  validate,
  returnAsset
);

module.exports = router;
