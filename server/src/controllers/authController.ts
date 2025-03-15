
// Export all auth controller functions from their respective files
export { registerUser } from './auth/registerController';
export { loginUser } from './auth/loginController';
export { getUserProfile } from './auth/profileController';

// Export the auto-seed function for direct use in routes or middleware if needed
export { ensureAdminUser } from './auth/adminController';
