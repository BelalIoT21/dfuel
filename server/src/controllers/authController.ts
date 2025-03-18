
// Export all auth controller functions from their respective files
export { registerUser } from './auth/registerController';
export { loginUser } from './auth/loginController';
export { forgotPassword, resetPassword, changePassword } from './auth/passwordController';
export { getUserProfile } from './auth/profileController';
