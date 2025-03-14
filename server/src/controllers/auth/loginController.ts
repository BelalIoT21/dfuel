
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, googleToken } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Check if this is a Google authentication attempt
    if (googleToken) {
      // For Google login, find user by email (no password check)
      const user = await User.findOne({ email });
      
      if (!user) {
        // User doesn't exist, this should go to registration instead
        return res.status(404).json({ message: 'User not found. Please register first.' });
      }
      
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
      
      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          certifications: user.certifications,
          googleId: user.googleId
        },
        token: generateToken(user._id),
      });
    }

    // Regular email/password login
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found with email: ${email}`);
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
        googleId: user.googleId
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
