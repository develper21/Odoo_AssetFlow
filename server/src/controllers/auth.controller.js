const AuthService = require('../services/auth.service');
const { sendSuccess } = require('../utils/responseHelper');
const { sendTokenResponse } = require('../utils/jwt');
const asyncHandler = require('../middlewares/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const user = await AuthService.signup(req.body);
  sendTokenResponse(user, HTTP_STATUS.CREATED, res);
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
  const { email, password } = req.body;
  const user = await AuthService.login(email, password);
  sendTokenResponse(user, HTTP_STATUS.OK, res);
});

/**
 * @desc    Log user out & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Clear the authentication cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  sendSuccess(res, HTTP_STATUS.OK, 'Logged out successfully');
});

/**
 * @desc    Forgot password — send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const message = await AuthService.forgotPassword(req.body.email);
  sendSuccess(res, HTTP_STATUS.OK, message);
});

/**
 * @desc    Reset password using token
 * @route   PUT /api/v1/auth/reset-password/:resetToken
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const user = await AuthService.resetPassword(
    req.params.resetToken,
    req.body.password
  );
  sendTokenResponse(user, HTTP_STATUS.OK, res);
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'Profile retrieved successfully', { user });
});

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};
