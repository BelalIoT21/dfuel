
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
      console.log("Loading user from localStorage");
      const storedUser = localStorage.getItem('learnit_user');
      console.log("Stored user:", storedUser ? "Found" : "Not found");
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Successfully parsed user:", parsedUser.name);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('learnit_user');
        }
      } else {
        console.log("No user found in localStorage");
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Log user state changes
  useEffect(() => {
    console.log("Auth state updated:", { user: user?.name || "null", loading });
  }, [user, loading]);

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
