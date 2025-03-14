
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

    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    // Find user by email
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

    // Force isAdmin to be a boolean value
    const isAdmin = user.isAdmin === true;
    console.log(`Login successful for user: ${email}, isAdmin: ${isAdmin}`);

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate token with admin status
    const token = generateToken(user._id.toString(), isAdmin);
    console.log(`Generated token with isAdmin=${isAdmin}`);

    // Return user data in the format expected by the frontend
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: isAdmin,
        certifications: user.certifications,
        safetyCoursesCompleted: user.safetyCoursesCompleted || [],
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
