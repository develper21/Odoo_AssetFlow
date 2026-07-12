/**
 * Booking Model - AssetFlow ERP System
 * 
 * Defines the Booking schema for reserving shared resources/assets.
 * Ensures overlap prevention indexes.
 * 
 * @module models/Booking
 */

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Resource reference is required'],
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date and time is required'],
    },
    endDateTime: {
      type: Date,
      required: [true, 'End date and time is required'],
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of booking is required'],
      trim: true,
      maxlength: [200, 'Purpose cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
BookingSchema.index({ resource: 1 });
BookingSchema.index({ bookedBy: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ startDateTime: 1 });
BookingSchema.index({ endDateTime: 1 });

// Compound index for schedule overlap queries
BookingSchema.index({ resource: 1, startDateTime: 1, endDateTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
