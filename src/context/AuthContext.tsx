
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import userDatabase from '@/services/userDatabase';
import { storage } from '@/utils/storage';
import { apiService } from '@/services/apiService';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the auth functions hook to manage authentication
  const { login: loginFn, register: registerFn, logout: logoutFn } = useAuthFunctions(user, setUser);

  // Load user from tokens on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for token in localStorage first
        const token = localStorage.getItem('token');
        
        if (token) {
          console.log('Found auth token, attempting to get current user...');
          try {
            // Set the token in the API service
            const response = await apiService.getCurrentUser();
            
            if (response.data) {
              console.log('Successfully retrieved current user from API');
              setUser(response.data);
            } else {
              // If the token is invalid, remove it
              console.log('Token might be invalid, removing it');
              localStorage.removeItem('token');
              
              // As a fallback, try to get from storage
              const storedUser = await storage.getItem('learnit_user');
              if (storedUser) {
                console.log('Retrieved user data from storage');
                setUser(JSON.parse(storedUser));
              }
            }
          } catch (error) {
            console.error('Error getting current user with token:', error);
            localStorage.removeItem('token');
          }
        } else {
          // Try to get from storage as a backup
          const storedUser = await storage.getItem('learnit_user');
          if (storedUser) {
            console.log('Retrieved user data from storage');
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    return await loginFn(email, password);
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    return await registerFn(email, password, name);
  };

  // Logout function
  const logout = async () => {
    await logoutFn();
  };

  // Add certification
  const addCertification = async (machineId: string) => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.addCertification(user.id, machineId);
      
      if (success) {
        // Update local user state with new certification
        const updatedUser = {
          ...user,
          certifications: [...user.certifications, machineId]
        };
        
        setUser(updatedUser);
        // For native, still store in AsyncStorage
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  };

  // Update profile
  const updateProfile = async (name: string, email: string) => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.updateUserProfile(user.id, { name, email });
      
      if (success) {
        const updatedUser = { ...user, name, email };
        setUser(updatedUser);
        // For native, still store in AsyncStorage
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return false;
    
    try {
      // First verify the current password
      const authenticatedUser = await userDatabase.authenticate(user.email, currentPassword);
      
      if (!authenticatedUser) {
        throw new Error('Current password is incorrect');
      }
      
      const success = await userDatabase.updateUserProfile(user.id, { password: newPassword });
      return success;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Password reset functions
  const requestPasswordReset = async (email: string) => {
    try {
      return await userDatabase.requestPasswordReset(email);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      return await userDatabase.resetPassword(email, resetCode, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  };

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
