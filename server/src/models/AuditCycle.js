/**
 * AuditCycle Model - AssetFlow ERP System
 * 
 * Defines the AuditCycle schema for grouping asset verification tasks.
 * 
 * @module models/AuditCycle
 */

const mongoose = require('mongoose');

const AuditCycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Audit cycle name is required'],
      trim: true,
      maxlength: [100, 'Audit cycle name cannot exceed 100 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Audit start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Audit end date is required'],
    },
    auditors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'At least one auditor is required'],
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closedAt: {
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
AuditCycleSchema.index({ status: 1 });
AuditCycleSchema.index({ startDate: 1 });
AuditCycleSchema.index({ endDate: 1 });

module.exports = mongoose.model('AuditCycle', AuditCycleSchema);
