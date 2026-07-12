const router = require('express').Router();
const {
  createCycle,
  startCycle,
  verifyAsset,
  closeCycle,
  getDiscrepancyReport,
  getCycleDetails,
  getCycles,
} = require('../controllers/audit.controller');
const { createAuditCycleRules, verifyAssetRules } = require('../validators/audit.validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants');

// Protect all audit routes
router.use(protect);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  createAuditCycleRules,
  validate,
  createCycle
);

router.post(
  '/:id/start',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  startCycle
);

router.post(
  '/:id/verify/:assetId',
  verifyAssetRules,
  validate,
  verifyAsset
);

router.post(
  '/:id/close',
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  closeCycle
);

router.get(
  '/:id/discrepancies',
  getDiscrepancyReport
);

router.get(
  '/:id',
  getCycleDetails
);

router.get(
  '/',
  getCycles
);

module.exports = router;
