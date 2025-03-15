import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import { apiService } from '@/services/apiService';
import { storage } from '@/utils/storage';
import { Platform, isWeb } from '@/utils/platform';
import mongoDbService from '@/services/mongoDbService';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log("AuthProvider initializing");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Start with loading false to prevent blocking render
  
  // Get auth functions
  const { login: authLogin, register: authRegister, logout: authLogout } = useAuthFunctions(user, setUser);

  console.log("Auth provider rendering with state:", { user, loading });

  // Login function
  const login = async (email: string, password: string) => {
    console.log("AuthContext: login called");
    try {
      const result = await authLogin(email, password);
      return result;
    } catch (error) {
      console.error("Error during login in context:", error);
      return false;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    console.log("AuthContext: register called");
    try {
      const result = await authRegister(email, password, name);
      return result;
    } catch (error) {
      console.error("Error during registration in context:", error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    console.log("AuthContext: logout called");
    try {
      authLogout();
      return true;
    } catch (error) {
      console.error("Error during logout in context:", error);
      return false;
    }
  };

  // Add certification
  const addCertification = async (machineId: string) => {
    if (!user) return false;
    
    try {
      const response = await apiService.addCertification(user.id, machineId);
      
      if (response.data?.success) {
        // Update local user state with new certification
        const updatedUser = {
          ...user,
          certifications: [...user.certifications, machineId]
        };
        
        setUser(updatedUser);
        
        // For native platforms, update AsyncStorage
        if (Platform.OS !== 'web') {
          await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        }
        
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
      const response = await apiService.updateProfile(user.id, { name, email });
      
      if (response.data?.success) {
        const updatedUser = { ...user, name, email };
        setUser(updatedUser);
        
        // For native platforms, update AsyncStorage
        if (Platform.OS !== 'web') {
          await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        }
        
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
      // Verify current password first
      const loginResponse = await apiService.login(user.email, currentPassword);
      
      if (loginResponse.error) {
        throw new Error('Current password is incorrect');
      }
      
      // If verification succeeded, update password
      const response = await apiService.updateProfile(user.id, { password: newPassword });
      return response.data?.success || false;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Password reset functions
  const requestPasswordReset = async (email: string) => {
    try {
      const response = await apiService.requestPasswordReset(email);
      return response.data?.success || false;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      const response = await apiService.resetPassword(email, resetCode, newPassword);
      return response.data?.success || false;
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

  console.log("Auth context value created:", { user: !!user, loading });

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
