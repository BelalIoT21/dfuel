
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
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set a default name if none is provided
    const userName = name || 'User'; // Default name is "User"

    // Get the next available ID
    let nextId = await getNextUserId();

    // Create user with explicitly empty certifications array
    try {
      const user = await User.create({
        _id: nextId,
        name: userName,
        email,
        password,
        certifications: [], // Explicitly set empty certifications array
      });

      // Generate a token for the new user
      const token = generateToken(user._id.toString());
      
      res.status(201).json({
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            certifications: user.certifications || [], // Ensure we return certifications
            createdAt: user.createdAt
          },
          token
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Type guard for MongoDB duplicate key error
      const isMongoError = error instanceof Error && 'code' in error;
      const errorCode = isMongoError ? (error as any).code : null;
      
      // Handle duplicate key errors
      if (errorCode === 11000) {
        // Try with a different ID
        nextId = nextId + 1000 + Math.floor(Math.random() * 100);
        
        const user = await User.create({
          _id: nextId,
          name: userName,
          email,
          password,
          certifications: [],
        });
        
        // Generate a token for the new user
        const token = generateToken(user._id.toString());
        
        res.status(201).json({
          data: {
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
              certifications: user.certifications || [],
              createdAt: user.createdAt
            },
            token
          },
        });
        return;
      }
      
      res.status(500).json({ 
        message: 'Failed to create user account', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Simplified helper function to get the next user ID
async function getNextUserId(): Promise<number> {
  try {
    const users = await User.find({}, '_id').sort({ _id: -1 }).limit(1);
    
    if (users && users.length > 0) {
      const highestId = Number(users[0]._id);
      return highestId + 1;
    }
    
    return 1;
  } catch (error) {
    console.error('Error generating next user ID:', error);
    return Math.floor(1000 + Math.random() * 9000);
  }
}
