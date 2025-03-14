
// Admin credentials utility

// Get admin credentials from environment
export const getAdminCredentials = () => {
  // In a real app, this would come from process.env
  // Using localStorage to simulate .env for this demo
  const adminEmail = localStorage.getItem('ADMIN_EMAIL') || 'admin@learnit.com';
  const adminPassword = localStorage.getItem('ADMIN_PASSWORD') || 'admin123';
  
  return { adminEmail, adminPassword };
};

// Set admin credentials
export const setAdminCredentials = (email: string, password: string) => {
  localStorage.setItem('ADMIN_EMAIL', email);
  localStorage.setItem('ADMIN_PASSWORD', password);
};

