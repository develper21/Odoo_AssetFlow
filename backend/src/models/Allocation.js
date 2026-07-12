/**
 * Allocation Model - AssetFlow ERP System
 * 
 * Tracks the checkout, possession, and return of assets.
 * Supports allocating to either a User (Employee) or a Department.
 * 
 * @module models/Allocation
 */

const mongoose = require('mongoose');
const { ALLOCATION_STATUS } = require('../constants');

const AllocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required'],
    },
    allocateToType: {
      type: String,
      required: [true, 'Allocation target type is required'],
      enum: ['User', 'Department'],
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Allocation target ID is required'],
      refPath: 'allocateToType',
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Allocated by reference is required'],
    },
    allocatedDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ALLOCATION_STATUS),
      default: ALLOCATION_STATUS.ACTIVE,
    },
    checkOutCondition: {
      type: String,
      required: [true, 'Check-out condition is required'],
      trim: true,
    },
    checkInCondition: {
      type: String,
      trim: true,
      default: null,
    },
    checkInNotes: {
      type: String,
      trim: true,
      default: null,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
AllocationSchema.index({ asset: 1 });
AllocationSchema.index({ allocatedTo: 1 });
AllocationSchema.index({ allocateToType: 1 });
AllocationSchema.index({ status: 1 });
AllocationSchema.index({ expectedReturnDate: 1 });

module.exports = mongoose.model('Allocation', AllocationSchema);
