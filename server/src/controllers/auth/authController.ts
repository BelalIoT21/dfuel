
// Export all auth controller functions as a single module
import { registerUser } from './registerController';
import { loginUser } from './loginController';
import { changePassword } from './passwordController';
import { getUserProfile, getUserBookings, deleteUserBooking } from './profileController';
import { Request, Response } from 'express';
import User from '../../models/User';

export {
  registerUser,
  loginUser,
  changePassword,
  getUserProfile,
  getUserBookings,
  deleteUserBooking
};

// Logout function implementation
export const logout = (req: Request, res: Response) => {
  // Server-side logout handling
  // In a token-based auth system, we mainly let the client handle token removal
  // But we can implement optional server-side handling for additional security
  try {
    // Clear any server-side session data or tokens if needed
    // For JWT, we don't typically manage tokens server-side, but could add token to blacklist if needed
    
    // Return success
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

// Placeholder for getMe
export const getMe = getUserProfile;

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // req.user should be populated by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const { name, email } = req.body;

    // Validate inputs
    if (!name && !email) {
      return res.status(400).json({
        message: 'Please provide at least one field to update'
      });
    }

    // Check if user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;

    // Save the updated user
    await user.save();

    // Return success response with user data (excluding password)
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
