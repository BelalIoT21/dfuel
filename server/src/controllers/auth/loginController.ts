
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt received at endpoint:', req.originalUrl);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
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
      
      // For development, provide more helpful error
      if (process.env.NODE_ENV === 'development') {
        if (userCount === 0) {
          return res.status(401).json({ 
            message: 'No users in database. Use the default admin credentials or restart the server to seed the database.',
            code: 'NO_USERS',
            debug: true
          });
        }
      }
      
      return res.status(401).json({ 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS' 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(401).json({ 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log(`Login successful for user: ${email}`);

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate token with proper expiration
    const token = generateToken(user._id);
    console.log(`Generated token for user ${email}`);

    // Return user data in the format expected by the frontend
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        certifications: user.certifications,
      },
      token,
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      code: 'SERVER_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
