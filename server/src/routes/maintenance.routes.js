const router = require('express').Router();
const {
  createRequest,
  transitionStatus,
  getMaintenanceRequests,
  getAssetMaintenanceHistory,
} = require('../controllers/maintenance.controller');
const { createMaintenanceRules } = require('../validators/maintenance.validator');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');

// Protect all maintenance routes
router.use(protect);

router.post('/', createMaintenanceRules, validate, createRequest);
router.get('/', getMaintenanceRequests);
router.get('/asset/:assetId', getAssetMaintenanceHistory);
router.patch('/:id/status', transitionStatus);

module.exports = router;
