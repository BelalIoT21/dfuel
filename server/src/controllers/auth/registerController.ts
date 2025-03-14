
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, googleId } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If googleId is provided and user exists, it means user is trying to login via Google
      if (googleId && userExists.googleId) {
        return res.status(200).json({
          _id: userExists._id,
          name: userExists.name,
          email: userExists.email,
          isAdmin: userExists.isAdmin,
          certifications: userExists.certifications,
          token: generateToken(userExists._id),
        });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: password || Math.random().toString(36).slice(-8), // Generate random password for Google users
      googleId: googleId || undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        certifications: user.certifications,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
