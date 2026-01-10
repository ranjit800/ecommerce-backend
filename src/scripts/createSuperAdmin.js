import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDatabase from '../config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
await connectDatabase();

const createSuperAdmin = async () => {
  try {
    // Check if SuperAdmin already exists
    const existingAdmin = await User.findOne({ role: 'SUPERADMIN' });

    if (existingAdmin) {
      console.log('⚠️  SuperAdmin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   ID: ${existingAdmin._id}`);
      process.exit(0);
    }

    // Create SuperAdmin
    const superAdmin = await User.create({
      email: 'admin@multivendor.com',
      password: 'Admin@123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPERADMIN',
      isEmailVerified: true, // Auto-verify SuperAdmin
    });

    console.log('✅ SuperAdmin created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: admin@multivendor.com');
    console.log('   Password: Admin@123');
    console.log(`   User ID: ${superAdmin._id}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
