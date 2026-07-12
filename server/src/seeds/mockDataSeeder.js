/**
 * Mock Data Seeder - AssetFlow ERP System
 * 
 * Comprehensive seeder that populates the database with all mock data from the frontend.
 * This includes users, departments, categories, assets, allocations, bookings, maintenance,
 * notifications, and audits to match the frontend mock-data.ts exactly.
 * 
 * Run via: node src/seeds/mockDataSeeder.js
 * password: Password@123456
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const AssetCategory = require('../models/AssetCategory');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');
const AuditCycle = require('../models/AuditCycle');
const { ASSET_STATUS, ALLOCATION_STATUS } = require('../constants');

// Mock data matching frontend mock-data.ts
const DEMO_USERS = [
  { id: "u1", name: "Ava Sinclair", email: "ava@assetflow.io", role: "admin", department: "Operations" },
  { id: "u2", name: "Marcus Reid", email: "marcus@assetflow.io", role: "asset_manager", department: "IT" },
  { id: "u3", name: "Priya Anand", email: "priya@assetflow.io", role: "department_head", department: "Engineering" },
  { id: "u4", name: "Noah Chen", email: "noah@assetflow.io", role: "employee", department: "Design" },
];

const EXTRA_USERS = [
  { id: "u5", name: "Isla Moreno", email: "isla@assetflow.io", role: "department_head", department: "Design" },
  { id: "u6", name: "Rohan Kapoor", email: "rohan@assetflow.io", role: "employee", department: "Finance" },
  { id: "u7", name: "Yuki Tanaka", email: "yuki@assetflow.io", role: "employee", department: "Engineering" },
  { id: "u8", name: "Leo Park", email: "leo@assetflow.io", role: "employee", department: "Operations" },
  { id: "u9", name: "Maya Iyer", email: "maya@assetflow.io", role: "asset_manager", department: "IT" },
];

const DEPARTMENTS = [
  { id: "d1", name: "Engineering", head: "Priya Anand", employees: 42, assets: 128 },
  { id: "d2", name: "Design", head: "Isla Moreno", employees: 18, assets: 47 },
  { id: "d3", name: "Operations", head: "Ava Sinclair", employees: 24, assets: 63 },
  { id: "d4", name: "IT", head: "Marcus Reid", employees: 12, assets: 210 },
  { id: "d5", name: "Finance", head: "Rohan Kapoor", employees: 9, assets: 22 },
];

const CATEGORIES = [
  { id: "c1", name: "Laptops", count: 142, icon: "Laptop" },
  { id: "c2", name: "Monitors", count: 96, icon: "Monitor" },
  { id: "c3", name: "Vehicles", count: 12, icon: "Car" },
  { id: "c4", name: "Furniture", count: 210, icon: "Armchair" },
  { id: "c5", name: "Projectors", count: 18, icon: "Projector" },
  { id: "c6", name: "Tools", count: 74, icon: "Wrench" },
];

const ASSET_NAMES = ["MacBook Pro 16", "Dell Latitude 7440", "Lenovo ThinkPad X1", "iMac 24", "iPad Air", "LG UltraFine 27", "Sony A7 IV", "DJI Mavic 3", "Herman Miller Aeron", "Epson EB-2250U", "Ford Transit", "Toyota Hilux", "Bosch Drill Kit", "Cisco Router", "Ubiquiti AP"];
const CATEGORIES_NAMES = ["Laptops", "Monitors", "Vehicles", "Furniture", "Projectors", "Tools"];
const STATUSES = ["Available", "Allocated", "Maintenance", "Retired"];
const DEPTS = ["Engineering", "Design", "Operations", "IT", "Finance"];
const PEOPLE = ["Ava Sinclair", "Marcus Reid", "Priya Anand", "Noah Chen", "Isla Moreno", "Rohan Kapoor", "Yuki Tanaka", "Leo Park", "Maya Iyer"];

// Generate 48 assets matching frontend
const generateAssets = () => {
  return Array.from({ length: 48 }, (_, i) => {
    const status = STATUSES[i % 4];
    return {
      id: `a${i + 1}`,
      tag: `AF-${String(1000 + i)}`,
      name: ASSET_NAMES[i % ASSET_NAMES.length],
      category: CATEGORIES_NAMES[i % CATEGORIES_NAMES.length],
      status,
      assignee: status === "Allocated" ? PEOPLE[(i + 3) % PEOPLE.length] : undefined,
      department: DEPTS[(i + 1) % DEPTS.length],
      purchased: `2023-${String(((i % 12) + 1)).padStart(2, "0")}-14`,
      value: 400 + (i * 137) % 4600,
    };
  });
};

const ASSETS = generateAssets();

const ALLOCATIONS = Array.from({ length: 14 }, (_, i) => ({
  id: `al${i + 1}`,
  asset: ASSETS[i].tag,
  employee: PEOPLE[i % PEOPLE.length],
  from: `2024-0${(i % 9) + 1}-12`,
  to: i % 3 === 0 ? `2025-0${(i % 8) + 1}-04` : undefined,
  status: ["Active", "Returned", "Pending", "Approved"][i % 4],
}));

const BOOKINGS = [
  { id: "b1", resource: "Conference Room A", requester: "Priya Anand", date: "2026-07-14", slot: "09:00–10:30", status: "Confirmed" },
  { id: "b2", resource: "Projector EB-2250U", requester: "Noah Chen", date: "2026-07-14", slot: "11:00–12:30", status: "Confirmed" },
  { id: "b3", resource: "Ford Transit", requester: "Marcus Reid", date: "2026-07-15", slot: "08:00–18:00", status: "Pending" },
  { id: "b4", resource: "Sony A7 IV", requester: "Isla Moreno", date: "2026-07-16", slot: "13:00–17:00", status: "Confirmed" },
  { id: "b5", resource: "Design Studio", requester: "Yuki Tanaka", date: "2026-07-17", slot: "10:00–12:00", status: "Cancelled" },
  { id: "b6", resource: "Toyota Hilux", requester: "Leo Park", date: "2026-07-18", slot: "07:00–15:00", status: "Confirmed" },
];

const MAINTENANCE = [
  { id: "m1", asset: "AF-1004", reporter: "Noah Chen", issue: "Battery drains in 2 hours", stage: "In Progress", updated: "2h ago", priority: "High" },
  { id: "m2", asset: "AF-1012", reporter: "Isla Moreno", issue: "Flickering display", stage: "Assigned", updated: "6h ago", priority: "Medium" },
  { id: "m3", asset: "AF-1021", reporter: "Marcus Reid", issue: "Overheating under load", stage: "Approved", updated: "1d ago", priority: "High" },
  { id: "m4", asset: "AF-1030", reporter: "Yuki Tanaka", issue: "Broken hinge", stage: "Pending", updated: "1d ago", priority: "Low" },
  { id: "m5", asset: "AF-1041", reporter: "Priya Anand", issue: "Fan noise", stage: "Resolved", updated: "3d ago", priority: "Low" },
  { id: "m6", asset: "AF-1017", reporter: "Leo Park", issue: "Won't power on", stage: "In Progress", updated: "5h ago", priority: "High" },
];

const AUDITS = [
  { id: "au1", name: "Q3 2026 Full Inventory", period: "Jul – Sep 2026", progress: 62, discrepancies: 4, status: "Running" },
  { id: "au2", name: "IT Equipment Spot Check", period: "Jul 2026", progress: 100, discrepancies: 1, status: "Completed" },
  { id: "au3", name: "Vehicles Annual Audit", period: "Aug 2026", progress: 0, discrepancies: 0, status: "Planned" },
  { id: "au4", name: "Furniture Review", period: "Jun 2026", progress: 100, discrepancies: 7, status: "Completed" },
];

const NOTIFICATIONS = [
  { id: "n1", title: "Asset assigned", body: "MacBook Pro 16 (AF-1004) allocated to you.", time: "12m ago", type: "asset", unread: true },
  { id: "n2", title: "Booking reminder", body: "Conference Room A starts in 30 minutes.", time: "1h ago", type: "booking", unread: true },
  { id: "n3", title: "Transfer approved", body: "Your transfer request for AF-1012 was approved.", time: "3h ago", type: "transfer", unread: false },
  { id: "n4", title: "Maintenance update", body: "AF-1021 marked In Progress by technician.", time: "6h ago", type: "maintenance", unread: false },
  { id: "n5", title: "Audit alert", body: "Q3 audit discrepancy: AF-1030 missing.", time: "1d ago", type: "audit", unread: true },
];

const seedMockData = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB for mock data seeding...\n');

    // Clear existing data to avoid conflicts
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await AssetCategory.deleteMany({});
    await Asset.deleteMany({});
    await Allocation.deleteMany({});
    await Booking.deleteMany({});
    await MaintenanceRequest.deleteMany({});
    await Notification.deleteMany({});
    await AuditCycle.deleteMany({});
    console.log('✅ Existing data cleared.\n');

    console.log('🌱 Starting comprehensive mock data seeding...\n');

    // 1. Seed Users
    console.log('👥 Seeding users...');
    const userMap = {};
    const allUsers = [...DEMO_USERS, ...EXTRA_USERS];
    
    for (const userData of allUsers) {
      const dept = DEPARTMENTS.find(d => d.name === userData.department);
      const deptRecord = await Department.findOne({ name: dept?.name });
      
      const user = await User.create({
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ').slice(1).join(' '),
        email: userData.email,
        password: 'Password@123456',
        role: userData.role,
        employeeId: `EMP-${userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}${Math.floor(Math.random() * 1000)}`,
        designation: userData.role === 'admin' ? 'System Administrator' : 
                    userData.role === 'asset_manager' ? 'Asset Manager' :
                    userData.role === 'dept_head' ? 'Department Head' : 'Employee',
        department: deptRecord?._id,
        isActive: true,
      });
      userMap[userData.name] = user;
      console.log(`   ✅ Created user: ${userData.name}`);
    }

    // 2. Seed Departments
    console.log('\n🏢 Seeding departments...');
    const deptMap = {};
    for (const deptData of DEPARTMENTS) {
      const headUser = userMap[deptData.head];
      const dept = await Department.create({
        name: deptData.name,
        code: deptData.name.substring(0, 3).toUpperCase(),
        description: `${deptData.name} Department`,
        location: 'Building A',
        budget: deptData.assets * 1000,
        headOfDepartment: headUser?._id,
        isActive: true,
      });
      deptMap[deptData.name] = dept;
      console.log(`   ✅ Created department: ${deptData.name}`);
    }

    // 3. Seed Categories
    console.log('\n📁 Seeding asset categories...');
    const categoryMap = {};
    for (const catData of CATEGORIES) {
      const category = await AssetCategory.create({
        name: catData.name,
        code: catData.name.substring(0, 3).toUpperCase(),
        description: `${catData.name} category`,
        depreciationRate: 15,
        usefulLifeYears: 5,
        isActive: true,
      });
      categoryMap[catData.name] = category;
      console.log(`   ✅ Created category: ${catData.name}`);
    }

    // 4. Seed Assets
    console.log('\n💻 Seeding assets...');
    const assetMap = {};
    const adminUser = userMap['Ava Sinclair'];
    
    for (const assetData of ASSETS) {
      const category = categoryMap[assetData.category];
      const department = deptMap[assetData.department];
      const assigneeUser = assetData.assignee ? userMap[assetData.assignee] : null;
      
      const statusMap = {
        'Available': ASSET_STATUS.AVAILABLE,
        'Allocated': ASSET_STATUS.ALLOCATED,
        'Maintenance': ASSET_STATUS.MAINTENANCE,
        'Retired': ASSET_STATUS.RETIRED,
      };

      const asset = await Asset.create({
        name: assetData.name,
        serialNumber: assetData.tag,
        category: category?._id,
        status: statusMap[assetData.status] || ASSET_STATUS.AVAILABLE,
        description: `${assetData.name} - ${assetData.category}`,
        acquisitionDate: new Date(assetData.purchased),
        acquisitionCost: assetData.value,
        condition: 'good',
        location: department?.name || 'Office',
        department: department?._id,
        isBookable: assetData.category === 'Vehicles' || assetData.category === 'Projectors',
        currentHolder: assigneeUser?._id,
        currentHolderType: assigneeUser ? 'User' : null,
        createdBy: adminUser?._id,
      });
      assetMap[assetData.tag] = asset;
      console.log(`   ✅ Created asset: ${assetData.tag} - ${assetData.name}`);
    }

    // 5. Seed Allocations
    console.log('\n🔄 Seeding allocations...');
    for (const allocData of ALLOCATIONS) {
      const asset = assetMap[allocData.asset];
      const employee = userMap[allocData.employee];
      
      if (asset && employee) {
        const statusMap = {
          'Active': ALLOCATION_STATUS.ACTIVE,
          'Returned': ALLOCATION_STATUS.RETURNED,
          'Pending': ALLOCATION_STATUS.PENDING_APPROVAL,
          'Approved': ALLOCATION_STATUS.APPROVED,
        };

        await Allocation.create({
          asset: asset._id,
          allocateToType: 'User',
          allocatedTo: employee._id,
          allocatedBy: adminUser?._id,
          allocatedDate: new Date(allocData.from),
          expectedReturnDate: allocData.to ? new Date(allocData.to) : null,
          actualReturnDate: allocData.status === 'Returned' && allocData.to ? new Date(allocData.to) : null,
          status: statusMap[allocData.status] || ALLOCATION_STATUS.ACTIVE,
          checkOutCondition: 'good',
        });
        console.log(`   ✅ Created allocation: ${allocData.asset} → ${allocData.employee}`);
      }
    }

    // 6. Seed Bookings
    console.log('\n📅 Seeding bookings...');
    for (const bookingData of BOOKINGS) {
      const requester = userMap[bookingData.requester];
      const asset = Object.values(assetMap).find(a => a.name.includes(bookingData.resource.split(' ')[0])) || Object.values(assetMap)[0];
      
      if (requester && asset) {
        const [startTime, endTime] = bookingData.slot.split('–');
        const startDateTime = new Date(`${bookingData.date} ${startTime}`);
        const endDateTime = new Date(`${bookingData.date} ${endTime}`);

        await Booking.create({
          resource: asset._id,
          bookedBy: requester._id,
          startDateTime,
          endDateTime,
          purpose: `${bookingData.resource} booking`,
          notes: '',
          status: bookingData.status.toLowerCase() === 'confirmed' ? 'upcoming' : 
                 bookingData.status.toLowerCase() === 'cancelled' ? 'cancelled' : 'upcoming',
        });
        console.log(`   ✅ Created booking: ${bookingData.resource} for ${bookingData.requester}`);
      }
    }

    // 7. Seed Maintenance Requests
    console.log('\n🔧 Seeding maintenance requests...');
    for (const maintData of MAINTENANCE) {
      const asset = assetMap[maintData.asset];
      const reporter = userMap[maintData.reporter];
      
      if (asset && reporter) {
        const statusMap = {
          'Pending': 'pending',
          'Approved': 'approved',
          'Assigned': 'technician_assigned',
          'In Progress': 'in_progress',
          'Resolved': 'resolved',
        };

        await MaintenanceRequest.create({
          asset: asset._id,
          raisedBy: reporter._id,
          issueDescription: maintData.issue,
          priority: maintData.priority.toLowerCase(),
          notes: '',
          status: statusMap[maintData.stage] || 'pending',
        });
        console.log(`   ✅ Created maintenance request: ${maintData.asset} - ${maintData.issue}`);
      }
    }

    // 8. Seed Notifications
    console.log('\n🔔 Seeding notifications...');
    for (const notifData of NOTIFICATIONS) {
      const user = userMap['Noah Chen']; // Assign to a demo user
      
      if (user) {
        await Notification.create({
          user: user._id,
          title: notifData.title,
          message: notifData.body,
          type: notifData.type,
          isRead: !notifData.unread,
        });
        console.log(`   ✅ Created notification: ${notifData.title}`);
      }
    }

    // 9. Seed Audit Cycles
    console.log('\n📋 Seeding audit cycles...');
    for (const auditData of AUDITS) {
      const statusMap = {
        'Planned': 'draft',
        'Running': 'active',
        'Completed': 'closed',
      };

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      await AuditCycle.create({
        name: auditData.name,
        description: auditData.period,
        startDate,
        endDate,
        status: statusMap[auditData.status] || 'draft',
        location: 'All Offices',
        auditors: [adminUser?._id],
        progress: auditData.progress,
        discrepanciesFound: auditData.discrepancies,
        createdBy: adminUser?._id,
      });
      console.log(`   ✅ Created audit cycle: ${auditData.name}`);
    }

    console.log('\n🎉 Mock data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${allUsers.length}`);
    console.log(`   - Departments: ${DEPARTMENTS.length}`);
    console.log(`   - Categories: ${CATEGORIES.length}`);
    console.log(`   - Assets: ${ASSETS.length}`);
    console.log(`   - Allocations: ${ALLOCATIONS.length}`);
    console.log(`   - Bookings: ${BOOKINGS.length}`);
    console.log(`   - Maintenance: ${MAINTENANCE.length}`);
    console.log(`   - Notifications: ${NOTIFICATIONS.length}`);
    console.log(`   - Audits: ${AUDITS.length}`);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
  }
};

if (require.main === module) {
  seedMockData();
}
