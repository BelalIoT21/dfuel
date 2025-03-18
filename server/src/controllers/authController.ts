
// Export all auth controller functions from their respective files
export { registerUser } from './auth/registerController';
export { loginUser } from './auth/loginController';
export { changePassword, forgotPassword, resetPassword } from './auth/passwordController';
export { getUserProfile } from './auth/profileController';
