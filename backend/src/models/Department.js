/**
 * Department Model - AssetFlow ERP System
 * 
 * Defines the Department schema for organizational structure management.
 * Supports hierarchical department trees via the parentDepartment field,
 * enabling nested org-chart representations.
 * 
 * Features:
 *   - Unique department codes (auto-uppercased)
 *   - Hierarchical structure (parent-child relationships)
 *   - Head of Department reference
 *   - Budget tracking per department
 *   - Virtual employee count field
 * 
 * @module models/Department
 */

const mongoose = require('mongoose');

// ---------------------------------------------------------------------------
// Schema Definition
// ---------------------------------------------------------------------------

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Department code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative'],
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
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ isActive: 1 });

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------

/**
 * Virtual field: employeeCount
 * 
 * Returns the number of User documents whose `department` field
 * references this department's _id.
 * 
 * NOTE: This virtual uses a getter that performs a database query.
 * For performance-critical paths, consider using aggregation pipelines
 * or caching the count on the department document instead.
 * 
 * Usage with virtual populate (preferred approach):
 *   await department.populate('employees');
 *   const count = department.employees.length;
 * 
 * This virtual populate configuration allows:
 *   Department.findById(id).populate('employees')
 */
DepartmentSchema.virtual('employees', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: false, // Set to true if you only need the count
});

/**
 * Convenience virtual that returns the count of employees
 * in this department. This relies on the 'employees' virtual
 * populate being executed first.
 * 
 * Usage:
 *   const dept = await Department.findById(id).populate('employees');
 *   console.log(dept.employeeCount); // Number of employees
 */
DepartmentSchema.virtual('employeeCount').get(function () {
  if (this.employees && Array.isArray(this.employees)) {
    return this.employees.length;
  }
  return 0;
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

module.exports = mongoose.model('Department', DepartmentSchema);
