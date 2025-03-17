import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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
}

interface LoginResponse {
  data: {
    user: UserResponse;
    token: string;
  }
}

export const loginUser = async (req: Request<{}, {}, LoginRequestBody>, res: Response<LoginResponse | { message: string }>) => {
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
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};