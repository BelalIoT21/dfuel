
// Export all auth controller functions as a single module
import { registerUser } from './registerController';
import { loginUser } from './loginController';
import { forgotPassword, resetPassword, changePassword } from './passwordController';
import { getUserProfile, getUserBookings, deleteUserBooking } from './profileController';
import { Request, Response } from 'express';

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getUserProfile,
  getUserBookings,
  deleteUserBooking
};

// Placeholder functions for routes that don't have implementations yet
export const logout = (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const getMe = getUserProfile;

export const updateProfile = (req: Request, res: Response) => {
  res.status(501).json({ message: 'Profile update not implemented yet' });
};

export const verifyResetToken = (req: Request, res: Response) => {
  res.status(501).json({ message: 'Token verification not implemented yet' });
};

// Alias for password reset functions for backward compatibility
export const updatePassword = resetPassword;
