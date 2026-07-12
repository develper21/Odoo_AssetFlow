const router = require('express').Router();
const {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  retireAsset,
  getAssetSummary,
} = require('../controllers/asset.controller');
const { createAssetRules, updateAssetRules } = require('../validators/asset.validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants');

// Summary endpoint must be declared BEFORE /:id to prevent parameter matching conflict
router.get(
  '/summary',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  getAssetSummary
);

router.post(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  createAssetRules,
  validate,
  createAsset
);

router.get('/', protect, getAssets);

router.get('/:id', protect, getAsset);

router.put(
  '/:id',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  updateAssetRules,
  validate,
  updateAsset
);

router.delete(
  '/:id',
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER),
  retireAsset
);

module.exports = router;
