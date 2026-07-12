const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/errors/AppError');
const { HTTP_STATUS } = require('../constants');
const sendEmail = require('../utils/email');

/**
 * @class AuthService
 * @desc Handles all authentication-related business logic including
 *       signup, login, password reset, and profile retrieval.
 */
class AuthService {
  /**
   * @desc Register a new user with role forced to 'employee'
   * @param {Object} data - User registration data
   * @returns {Object} Created user document
   * @throws {AppError} If email already exists
   */
  static async signup(data) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already registered', HTTP_STATUS.CONFLICT);
    }

    // Force role to 'employee' for security — only admins can promote
    data.role = 'employee';

    const user = await User.create(data);
    return user;
  }

  /**
   * @desc Authenticate user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} Authenticated user document
   * @throws {AppError} If credentials are invalid or account is deactivated
   */
  static async login(email, password) {
    // Find user and include password field for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if the account is active
    if (!user.isActive) {
      throw new AppError(
        'Your account has been deactivated. Please contact an administrator.',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Verify password using model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
    }

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    return user;
  }

  /**
   * @desc Generate password reset token and send reset email
   * @param {string} email - User's email address
   * @returns {string} Success message
   * @throws {AppError} If user not found with the provided email
   */
  static async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(
        'No user found with that email address',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Generate reset token using model method
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Build the password reset URL using CLIENT_URL env variable
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Compose the email message with branded HTML
    const message = `
      <h2>Password Reset Request</h2>
      <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'AssetFlow - Password Reset Request',
        html: message,
      });

      return 'Password reset email sent successfully';
    } catch (err) {
      // If email sending fails, clear the reset token fields to prevent stale tokens
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError(
        'Email could not be sent. Please try again later.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @desc Reset user password using the reset token
   * @param {string} resetToken - The unhashed reset token from the URL
   * @param {string} newPassword - The new password to set
   * @returns {Object} Updated user document
   * @throws {AppError} If token is invalid or expired
   */
  static async resetPassword(resetToken, newPassword) {
    // Hash the incoming token to match the stored hashed version
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid (non-expired) token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError(
        'Invalid or expired reset token',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Set the new password and clear reset fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    return user;
  }

  /**
   * @desc Retrieve the authenticated user's profile
   * @param {string} userId - The user's MongoDB ObjectId
   * @returns {Object} User profile with populated department
   * @throws {AppError} If user not found
   */
  static async getProfile(userId) {
    const user = await User.findById(userId).populate('department');

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }
}

module.exports = AuthService;
