
import { getEnv, setEnv } from './env';

/**
 * This utility provides functions to get and set admin credentials.
 * 
 * IMPORTANT: In a real production app:
 * 1. Admin credentials would be stored securely on the server
 * 2. Client would never have direct access to these values
 * 3. Authentication would be handled through JWTs, cookies, or sessions
 * 4. Password changes would be processed through secure API endpoints
 */

// Get admin credentials from environment
export const getAdminCredentials = () => {
  // In a real app with a backend, this would come from process.env on the server
  // and would never be exposed directly to the client
  const adminEmail = getEnv('ADMIN_EMAIL') || 'admin@learnit.com';
  const adminPassword = getEnv('ADMIN_PASSWORD') || 'admin123';
  
  console.log('Retrieved admin credentials:', { email: adminEmail });
  return { adminEmail, adminPassword };
};

// Set admin credentials
export const setAdminCredentials = (email: string, password: string) => {
  // In a real app, this would be an API call to update credentials on the server
  setEnv('ADMIN_EMAIL', email);
  setEnv('ADMIN_PASSWORD', password);
  console.log('Admin credentials updated:', { email });
};

// Check if user is using admin credentials
export const isUsingAdminCredentials = (email: string, password?: string) => {
  const { adminEmail, adminPassword } = getAdminCredentials();
  
  if (password) {
    // If password is provided, check both email and password
    return email === adminEmail && password === adminPassword;
  } else {
    // If only email is provided, just check email
    return email === adminEmail;
  }
};
