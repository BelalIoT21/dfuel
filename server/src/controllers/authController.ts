
// Export all auth controller functions from their respective files
export { registerUser } from './auth/registerController';
export { loginUser } from './auth/loginController';
export { logout, updateProfile } from './auth/authController';
export { getUserProfile, getUserBookings, deleteUserBooking } from './auth/profileController';
export { changePassword } from './auth/passwordController';
export { ensureAdminUser } from './auth/adminController';
