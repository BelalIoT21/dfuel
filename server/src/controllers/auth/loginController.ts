
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs'; // Changed from bcrypt to bcryptjs
import User from '../../models/User';
import { generateToken } from '../../utils/tokenUtils';

// Define interfaces
interface LoginRequestBody {
  email: string;
  password: string;
}

interface UserResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  lastLogin: Date; // Added lastLogin to the interface
  createdAt: Date; // Added createdAt
}

export const loginUser = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update lastLogin time
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return the standardized response
    res.json({
      data: {
        user: {
          _id: user._id.toString(), // Ensure _id is returned as a string
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
