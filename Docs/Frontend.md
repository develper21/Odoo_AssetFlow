
# AssetFlow Frontend Master Planning (MVP + Bonus)

> Goal: Build the complete frontend first. Backend, database and APIs will be implemented after the frontend is finalized.

---

# Development Strategy

## Phase 1 (Mandatory MVP)
Implement ONLY the features described in the Odoo problem statement.

## Phase 2 (Bonus)
Implement bonus features only if the mandatory MVP is finished and there is remaining hackathon time.

---

# Frontend Architecture

## Authentication
- Login
- Signup (Employee only)
- Forgot Password
- Session Loader
- Unauthorized Page

Role redirection:
- Admin
- Asset Manager
- Department Head
- Employee

---

# User Roles

## Admin
Responsibilities
- Organization Setup
- Employee Promotion
- Reports
- Dashboard
- Audit Management

Pages
- Dashboard
- Departments
- Asset Categories
- Employee Directory
- Audit Cycles
- Reports
- Notifications
- Profile
- Settings

---

## Asset Manager

Pages
- Dashboard
- Asset Registry
- Register Asset
- Asset Details
- Allocation
- Transfer Requests
- Returns
- Maintenance
- Resource Booking
- Audit
- Reports
- Notifications
- Profile

---

## Department Head

Pages
- Dashboard
- Department Assets
- Approvals
- Department Booking
- Reports
- Notifications
- Profile

---

## Employee

Pages
- Dashboard
- My Assets
- Resource Booking
- Raise Maintenance
- Transfer Request
- Return Asset
- Notifications
- Profile

---

# Frontend Modules

## 1. Authentication

Components
- Login Form
- Signup Form
- Password Reset
- Route Guard

---

## 2. Dashboard

Widgets
- Assets Available
- Assets Allocated
- Maintenance Today
- Active Bookings
- Upcoming Returns
- Pending Transfers

Components
- KPI Cards
- Charts
- Activity Feed
- Quick Actions

---

## 3. Organization Setup

Pages
- Departments
- Asset Categories
- Employee Directory

Components
- Data Table
- Create/Edit Modal
- Search
- Filters
- Pagination

---

## 4. Asset Registry

Pages
- Asset List
- Asset Details
- Register Asset

Components
- Asset Card
- History Timeline
- Status Badge
- Image Viewer
- Document Viewer

---

## 5. Asset Allocation

Pages
- Allocate Asset
- Transfer Requests
- Return Asset

Components
- Employee Selector
- Asset Selector
- Allocation Timeline
- Approval Status

---

## 6. Resource Booking

Pages
- Booking Calendar
- Booking Form

Components
- Calendar
- Time Slot Picker
- Booking Card

---

## 7. Maintenance

Pages
- Maintenance Requests
- Request Details

Workflow UI
Pending
→ Approved
→ Technician Assigned
→ In Progress
→ Resolved

---

## 8. Audit

Pages
- Audit Cycles
- Audit Details
- Discrepancy Report

Components
- Checklist
- Verification Table
- Report Viewer

---

## 9. Reports

Pages
- Asset Utilization
- Maintenance Report
- Department Summary

Components
- Charts
- Export Button
- Filters

---

## 10. Notifications

Pages
- Notification Center

Types
- Asset Assigned
- Booking Reminder
- Transfer Approved
- Maintenance Approved
- Audit Alert

---

# Global Components

- Sidebar
- Navbar
- Breadcrumb
- Search
- Filter Drawer
- Data Table
- Modal
- Drawer
- Status Badge
- Empty State
- Loader
- Pagination
- Toast
- Confirm Dialog
- Charts
- Calendar

---

# Navigation

Authentication
→ Dashboard
→ Module Pages
→ Details
→ Back

---

# MVP Checklist

- Authentication
- Role Layouts
- Dashboard
- Organization Setup
- Asset Registry
- Asset Allocation
- Resource Booking
- Maintenance
- Audit
- Reports
- Notifications
- Responsive UI

---

# Bonus Features

- QR Code Scanner/UI
- Advanced Analytics
- Better Dashboard Charts
- Asset Heatmaps
- Advanced Search
- Dark Mode
- PDF Export UI
- Vehicle/Asset Document Preview
- Better Report Filters
- UI Animations
- Improved Empty States
- Mobile Optimizations

---
