
import User from '../../models/User';

// Ensure an admin user exists in the database
export const ensureAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log(`Creating default admin user with email: ${adminEmail}`);
      
      // Get the admin password from env or use default
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      // Create new admin user
      const newAdmin = new User({
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword, // This will be hashed by the pre-save hook
        isAdmin: true,
        certifications: ['1', '2', '3', '4', '5', '6'],
      });
      
      await newAdmin.save();
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
};
