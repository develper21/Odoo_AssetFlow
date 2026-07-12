/**
 * Admin Seeder - AssetFlow ERP System
 * 
 * Standalone script to seed the database with an initial system administrator.
 * This script is idempotent — it checks for an existing admin before creating one,
 * so it can be safely run multiple times without creating duplicate accounts.
 * 
 * Usage:
 *   node src/seeds/adminSeeder.js
 * 
 * Prerequisites:
 *   - A valid .env file in the backend root with MONGO_URI configured
 *   - MongoDB instance running and accessible
 * 
 * Default Admin Credentials:
 *   Email:    admin@assetflow.com
 *   Password: Admin@123456
 * 
 * ⚠️  IMPORTANT: Change the default admin password immediately after first login
 *    in a production environment.
 * 
 * @module seeds/adminSeeder
 */

const path = require('path');

// ---------------------------------------------------------------------------
// Load environment variables from the .env file in the backend root
// ---------------------------------------------------------------------------
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');

// ---------------------------------------------------------------------------
// Default admin user configuration
// ---------------------------------------------------------------------------
const ADMIN_USER = {
  firstName: 'System',
  lastName: 'Admin',
  email: 'admin@assetflow.com',
  password: 'Admin@123456',
  role: 'admin',
  employeeId: 'EMP-ADMIN001',
  designation: 'System Administrator',
  isActive: true,
};

// ---------------------------------------------------------------------------
// Seeder Function
// ---------------------------------------------------------------------------

/**
 * Seeds the database with a default system administrator account.
 * 
 * Steps:
 *   1. Connects to MongoDB
 *   2. Checks if an admin user already exists (by email)
 *   3. Creates the admin user if none exists
 *   4. Logs the result and disconnects
 */
const seedAdmin = async () => {
  try {
    // Step 1: Connect to the database
    await connectDB();
    console.log('📦 Connected to MongoDB for seeding...\n');

    // Step 2: Check if an admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log(`   Email:       ${existingAdmin.email}`);
      console.log(`   Employee ID: ${existingAdmin.employeeId}`);
      console.log(`   Role:        ${existingAdmin.role}`);
      console.log('\n⏭️  Skipping admin creation. No changes made.');
    } else {
      // Step 3: Create the admin user
      const admin = await User.create(ADMIN_USER);

      console.log('✅ Admin user created successfully!');
      console.log('─'.repeat(45));
      console.log(`   Name:        ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email:       ${admin.email}`);
      console.log(`   Employee ID: ${admin.employeeId}`);
      console.log(`   Role:        ${admin.role}`);
      console.log(`   Designation: ${admin.designation}`);
      console.log('─'.repeat(45));
      console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    }
  } catch (error) {
    // Handle specific error types for better debugging
    if (error.code === 11000) {
      console.error('❌ Duplicate key error: An admin with this email or employee ID already exists.');
    } else if (error.name === 'ValidationError') {
      console.error('❌ Validation error:', error.message);
    } else {
      console.error('❌ Error seeding admin user:', error.message);
    }
    process.exit(1);
  } finally {
    // Step 4: Always disconnect from the database
    try {
      const mongoose = require('mongoose');
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from MongoDB.');
    } catch (disconnectError) {
      console.error('⚠️  Error disconnecting from MongoDB:', disconnectError.message);
    }
    process.exit(0);
  }
};

// ---------------------------------------------------------------------------
// Execute the seeder
// ---------------------------------------------------------------------------
seedAdmin();
