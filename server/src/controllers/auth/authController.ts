
// Export all auth controller functions as a single module
import { registerUser } from './registerController';
import { loginUser } from './loginController';
import { changePassword } from './passwordController';
import { getUserProfile, getUserBookings, deleteUserBooking } from './profileController';
import { Request, Response } from 'express';

export {
  registerUser,
  loginUser,
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
