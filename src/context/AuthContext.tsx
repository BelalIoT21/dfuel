
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import { apiService } from '@/services/apiService';
import { storage } from '@/utils/storage';
import { Platform } from 'react-native';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from tokens on initial load (web) or storage (native)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // For native, still try to get from AsyncStorage
        const storedUser = await storage.getItem('learnit_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // For web, try to get from token
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const response = await apiService.getCurrentUser();
              if (response.data && response.data.user) {
                setUser(response.data.user);
              }
            } catch (error) {
              console.error('Error getting current user:', error);
            }
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
    try {
      const response = await apiService.login(email, password);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        setUser(userData);
        
        // For native platforms, still store in AsyncStorage
        if (Platform.OS !== 'web') {
          await storage.setItem('learnit_user', JSON.stringify(userData));
        } else {
          // For web, just store basic info for session restoration
          localStorage.setItem('learnit_user', JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            isAdmin: userData.isAdmin
          }));
        }
        
        return true;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await apiService.register({ email, password, name });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        setUser(userData);
        
        // For native platforms, still store in AsyncStorage
        if (Platform.OS !== 'web') {
          await storage.setItem('learnit_user', JSON.stringify(userData));
        } else {
          // For web, just store basic info for session restoration
          localStorage.setItem('learnit_user', JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            isAdmin: userData.isAdmin
          }));
        }
        
        return true;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('learnit_user');
    
    // For native platforms
    if (Platform.OS !== 'web') {
      await storage.removeItem('learnit_user');
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
        } else {
          // For web, update minimal session data
          const storedUser = localStorage.getItem('learnit_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            localStorage.setItem('learnit_user', JSON.stringify({
              ...parsedUser,
              name,
              email
            }));
          }
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
