
/**
 * This module simulates an environment variables system using localStorage.
 * In a real production app, this would use actual .env files and environment variables.
 */

export const loadEnv = () => {
  if (!localStorage.getItem('ADMIN_EMAIL')) {
    localStorage.setItem('ADMIN_EMAIL', 'admin@learnit.com');
  }
  
  if (!localStorage.getItem('ADMIN_PASSWORD')) {
    localStorage.setItem('ADMIN_PASSWORD', 'admin123');
  }
};

export const getEnv = (key: string): string => {
  return localStorage.getItem(key) || '';
};

export const setEnv = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};
