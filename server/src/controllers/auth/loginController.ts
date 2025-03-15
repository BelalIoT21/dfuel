
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';
import bcrypt from 'bcryptjs';

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found with email: ${email}`);
      
      // Check for default admin credentials from .env
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnit.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (email === adminEmail && password === adminPassword) {
        console.log('Using default admin credentials for login');
        
        // Create admin user if it doesn't exist
        const newAdminUser = new User({
          name: 'Admin',
          email: adminEmail,
          password: await bcrypt.hash(adminPassword, 10),
          isAdmin: true,
          certifications: [],
          bookings: [],
          lastLogin: new Date()
        });
        
        await newAdminUser.save();
        console.log('Created admin user in database');
        
        return res.json({
          user: {
            _id: newAdminUser._id,
            name: newAdminUser.name,
            email: newAdminUser.email,
            isAdmin: newAdminUser.isAdmin,
            certifications: newAdminUser.certifications,
          },
          token: generateToken(newAdminUser._id),
        });
      }
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`Login successful for user: ${email}`);

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Return user data in the format expected by the frontend
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        certifications: user.certifications,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
