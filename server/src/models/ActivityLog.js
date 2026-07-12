/**
 * ActivityLog Model - AssetFlow ERP System
 * 
 * Records system-wide audit logs for security, compliance, and transparency.
 * 
 * @module models/ActivityLog
 */

const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
    },
    targetType: {
      type: String,
      required: [true, 'Target document type is required'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target document ID is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log creation time
  }
);

// Indexes for high performance lookup
ActivityLogSchema.index({ user: 1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ targetId: 1 });
ActivityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
