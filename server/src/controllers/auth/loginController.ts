
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';
import { ensureAdminUser } from './adminController';
import bcrypt from 'bcryptjs';

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log('Login request received:', req.body);
    console.log('Request headers:', req.headers);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Ensure admin user exists (if admin credentials are used)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
    if (email === adminEmail) {
      console.log('Admin login attempt, ensuring admin user exists');
      await ensureAdminUser();
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found with email: ${email}`);
      
      // Check if there are any users in the database
      const userCount = await User.countDocuments({});
      console.log(`Total users in database: ${userCount}`);
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log(`Checking password for user: ${email}`);
    const isMatch = await user.matchPassword(password);
    
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      // Log more details for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Input password: ${password}`);
        console.log(`Stored password hash: ${user.password.substring(0, 20)}...`);
        
        // Directly compare using bcrypt for debugging
        const directBcryptCompare = await bcrypt.compare(password, user.password);
        console.log(`Direct bcrypt compare result: ${directBcryptCompare}`);
      }
      return res.status(401).json({ message: 'Invalid email or password' });
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
