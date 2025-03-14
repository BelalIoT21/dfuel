
import { useState, useEffect } from 'react';
import { User } from '@/types/database';
import { useLoginFunctions } from './useLoginFunctions';
import { useRegistrationFunctions } from './useRegistrationFunctions';
import { usePasswordResetFunctions } from './usePasswordResetFunctions';
import { useProfileFunctions } from './useProfileFunctions';
import { useLogoutFunction } from './useLogoutFunction';

export const useAuthFunctions = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('learnit_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('learnit_user');
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Compose specialized hooks
  const { login, googleLogin } = useLoginFunctions(setUser, setLoading);
  const { register } = useRegistrationFunctions(setUser, setLoading);
  const { requestPasswordReset, resetPassword } = usePasswordResetFunctions();
  const { addCertification, updateProfile, changePassword } = useProfileFunctions(user, setUser);
  const { logout } = useLogoutFunction(setUser);

  return {
    user,
    loading,
    login,
    googleLogin,
    register,
    logout,
    addCertification,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };
};
