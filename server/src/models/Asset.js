/**
 * Asset Model - AssetFlow ERP System
 * 
 * Defines the Asset schema for registry, lifecycle tracking, and status.
 * Supports auto-generation of unique asset tags in the format AF-XXXX.
 * 
 * @module models/Asset
 */

const mongoose = require('mongoose');
const { ASSET_STATUS } = require('../constants');

const AssetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [100, 'Asset name cannot exceed 100 characters'],
    },
    assetTag: {
      type: String,
      unique: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Asset category is required'],
    },
    status: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.AVAILABLE,
    },
    currentHolderType: {
      type: String,
      enum: ['User', 'Department', null],
      default: null,
    },
    currentHolder: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'currentHolderType',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    acquisitionDate: {
      type: Date,
      required: [true, 'Acquisition date is required'],
    },
    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition cost is required'],
      min: [0, 'Acquisition cost cannot be negative'],
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'damaged', 'poor'],
      default: 'new',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    isBookable: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
      default: null,
    },
    documents: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by reference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
AssetSchema.index({ category: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ currentHolder: 1 });
AssetSchema.index({ currentHolderType: 1 });
AssetSchema.index({ name: 'text', description: 'text' }); // Text search index

// ---------------------------------------------------------------------------
// Pre-save Hooks (Middleware)
// ---------------------------------------------------------------------------

/**
 * Pre-save hook to auto-generate assetTag in the format AF-XXXX
 */
AssetSchema.pre('save', async function (next) {
  if (this.isNew && !this.assetTag) {
    try {
      // Find the asset with the highest tag number
      const lastAsset = await this.constructor.findOne(
        { assetTag: /^AF-\d+/ },
        { assetTag: 1 }
      ).sort({ assetTag: -1 });

      let nextNum = 1;
      if (lastAsset && lastAsset.assetTag) {
        const match = lastAsset.assetTag.match(/AF-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }

      // Pad with leading zeros to at least 4 digits
      const paddedNum = String(nextNum).padStart(4, '0');
      this.assetTag = `AF-${paddedNum}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Asset', AssetSchema);
