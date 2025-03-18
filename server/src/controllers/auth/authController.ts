
// Export all auth controller functions as a single module
import { registerUser, loginUser } from './loginController';
import { forgotPassword, resetPassword } from './passwordController';
import { getUserProfile, getUserBookings, deleteUserBooking } from './profileController';

export {
  registerUser,
  loginUser,
  forgotPassword as resetPassword,
  resetPassword as updatePassword,
  getUserProfile,
  getUserBookings,
  deleteUserBooking
};

// Placeholder functions for routes that don't have implementations yet
export const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

export const getMe = getUserProfile;

export const updateProfile = (req, res) => {
  res.status(501).json({ message: 'Profile update not implemented yet' });
};

export const verifyResetToken = (req, res) => {
  res.status(501).json({ message: 'Token verification not implemented yet' });
};
