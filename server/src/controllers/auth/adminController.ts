
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Ensure an admin user exists in the database
export const ensureAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log(`Creating default admin user with email: ${adminEmail}`);
      
      // Get the admin password from env
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD is not defined in environment variables');
      }
      
      // Create new admin user with ALL certifications
      const newAdmin = new User({
        _id: 1,
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword, // This will be hashed by the pre-save hook
        isAdmin: true,
        certifications: ['1', '2', '3', '4', '5', '6'], // Ensure all six certifications are included
      });
      
      await newAdmin.save();
      console.log('Default admin user created successfully');
      console.log('Admin certifications:', newAdmin.certifications);
    } else {
      // Check if admin password needs to be updated
      const forcePasswordUpdate = process.env.FORCE_ADMIN_PASSWORD_UPDATE === 'true';
      
      if (forcePasswordUpdate) {
        console.log('Force admin password update is enabled, updating admin password');
        
        // Update the admin password
        existingAdmin.password = process.env.ADMIN_PASSWORD || 'admin123';
        await existingAdmin.save();
        console.log('Admin password updated successfully');
      }
      
      // If admin exists but doesn't have all certifications, update them
      if (!existingAdmin.certifications || existingAdmin.certifications.length < 6) {
        existingAdmin.certifications = ['1', '2', '3', '4', '5', '6'];
        await existingAdmin.save();
        console.log('Updated existing admin with all certifications');
        console.log('Admin certifications after update:', existingAdmin.certifications);
      }
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
};
