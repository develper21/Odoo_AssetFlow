const router = require('express').Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/auth.controller');
const {
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules
} = require('../validators/auth.validator');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

// Public routes (rate limited)
router.post('/signup', authLimiter, signupRules, validate, signup);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.put('/reset-password/:token', resetPasswordRules, validate, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
