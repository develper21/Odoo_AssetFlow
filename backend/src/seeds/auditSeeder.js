/**
 * Audit Seeder - AssetFlow ERP System
 * 
 * Seeds a Q3 Asset Verification Audit Cycle and audit items to demonstrate Sprint 4 features.
 * 
 * Run via: npm run seed:audits
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const AuditCycle = require('../models/AuditCycle');
const AuditItem = require('../models/AuditItem');
const AuditService = require('../services/audit.service');

const seedAudits = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB for seeding audits...');

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  System Admin user missing. Run seed:admin and seed:assets first.');
      process.exit(1);
    }

    const existingCycles = await AuditCycle.countDocuments();
    if (existingCycles > 0) {
      console.log('⏭️  Audit cycles already exist. Skipping.');
    } else {
      console.log('🌱 Seeding a new audit cycle...');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 7 days from now

      // Create draft cycle scoped to location "Office A" (seeding automatically inserts AuditItems)
      const result = await AuditService.createCycle({
        name: 'Q3 Office A Verification Audit',
        location: 'Office A',
        startDate,
        endDate,
        auditors: [adminUser._id],
      }, adminUser._id);

      console.log(`✅ Draft Audit Cycle created: ${result.cycle.name}`);
      console.log(`✅ Generated ${result.itemsCount} scoped audit items for verification.`);

      // Automatically start the cycle (draft -> active)
      const activeCycle = await AuditService.startCycle(result.cycle._id, adminUser._id);
      console.log(`✅ Audit Cycle started and is now: ${activeCycle.status}`);
    }

    console.log('\n🎉 Sprint 4 seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

if (require.main === module) {
  seedAudits();
}
