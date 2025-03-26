
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
  certifications: string[];
  lastLogin: Date; // Added lastLogin to the interface
  createdAt: Date; // Added createdAt
}

interface LoginResponse {
  data: {
    user: UserResponse;
    token: string;
  }
}

export const loginUser = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for: ${email}`);

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update lastLogin time
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());
    console.log(`Login successful for: ${email}, token generated`);

    // Return the standardized response
    res.json({
      data: {
        user: {
          _id: user._id.toString(), // Ensure _id is returned as a string
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          certifications: user.certifications || [],
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
