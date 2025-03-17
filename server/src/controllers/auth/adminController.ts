
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
      
      // Create new admin user with ALL certifications
      const newAdmin = new User({
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
      // If admin exists but doesn't have all certifications, update them
      if (!existingAdmin.certifications.includes('5') || !existingAdmin.certifications.includes('6')) {
        existingAdmin.certifications = ['1', '2', '3', '4', '5', '6'];
        await existingAdmin.save();
        console.log('Updated existing admin with all certifications');
      }
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
};
