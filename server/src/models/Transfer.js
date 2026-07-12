/**
 * Transfer Model - AssetFlow ERP System
 * 
 * Tracks requests and approvals to transfer assets between employees or departments.
 * 
 * @module models/Transfer
 */

const mongoose = require('mongoose');
const { TRANSFER_STATUS } = require('../constants');

const TransferSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required'],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requestor reference is required'],
    },
    fromDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    toDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Target user is required'],
    },
    status: {
      type: String,
      enum: Object.values(TRANSFER_STATUS),
      default: TRANSFER_STATUS.PENDING,
    },
    requestReason: {
      type: String,
      required: [true, 'Request reason is required'],
      trim: true,
      maxlength: [500, 'Request reason cannot exceed 500 characters'],
    },
    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actionedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
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
TransferSchema.index({ asset: 1 });
TransferSchema.index({ requestedBy: 1 });
TransferSchema.index({ toUser: 1 });
TransferSchema.index({ status: 1 });

module.exports = mongoose.model('Transfer', TransferSchema);
