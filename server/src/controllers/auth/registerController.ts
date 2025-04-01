
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
    console.log(`Generated next user ID: ${nextId}`);

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
        // Try with a small increment instead of a large random offset
        // Just increment by 1 and try again
        nextId = nextId + 1;
        console.log(`Retrying with incremented user ID: ${nextId}`);
        
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

// Improved helper function to get the next user ID
async function getNextUserId(): Promise<number> {
  try {
    // Find highest user ID by sorting in descending order
    const users = await User.find({}, '_id').sort({ _id: -1 }).limit(1);
    
    if (users && users.length > 0) {
      // Get highest ID and add 1
      const highestId = Number(users[0]._id);
      console.log(`Found highest user ID: ${highestId}`);
      return highestId + 1;
    }
    
    // If no users exist, start with ID 1
    console.log('No existing users found, starting with ID 1');
    return 1;
  } catch (error) {
    console.error('Error generating next user ID:', error);
    
    // Fallback to a small starting ID if there's an error
    // instead of a large random number
    return 1;
  }
}
