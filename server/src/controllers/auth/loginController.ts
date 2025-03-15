
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { User } from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: 'Database connection error',
        details: 'MongoDB is not connected. Please check server logs.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found with email: ${email}`);
      
      // Check if there are any users in the database
      const userCount = await User.countDocuments({});
      console.log(`Total users in database: ${userCount}`);
      
      // List all collections if no users found
      if (userCount === 0) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
      }
      
      return res.status(401).json({ 
        message: 'Invalid email or password',
        debug: { userExists: false, dbConnected: true }
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(401).json({ 
        message: 'Invalid email or password',
        debug: { userExists: true, passwordMatch: false }
      });
    }

    console.log(`Login successful for user: ${email}`);

    // Generate JWT token
    const token = generateToken(user._id.toString());
    console.log('Generated token successfully');

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Return user data and token
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        certifications: user.certifications,
      },
      token: token,
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
