
import { getEnv, setEnv } from './env';

// Get admin credentials from environment
export const getAdminCredentials = () => {
  // In a real app with a backend, this would come from process.env
  const adminEmail = getEnv('ADMIN_EMAIL');
  const adminPassword = getEnv('ADMIN_PASSWORD');
  
  return { adminEmail, adminPassword };
};

// Set admin credentials
export const setAdminCredentials = (email: string, password: string) => {
  setEnv('ADMIN_EMAIL', email);
  setEnv('ADMIN_PASSWORD', password);
};
