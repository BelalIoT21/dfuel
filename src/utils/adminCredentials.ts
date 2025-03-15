
import { getEnv, setEnv } from './env';

// Default admin credentials (these would normally be environment variables)
const DEFAULT_ADMIN_EMAIL = 'admin@learnit.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Get current admin credentials
export const getAdminCredentials = () => {
  const adminEmail = getEnv('ADMIN_EMAIL', DEFAULT_ADMIN_EMAIL);
  const adminPassword = getEnv('ADMIN_PASSWORD', DEFAULT_ADMIN_PASSWORD);
  
  return {
    adminEmail,
    adminPassword
  };
};

// Set admin credentials (normally would update environment variables)
export const setAdminCredentials = (email: string, password: string) => {
  setEnv('ADMIN_EMAIL', email);
  if (password) {
    setEnv('ADMIN_PASSWORD', password);
  }
};
