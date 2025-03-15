
import { User } from '../../models/User';
import bcrypt from 'bcryptjs';

// Ensure an admin user exists in the database
export const ensureAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log(`Creating default admin user with email: ${adminEmail}`);
      
      // Get the admin password from env or use default
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
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
      
      // Optional: Update admin password if needed (for development environments)
      if (process.env.NODE_ENV === 'development') {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        // Check if we need to update the password
        const passwordMatch = await existingAdmin.matchPassword(adminPassword);
        
        if (!passwordMatch) {
          console.log('Updating admin password to match environment variables');
          existingAdmin.password = adminPassword; // Will be hashed by pre-save hook
          await existingAdmin.save();
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
};
