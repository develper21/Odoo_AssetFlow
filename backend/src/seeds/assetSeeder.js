/**
 * Asset Seeder - AssetFlow ERP System
 * 
 * Seeds default asset categories, departments, user accounts, assets,
 * and 1 sample allocation to demonstrate Sprint 2 features.
 * 
 * Run via: npm run seed:assets
 */

const path = require('path');
const dotenv = require('dotenv');
// Load environment variables first
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const AssetCategory = require('../models/AssetCategory');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const { ASSET_STATUS, ALLOCATION_STATUS } = require('../constants');

const seedAssets = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('📦 Connected to MongoDB for seeding assets...');

    // 1. Ensure we have an Admin / User to set as creator
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No Admin user found. Please run admin seeder first: npm run seed:admin');
      process.exit(1);
    }

    // 2. Ensure we have a Department
    let engDept = await Department.findOne({ code: 'ENG' });
    if (!engDept) {
      engDept = await Department.create({
        name: 'Engineering',
        code: 'ENG',
        description: 'Software Engineering Department',
        location: 'Building A, 4th Floor',
        budget: 150000,
        createdBy: adminUser._id,
      });
      console.log('✅ Created Department: Engineering (ENG)');
    }

    // 3. Ensure we have a Category
    let laptopCat = await AssetCategory.findOne({ code: 'LAP' });
    if (!laptopCat) {
      laptopCat = await AssetCategory.create({
        name: 'Laptops',
        code: 'LAP',
        description: 'Developer work laptops',
        depreciationRate: 20,
        usefulLifeYears: 5,
        createdBy: adminUser._id,
      });
      console.log('✅ Created Asset Category: Laptops (LAP)');
    }

    let monitorCat = await AssetCategory.findOne({ code: 'MON' });
    if (!monitorCat) {
      monitorCat = await AssetCategory.create({
        name: 'Monitors',
        code: 'MON',
        description: 'Display monitors',
        depreciationRate: 10,
        usefulLifeYears: 7,
        createdBy: adminUser._id,
      });
      console.log('✅ Created Asset Category: Monitors (MON)');
    }

    // 4. Ensure we have a standard Employee to allocate to
    let employeeUser = await User.findOne({ email: 'employee@assetflow.com' });
    if (!employeeUser) {
      employeeUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee@assetflow.com',
        password: 'Employee@123456', // Will be auto-hashed by pre-save
        role: 'employee',
        employeeId: 'EMP-DOEY0001',
        designation: 'Software Engineer',
        department: engDept._id,
        isActive: true,
        createdBy: adminUser._id,
      });
      console.log('✅ Created Employee: John Doe (employee@assetflow.com)');
    }

    // 5. Seed Assets
    const existingAssetsCount = await Asset.countDocuments();
    if (existingAssetsCount > 0) {
      console.log(`⏭️  Assets already exist in database (${existingAssetsCount} count). Skipping Asset seeding.`);
    } else {
      console.log('🌱 Seeding 5 assets...');

      const assetsToSeed = [
        {
          name: 'Dell XPS 15',
          serialNumber: 'DELL-XPS-001',
          category: laptopCat._id,
          status: ASSET_STATUS.AVAILABLE,
          description: 'Developer workstation Dell XPS 15 9520',
          acquisitionDate: new Date('2024-01-15'),
          acquisitionCost: 1800,
          condition: 'new',
          location: 'Office A, Desk 12',
          isBookable: false,
          createdBy: adminUser._id,
        },
        {
          name: 'MacBook Pro 16',
          serialNumber: 'MAC-PRO-001',
          category: laptopCat._id,
          status: ASSET_STATUS.AVAILABLE,
          description: 'M3 Pro MacBook Pro 16 inch Space Grey',
          acquisitionDate: new Date('2024-02-10'),
          acquisitionCost: 2499,
          condition: 'new',
          location: 'Office A, Desk 13',
          isBookable: false,
          createdBy: adminUser._id,
        },
        {
          name: 'Lenovo ThinkPad T14',
          serialNumber: 'LEN-PAD-001',
          category: laptopCat._id,
          status: ASSET_STATUS.AVAILABLE,
          description: 'AMD Ryzen 7 Lenovo ThinkPad T14 Gen 4',
          acquisitionDate: new Date('2024-03-01'),
          acquisitionCost: 1350,
          condition: 'good',
          location: 'Remote',
          isBookable: false,
          createdBy: adminUser._id,
        },
        {
          name: 'Dell UltraSharp 27"',
          serialNumber: 'DELL-MON-001',
          category: monitorCat._id,
          status: ASSET_STATUS.AVAILABLE,
          description: 'Dell U2723QE 4K USB-C Hub Monitor',
          acquisitionDate: new Date('2023-11-20'),
          acquisitionCost: 550,
          condition: 'good',
          location: 'Office B, Conference Room',
          isBookable: true,
          createdBy: adminUser._id,
        },
        {
          name: 'iPad Pro 11"',
          serialNumber: 'IPAD-PRO-001',
          category: laptopCat._id,
          status: ASSET_STATUS.AVAILABLE,
          description: 'Apple iPad Pro 11-inch M2 256GB Wi-Fi',
          acquisitionDate: new Date('2024-05-05'),
          acquisitionCost: 899,
          condition: 'new',
          location: 'Office A, Lab 2',
          isBookable: true,
          createdBy: adminUser._id,
        },
      ];

      // Insert assets one-by-one to trigger the pre-save auto-tag generation hook
      const seededAssets = [];
      for (const assetData of assetsToSeed) {
        const asset = await Asset.create(assetData);
        seededAssets.push(asset);
        console.log(`   Registered Asset: ${asset.name} (Tag: ${asset.assetTag})`);
      }

      // 6. Checkout/Allocate 1 asset (Dell XPS 15) to employee John Doe
      const checkOutAsset = seededAssets[0];
      const expectedReturn = new Date();
      expectedReturn.setDate(expectedReturn.getDate() + 90); // 90 days allocation

      const allocation = await Allocation.create({
        asset: checkOutAsset._id,
        allocateToType: 'User',
        allocatedTo: employeeUser._id,
        allocatedBy: adminUser._id,
        allocatedDate: new Date(),
        expectedReturnDate: expectedReturn,
        status: ALLOCATION_STATUS.ACTIVE,
        checkOutCondition: 'new',
      });

      // Update Asset Status
      checkOutAsset.status = ASSET_STATUS.ALLOCATED;
      checkOutAsset.currentHolderType = 'User';
      checkOutAsset.currentHolder = employeeUser._id;
      await checkOutAsset.save();

      console.log(`✅ Seeded checkout allocation of ${checkOutAsset.name} (${checkOutAsset.assetTag}) to John Doe`);
    }

    console.log('\n🎉 Sprint 2 database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

// Execute if run directly
if (require.main === module) {
  seedAssets();
}
