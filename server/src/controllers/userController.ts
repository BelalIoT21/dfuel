
import { Request, Response } from 'express';
import User from '../models/User';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // req.user should be populated by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password -resetCode');
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetCode');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Special handling for admin user
    if (user.isAdmin) {
      console.log('Updating admin user profile');
      
      // Update name field if provided (admins can change their name)
      if (req.body.name) {
        user.name = req.body.name;
      }
      
      // For admin email, check if it's different from the env value
      if (req.body.email && req.body.email !== process.env.ADMIN_EMAIL) {
        // Update the .env file with the new admin email
        const envFilePath = path.resolve(process.cwd(), '.env');
        const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
        
        // Update the ADMIN_EMAIL value
        envConfig.ADMIN_EMAIL = req.body.email;
        
        // Convert the updated config back to env file format
        const newEnvContent = Object.entries(envConfig)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');
        
        // Write back to the .env file
        fs.writeFileSync(envFilePath, newEnvContent);
        
        // Update process.env for current process
        process.env.ADMIN_EMAIL = req.body.email;
        
        // Update the user in database
        user.email = req.body.email;
        
        console.log(`Admin email updated to: ${req.body.email}`);
      }
    } else {
      // Regular user profile update
      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email;
    }
    
    // If password is included, it will be handled by the pre-save hook
    if (req.body.password) user.password = req.body.password;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      certifications: updatedUser.certifications,
      success: true
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
};

// @desc    Update user by ID (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.isAdmin !== undefined) user.isAdmin = req.body.isAdmin;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required', success: false });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }
    
    // Enforce password requirements
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters', success: false });
    }
    
    // Additional handling for admin user
    if (user.isAdmin) {
      // Update admin password in .env file
      const envFilePath = path.resolve(process.cwd(), '.env');
      const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
      
      // Update the ADMIN_PASSWORD value
      envConfig.ADMIN_PASSWORD = newPassword;
      
      // Convert the updated config back to env file format
      const newEnvContent = Object.entries(envConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      // Write back to the .env file
      fs.writeFileSync(envFilePath, newEnvContent);
      
      // Update process.env for current process
      process.env.ADMIN_PASSWORD = newPassword;
      
      console.log('Admin password updated in .env file');
    }
    
    // Update password - will be hashed by the pre-save hook
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully', success: true });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    console.log(`Attempting to delete user with ID: ${req.params.id}`);
    
    let user;
    try {
      // Try finding user by MongoDB ObjectId
      user = await User.findById(req.params.id);
      console.log(`findById result: ${user ? 'User found' : 'User not found'}`);
    } catch (err) {
      console.log(`Error using findById: ${err instanceof Error ? err.message : 'Unknown error'}, trying alternative methods`);
      
      // Try finding by id as a string field
      user = await User.findOne({ id: req.params.id });
      console.log(`findOne by id field: ${user ? 'User found' : 'User not found'}`);
      
      if (!user) {
        // Try finding with a numeric conversion as last resort
        if (!isNaN(Number(req.params.id))) {
          user = await User.findOne({ id: Number(req.params.id) });
          console.log(`findOne with numeric id: ${user ? 'User found' : 'User not found'}`);
        }
      }
    }
    
    if (!user) {
      console.log(`User with ID ${req.params.id} not found for deletion`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`Found user to delete: ${user.name} (${user._id})`);
    // Delete the user
    await user.deleteOne();
    
    console.log(`User ${req.params.id} deleted successfully`);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
