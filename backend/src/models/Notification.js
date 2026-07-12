/**
 * Notification Model - AssetFlow ERP System
 * 
 * Stores lightweight, queryable system notifications for users.
 * 
 * @module models/Notification
 */

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    targetType: {
      type: String,
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
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
NotificationSchema.index({ user: 1 });
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ createdAt: -1 });

// Compound index for user checking read/unread status
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
