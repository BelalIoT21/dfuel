
import { Request, Response } from 'express';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false, 
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Get user from auth middleware
    const user = await User.findById(req.user?.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      console.log('Password verification failed: Current password is incorrect');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Special handling for admin user
    const adminEmail = process.env.ADMIN_EMAIL;
    if (user.email === adminEmail) {
      console.log('Updating admin password in .env file');
      
      // Update the admin password in the environment variables
      process.env.ADMIN_PASSWORD = newPassword;
      
      // Update the .env file
      updateEnvFile('ADMIN_PASSWORD', newPassword);
      
      // Also set flag to false since admin is manually updating password
      updateEnvFile('FORCE_ADMIN_PASSWORD_UPDATE', 'false');
    }
    
    // Update user's password in the database (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in changePassword controller:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Helper function to update .env file
 */
const updateEnvFile = (key: string, value: string) => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if key exists in .env
      const regex = new RegExp(`^${key}=.*`, 'm');
      
      if (regex.test(envContent)) {
        // Replace existing key
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        // Add new key
        envContent += `\n${key}=${value}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`Updated ${key} in .env file`);
    } else {
      console.error('.env file not found');
    }
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
};
