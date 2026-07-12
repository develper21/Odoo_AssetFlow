const router = require('express').Router();
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  activateCategory,
  deactivateCategory
} = require('../controllers/assetCategory.controller');
const {
  createCategoryRules,
  updateCategoryRules
} = require('../validators/assetCategory.validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');

// All routes except GET / require authentication
router
  .route('/')
  .post(protect, authorize('admin'), createCategoryRules, validate, createCategory)
  .get(getCategories);

router
  .route('/:id')
  .get(protect, getCategory)
  .put(protect, authorize('admin'), updateCategoryRules, validate, updateCategory);

router.patch('/:id/activate', protect, authorize('admin'), activateCategory);
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateCategory);

module.exports = router;
