/**
 * AssetCategory Model - AssetFlow ERP System
 * 
 * Defines the AssetCategory schema for organizing and classifying assets.
 * Supports hierarchical category trees via the parentCategory field,
 * enabling nested categorization (e.g., Electronics > Laptops > Gaming Laptops).
 * 
 * Features:
 *   - Unique category codes (auto-uppercased)
 *   - Hierarchical structure (parent-child relationships)
 *   - Depreciation rate tracking (percentage per year)
 *   - Useful life estimation in years
 *   - Active/inactive status management
 * 
 * @module models/AssetCategory
 */

const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Schema Definition
// ---------------------------------------------------------------------------

const AssetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Category code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Category code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    depreciationRate: {
      type: Number,
      default: 0,
      min: [0, 'Depreciation rate cannot be negative'],
      max: [100, 'Depreciation rate cannot exceed 100'],
    },
    usefulLifeYears: {
      type: Number,
      default: 0,
      min: [0, 'Useful life cannot be negative'],
    },
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

// code already has `unique: true` which creates an index automatically.
// Additional indexes for commonly queried fields.
AssetCategorySchema.index({ name: 1 });
AssetCategorySchema.index({ isActive: 1 });

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

module.exports = mongoose.model('AssetCategory', AssetCategorySchema);
