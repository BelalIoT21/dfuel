
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

    // Get the next _id with improved error handling and retry logic
    let nextId;
    try {
      nextId = await getNextUserId();
      console.log(`Generated next user ID: ${nextId}`);
    } catch (idError) {
      console.error('Error generating user ID:', idError);
      // Use timestamp-based ID as fallback
      nextId = Math.floor(Date.now() / 1000);
      console.log(`Using timestamp-based fallback ID: ${nextId}`);
    }

    // Create user with explicitly empty certifications array
    try {
      const user = await User.create({
        _id: nextId,
        name: userName,
        email,
        password,
        certifications: [], // Explicitly set empty certifications array
      });

      if (user) {
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
              bookings: user.bookings || [], // Include bookings if available
              updatedAt: user.updatedAt, // Include timestamps
              createdAt: user.createdAt
            },
            token
          },
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (createError) {
      console.error('Error creating user:', createError);
      
      // Specific handling for duplicate key errors
      if (createError.code === 11000) {
        // Get a new ID with a retry mechanism
        try {
          const retryId = await getRetryUserId();
          console.log(`Retrying with new user ID: ${retryId}`);
          
          const user = await User.create({
            _id: retryId,
            name: userName,
            email,
            password,
            certifications: [],
          });
          
          if (user) {
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
                  bookings: user.bookings || [],
                  updatedAt: user.updatedAt,
                  createdAt: user.createdAt
                },
                token
              },
            });
            return;
          }
        } catch (retryError) {
          console.error('Error in retry attempt:', retryError);
          return res.status(500).json({ 
            message: 'Failed to create user account. Please try again.',
            error: 'Database error during registration retry'
          });
        }
      }
      
      res.status(500).json({ 
        message: 'Failed to create user account', 
        error: createError instanceof Error ? createError.message : 'Unknown error' 
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

// Helper function to get the next user ID with improved error handling
async function getNextUserId(): Promise<number> {
  try {
    // Get all users and sort by _id
    const users = await User.find({}, '_id').sort({ _id: -1 }).limit(1);
    
    // If we have users, return the highest ID + 1
    if (users && users.length > 0) {
      const highestId = Number(users[0]._id);
      console.log(`Highest existing user ID: ${highestId}`);
      return highestId + 1;
    }
    
    // If no users exist, start with ID 1
    console.log("No existing users found, starting with ID 1");
    return 1;
  } catch (error) {
    console.error('Error generating next user ID:', error);
    
    // Generate a random ID between 1000-9999 as a fallback
    // This helps avoid collisions if the normal sequence is broken
    const randomId = Math.floor(1000 + Math.random() * 9000);
    console.log(`Error in ID generation, using random ID: ${randomId}`);
    return randomId;
  }
}

// Alternative ID generation for retry attempts
async function getRetryUserId(): Promise<number> {
  try {
    // Get all existing IDs
    const users = await User.find({}, '_id');
    const existingIds = users.map(user => Number(user._id));
    
    // Get the highest ID
    const highestId = Math.max(...existingIds, 0);
    
    // Generate a retry ID that's higher than any existing ID
    const retryId = highestId + 1000 + Math.floor(Math.random() * 1000);
    console.log(`Generated retry ID: ${retryId} (highest existing ID was ${highestId})`);
    
    return retryId;
  } catch (error) {
    console.error('Error generating retry user ID:', error);
    
    // Generate a timestamp-based ID as a last resort
    const timestampId = Math.floor(Date.now() / 1000);
    console.log(`Using timestamp-based ID for retry: ${timestampId}`);
    return timestampId;
  }
}
