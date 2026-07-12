const router = require('express').Router();
const {
  getEmployees,
  getEmployee,
  updateEmployee,
  promoteEmployee,
  deactivateEmployee
} = require('../controllers/employee.controller');
const {
  updateEmployeeRules,
  promoteEmployeeRules
} = require('../validators/employee.validator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'asset_manager'), getEmployees);

router
  .route('/:id')
  .get(authorize('admin', 'asset_manager'), getEmployee)
  .put(authorize('admin'), updateEmployeeRules, validate, updateEmployee);

router.patch('/:id/promote', authorize('admin'), promoteEmployeeRules, validate, promoteEmployee);
router.patch('/:id/deactivate', authorize('admin'), deactivateEmployee);

module.exports = router;
