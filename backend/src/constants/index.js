/**
 * @fileoverview Application-wide enums and constants.
 * Single source of truth for all status strings, role names,
 * pagination defaults, and HTTP status codes.
 */

// ── User Roles ────────────────────────────────────────────────
const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE: 'employee',
});

const ROLES_ARRAY = Object.values(USER_ROLES);

// ── Asset Lifecycle ───────────────────────────────────────────
const ASSET_STATUS = Object.freeze({
  AVAILABLE: 'available',
  ALLOCATED: 'allocated',
  UNDER_MAINTENANCE: 'under_maintenance',
  RETIRED: 'retired',
  DISPOSED: 'disposed',
  LOST: 'lost',
});

// ── Allocation ────────────────────────────────────────────────
const ALLOCATION_STATUS = Object.freeze({
  ACTIVE: 'active',
  RETURNED: 'returned',
  TRANSFERRED: 'transferred',
});

// ── Transfer Requests ─────────────────────────────────────────
const TRANSFER_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
});

// ── Maintenance ───────────────────────────────────────────────
const MAINTENANCE_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  TECHNICIAN_ASSIGNED: 'technician_assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
});

// ── Booking ───────────────────────────────────────────────────
const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

// ── Audit ─────────────────────────────────────────────────────
const AUDIT_STATUS = Object.freeze({
  CREATED: 'created',
  AUDITOR_ASSIGNED: 'auditor_assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CLOSED: 'closed',
});

// ── Notification Types ────────────────────────────────────────
const NOTIFICATION_TYPES = Object.freeze({
  ASSET_ASSIGNED: 'asset_assigned',
  TRANSFER_APPROVED: 'transfer_approved',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_REMINDER: 'booking_reminder',
  BOOKING_CANCELLED: 'booking_cancelled',
  MAINTENANCE_APPROVED: 'maintenance_approved',
  MAINTENANCE_REJECTED: 'maintenance_rejected',
  MAINTENANCE_ASSIGNED: 'maintenance_assigned',
  MAINTENANCE_RESOLVED: 'maintenance_resolved',
  OVERDUE_RETURN: 'overdue_return',
  AUDIT_REPORT: 'audit_report',
  AUDIT_STARTED: 'audit_started',
  AUDIT_DISCREPANCY: 'audit_discrepancy_flagged',
  AUDIT_CLOSED: 'audit_closed',
  REPORT_READY: 'report_ready',
});

// ── HTTP Status Codes ─────────────────────────────────────────
const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500,
});

// ── Pagination Defaults ───────────────────────────────────────
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

module.exports = {
  USER_ROLES,
  ROLES_ARRAY,
  ASSET_STATUS,
  ALLOCATION_STATUS,
  TRANSFER_STATUS,
  MAINTENANCE_STATUS,
  BOOKING_STATUS,
  AUDIT_STATUS,
  NOTIFICATION_TYPES,
  HTTP_STATUS,
  PAGINATION,
};
