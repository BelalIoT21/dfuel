
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Ensure an admin user exists in the database
export const ensureAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.error('ADMIN_EMAIL is not defined in environment variables');
      return;
    }
    
    // Check if admin user already exists (with minimal logging)
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      // Create new admin user with ALL certifications
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD is not defined in environment variables');
      }
      
      const newAdmin = new User({
        _id: '1', // Use string ID for consistency
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword, // This will be hashed by the pre-save hook
        isAdmin: true,
        certifications: ['1', '2', '3', '4', '5', '6'], // Ensure all six certifications are included
      });
      
      await newAdmin.save();
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      // Silently update admin if needed
      const forcePasswordUpdate = process.env.FORCE_ADMIN_PASSWORD_UPDATE === 'true';
      
      if (forcePasswordUpdate) {
        // Update the admin password
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          throw new Error('ADMIN_PASSWORD is not defined in environment variables');
        }
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
      }
      
      // Always ensure admin email is in sync with .env
      if (existingAdmin.email !== adminEmail) {
        existingAdmin.email = adminEmail || 'admin@dfuel.com'; // Fix: Add fallback value
        await existingAdmin.save();
      }
      
      // If admin exists but doesn't have all certifications, update them
      if (!existingAdmin.certifications || existingAdmin.certifications.length < 6) {
        existingAdmin.certifications = ['1', '2', '3', '4', '5', '6'];
        await existingAdmin.save();
      }
    }
  } catch (error) {
    console.error('Error ensuring admin user exists:', error);
  }
};
