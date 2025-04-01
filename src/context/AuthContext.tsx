import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import { apiService } from '@/services/apiService';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';
import { certificationService } from '@/services/certificationService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { login: loginFn, register: registerFn, logout: logoutFn } = useAuthFunctions(user, setUser);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Checking authentication status...');
        const token = localStorage.getItem('token');
        
        if (token) {
          console.log('Found auth token, attempting to get current user...');
          try {
            apiService.setToken(token);
            const response = await apiService.getCurrentUser();
            
            if (response.data) {
              console.log('Successfully retrieved current user from API');
              const userData = {
                ...response.data,
                id: response.data._id || response.data.id
              };
              
              if (!userData.certifications) {
                userData.certifications = [];
              } else if (!Array.isArray(userData.certifications)) {
                userData.certifications = [String(userData.certifications)];
              }
              
              console.log('User certifications from API:', userData.certifications);
              
              if (userData.certifications.length === 0 && userData.id) {
                try {
                  console.log('Fetching certifications separately from service...');
                  const certifications = await certificationService.getUserCertifications(userData.id);
                  if (Array.isArray(certifications) && certifications.length > 0) {
                    console.log('Found certifications from service:', certifications);
                    userData.certifications = certifications;
                  }
                } catch (certErr) {
                  console.error('Error fetching certifications:', certErr);
                }
              }
              
              setUser(userData);
            } else {
              console.log('Token might be invalid, removing it');
              localStorage.removeItem('token');
              apiService.setToken(null);
            }
          } catch (error) {
            console.error('Error getting current user with token:', error);
            localStorage.removeItem('token');
            apiService.setToken(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    return await loginFn(email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    return await registerFn(email, password, name);
  };

  const logout = async () => {
    try {
      return await logoutFn();
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  const addCertification = async (machineId: string) => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.addCertification(user.id, machineId);
      
      if (success) {
        const updatedUser = {
          ...user,
          certifications: [...user.certifications, machineId]
        };
        
        setUser(updatedUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  };

  const updateProfile = async (updates: { name?: string, email?: string }) => {
    if (!user) return false;
    
    try {
      console.log("AuthContext: Updating profile with:", updates);
      const success = await userDatabase.updateUserProfile(user.id, updates);
      
      if (success) {
        console.log("Profile update successful, updating user state");
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        return true;
      }
      
      console.log("Profile update failed in database layer");
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return false;
    
    try {
      console.log("AuthContext: Attempting to change password");
      
      console.log("Using userDatabase.changePassword directly...");
      const success = await userDatabase.changePassword(user.id, currentPassword, newPassword);
      
      return success;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

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
      {children}
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
