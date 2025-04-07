
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Seed default users for testing
export async function seedUsers() {
  try {
    // Check if users already exist
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log('Users already exist, skipping user seeding');
      return { success: true, message: 'Users already exist' };
    }
    
    // Create default users with hashed passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        certifications: ['1', '2', '3', '4', '5', '6'] // Admin is certified on all machines
      }
    ];
    
    await User.insertMany(users);
    console.log('Default users created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding users:', error);
    return { success: false, error };
  }
}
