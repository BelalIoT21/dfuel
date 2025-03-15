
import { User } from '../../models/User';

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
        password: adminPassword, // This will be hashed by the pre-save hook
        isAdmin: true,
        certifications: [],
      });
      
      await newAdmin.save();
      console.log('Default admin user created successfully');
    } else {
      console.log(`Admin user already exists with email: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
};

