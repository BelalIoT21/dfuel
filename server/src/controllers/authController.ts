
// Export all auth controller functions as a single module
import { registerUser } from './auth/registerController';
import { loginUser } from './auth/loginController';
import { logout, updateProfile } from './auth/authController';
import { getUserProfile, getUserBookings, deleteUserBooking } from './auth/profileController';
import { changePassword } from './auth/passwordController';
import { ensureAdminUser } from './auth/adminController';

export {
  registerUser,
  loginUser,
  logout,
  updateProfile,
  getUserProfile,
  getUserBookings,
  deleteUserBooking,
  changePassword,
  ensureAdminUser
};
