const router = require('express').Router();
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  activateDepartment,
  deactivateDepartment
} = require('../controllers/department.controller');
const {
  createDepartmentRules,
  updateDepartmentRules
} = require('../validators/department.validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

router
  .route('/')
  .post(authorize('admin'), createDepartmentRules, validate, createDepartment)
  .get(getDepartments);

router
  .route('/:id')
  .get(getDepartment)
  .put(authorize('admin'), updateDepartmentRules, validate, updateDepartment);

router.patch('/:id/activate', authorize('admin'), activateDepartment);
router.patch('/:id/deactivate', authorize('admin'), deactivateDepartment);

module.exports = router;
