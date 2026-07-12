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

// All routes require authentication
router.use(protect);

router
  .route('/')
  .post(authorize('admin'), createCategoryRules, validate, createCategory)
  .get(getCategories);

router
  .route('/:id')
  .get(getCategory)
  .put(authorize('admin'), updateCategoryRules, validate, updateCategory);

router.patch('/:id/activate', authorize('admin'), activateCategory);
router.patch('/:id/deactivate', authorize('admin'), deactivateCategory);

module.exports = router;
