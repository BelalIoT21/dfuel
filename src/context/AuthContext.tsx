
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';
import { useProfileFunctions } from '@/hooks/useProfileFunctions';
import { usePasswordResetFunctions } from '@/hooks/usePasswordResetFunctions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth functions using custom hooks
  const { login, register, logout } = useAuthFunctions(user, setUser);
  const { addCertification, updateProfile, changePassword } = useProfileFunctions(user, setUser);
  const { requestPasswordReset, resetPassword } = usePasswordResetFunctions();

  useEffect(() => {
    // Check if there's a user in localStorage on initial load
    const storedUser = localStorage.getItem('learnit_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Combine all functions into the auth context value
  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    addCertification,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
