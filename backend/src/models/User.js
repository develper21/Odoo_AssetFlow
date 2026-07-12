/**
 * User Model - AssetFlow ERP System
 * 
 * Defines the User schema for authentication, authorization, and employee management.
 * Supports role-based access control (RBAC) with four roles:
 *   - admin: Full system access
 *   - asset_manager: Manages assets, categories, and assignments
 *   - department_head: Manages department-level operations
 *   - employee: Standard user with limited access
 * 
 * Features:
 *   - Auto-generated employee IDs (EMP-XXXXXXXX)
 *   - Password hashing with bcrypt (salt rounds: 12)
 *   - JWT token generation for authentication
 *   - Password reset token generation with expiry
 *   - Virtual field for full name
 * 
 * @module models/User
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// ---------------------------------------------------------------------------
// Schema Definition
// ---------------------------------------------------------------------------

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password by default in queries
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'asset_manager', 'department_head', 'employee'],
      default: 'employee',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    employeeId: {
      type: String,
      unique: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
    lastLogin: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// email already has `unique: true` which creates an index automatically.
// We add additional indexes for frequently queried fields.
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ isActive: 1 });

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------

/**
 * Virtual field that returns the user's full name by combining
 * firstName and lastName.
 */
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ---------------------------------------------------------------------------
// Pre-save Hooks (Middleware)
// ---------------------------------------------------------------------------

/**
 * Pre-save hook #1 – Auto-generate employeeId
 * 
 * When a new User document is created without an explicit employeeId,
 * we generate one using the format: EMP-<first 8 chars of a UUID v4>
 * This ensures uniqueness while keeping IDs human-readable.
 */
UserSchema.pre('save', function (next) {
  if (this.isNew && !this.employeeId) {
    const shortUuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    this.employeeId = `EMP-${shortUuid}`;
  }
  next();
});

/**
 * Pre-save hook #2 – Hash password
 * 
 * Hashes the password field using bcrypt with 12 salt rounds whenever
 * the password is new or has been modified. This prevents re-hashing
 * on every save.
 */
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------

/**
 * Compare an entered plain-text password with the hashed password
 * stored in the database.
 * 
 * @param {string} enteredPassword - The plain-text password to verify
 * @returns {Promise<boolean>} True if the passwords match, false otherwise
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate a signed JSON Web Token (JWT) for authentication.
 * The token payload contains the user's MongoDB _id.
 * 
 * Environment variables required:
 *   - JWT_SECRET: Secret key used to sign the token
 *   - JWT_EXPIRE: Token expiration time (e.g., '30d', '7d', '24h')
 * 
 * @returns {string} The signed JWT string
 */
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/**
 * Generate a password reset token using Node's crypto module.
 * 
 * This method:
 *   1. Generates a random 20-byte hex token (sent to user via email)
 *   2. Hashes the token using SHA-256 and stores it in passwordResetToken
 *   3. Sets passwordResetExpire to 10 minutes from now
 *   4. Returns the unhashed token (for inclusion in the reset URL)
 * 
 * @returns {string} The unhashed reset token to send to the user
 */
UserSchema.methods.getResetPasswordToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and store it in the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiry to 10 minutes from now
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  // Return the unhashed token (this is what gets sent to the user)
  return resetToken;
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

module.exports = mongoose.model('User', UserSchema);
