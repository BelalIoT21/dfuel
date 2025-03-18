
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set a default name if none is provided
    const userName = name || 'User'; // Default name is "User"

    // Get the next _id
    const nextId = await getNextUserId();

    // Create user with explicitly empty certifications array
    const user = await User.create({
      _id: nextId, // Assign the next _id
      name: userName, // Use the provided name or default "User"
      email,
      password,
      certifications: [], // Explicitly set empty certifications array
    });

    if (user) {
      res.status(201).json({
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            certifications: [], // Ensure empty certifications array in response
            token: generateToken(user._id.toString()),
          },
        },
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

// Helper function to get the next user ID
async function getNextUserId(): Promise<number> {
  const highestUser = await User.findOne().sort({ _id: -1 });
  return highestUser ? Number(highestUser._id) + 1 : 1;
}
