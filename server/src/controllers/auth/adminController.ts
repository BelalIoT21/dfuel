
import { User } from '../../models/User';
import bcrypt from 'bcryptjs';

// Ensure an admin user exists in the database
export const ensureAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`Checking admin user with email: ${adminEmail}`);
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log(`Creating default admin user with email: ${adminEmail}`);
      
      // Create new admin user
      const newAdmin = new User({
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save hook
        isAdmin: true,
        certifications: [],
      });
      
      await newAdmin.save();
      console.log('Default admin user created successfully');
    } else {
      console.log(`Admin user with email ${adminEmail} already exists`);
      
      // Update admin password if needed
      if (process.env.NODE_ENV === 'development' || process.env.FORCE_ADMIN_PASSWORD_UPDATE === 'true') {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        // Check if we need to update the password
        const passwordMatch = await bcrypt.compare(adminPassword, existingAdmin.password);
        
        if (!passwordMatch) {
          console.log('Updating admin password to match environment variables');
          existingAdmin.password = adminPassword; // Will be hashed by pre-save hook
          await existingAdmin.save();
          console.log('Admin password updated successfully');
        } else {
          console.log('Admin password already matches environment variables');
        }
      }
    }
    
    // After ensuring the admin, return the admin user data
    return await User.findOne({ email: adminEmail }).select('-password');
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
    throw error;
  }
};

// Helper function to debug admin credentials
export const getAdminInfo = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    const admin = await User.findOne({ email: adminEmail }).select('-password');
    return admin;
  } catch (error) {
    console.error('Error getting admin info:', error);
    return null;
  }
};
