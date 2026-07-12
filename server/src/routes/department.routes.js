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

// All routes except GET / require authentication
router
  .route('/')
  .post(protect, authorize('admin'), createDepartmentRules, validate, createDepartment)
  .get(getDepartments);

router
  .route('/:id')
  .get(protect, getDepartment)
  .put(protect, authorize('admin'), updateDepartmentRules, validate, updateDepartment);

router.patch('/:id/activate', protect, authorize('admin'), activateDepartment);
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateDepartment);

module.exports = router;
