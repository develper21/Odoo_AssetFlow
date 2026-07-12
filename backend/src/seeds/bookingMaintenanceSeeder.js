/**
 * Booking & Maintenance Seeder - AssetFlow ERP System
 * 
 * Seeds resource bookings, maintenance requests, and notification alerts to demonstrate Sprint 3 features.
 * 
 * Run via: npm run seed:bookings
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');
const { ASSET_STATUS } = require('../constants');

const seedBookings = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB for seeding bookings & maintenance...');

    // Find our users
    const adminUser = await User.findOne({ role: 'admin' });
    const employeeUser = await User.findOne({ email: 'employee@assetflow.com' });

    if (!adminUser || !employeeUser) {
      console.log('⚠️  Seed users missing. Please run seed:admin and seed:assets first.');
      process.exit(1);
    }

    // Find bookable assets
    const bookableAssets = await Asset.find({ isBookable: true });
    if (bookableAssets.length === 0) {
      console.log('⚠️  No bookable assets found. Please run seed:assets first.');
      process.exit(1);
    }

    const testResource = bookableAssets[0];
    console.log(`Using bookable resource for test seeding: ${testResource.name} (${testResource.assetTag})`);

    // 1. Seed Bookings
    const existingBookings = await Booking.countDocuments();
    if (existingBookings > 0) {
      console.log('⏭️  Bookings already exist. Skipping booking seeding.');
    } else {
      console.log('🌱 Seeding 2 bookings...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(12, 0, 0, 0);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(14, 0, 0, 0);

      const nextWeekEnd = new Date(nextWeek);
      nextWeekEnd.setHours(16, 0, 0, 0);

      await Booking.create([
        {
          resource: testResource._id,
          bookedBy: employeeUser._id,
          startDateTime: tomorrow,
          endDateTime: tomorrowEnd,
          purpose: 'Team sync and demo presentation',
          notes: 'Requires HDMI connection adapter',
          status: 'upcoming',
        },
        {
          resource: testResource._id,
          bookedBy: employeeUser._id,
          startDateTime: nextWeek,
          endDateTime: nextWeekEnd,
          purpose: 'Design review workshop',
          notes: '',
          status: 'upcoming',
        }
      ]);
      console.log('✅ Seeded 2 bookings successfully.');
    }

    // 2. Seed Maintenance Workflow Request
    const existingMaintenance = await MaintenanceRequest.countDocuments();
    if (existingMaintenance > 0) {
      console.log('⏭️  Maintenance requests already exist. Skipping.');
    } else {
      console.log('🌱 Seeding maintenance workflow...');
      const nonBookableAsset = await Asset.findOne({ isBookable: false, status: ASSET_STATUS.AVAILABLE });
      
      if (!nonBookableAsset) {
        console.log('⚠️  No available non-bookable assets found for maintenance seeding.');
      } else {
        // Raise request
        const request = await MaintenanceRequest.create({
          asset: nonBookableAsset._id,
          raisedBy: employeeUser._id,
          issueDescription: 'Screen flicker and keyboard keys getting stuck',
          priority: 'high',
          notes: 'Stuck keys are: E, R, Spacebar',
          status: 'pending',
        });
        console.log(`✅ Raised Maintenance request (ID: ${request._id}) for asset: ${nonBookableAsset.name}`);
      }
    }

    // 3. Seed Notifications
    const existingNotifications = await Notification.countDocuments();
    if (existingNotifications > 0) {
      console.log('⏭️  Notifications already exist. Skipping.');
    } else {
      console.log('🌱 Seeding sample notifications...');
      await Notification.create([
        {
          user: employeeUser._id,
          title: 'Welcome to AssetFlow!',
          message: 'Your employee portal account has been successfully initialized.',
          type: 'asset_assigned',
        },
        {
          user: employeeUser._id,
          title: 'Resource Reserved',
          message: `Your reservation for ${testResource.name} is confirmed.`,
          type: 'booking_confirmed',
        }
      ]);
      console.log('✅ Seeded 2 notifications successfully.');
    }

    console.log('\n🎉 Sprint 3 seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

if (require.main === module) {
  seedBookings();
}
