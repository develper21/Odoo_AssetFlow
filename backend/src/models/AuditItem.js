/**
 * AuditItem Model - AssetFlow ERP System
 * 
 * Defines the AuditItem schema for tracking verification status of a single asset.
 * 
 * @module models/AuditItem
 */

const mongoose = require('mongoose');

const AuditItemSchema = new mongoose.Schema(
  {
    auditCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditCycle',
      required: [true, 'Audit cycle reference is required'],
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'missing', 'damaged'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Verification notes cannot exceed 500 characters'],
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
AuditItemSchema.index({ auditCycle: 1 });
AuditItemSchema.index({ asset: 1 });
AuditItemSchema.index({ status: 1 });

// Prevent duplicate verification entries of the same asset in a single audit cycle
AuditItemSchema.index({ auditCycle: 1, asset: 1 }, { unique: true });

module.exports = mongoose.model('AuditItem', AuditItemSchema);
