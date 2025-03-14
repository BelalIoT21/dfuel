
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import userDatabase from '@/services/userDatabase';
import { storage } from '@/utils/storage';
import { isUsingAdminCredentials } from '@/utils/adminCredentials';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await storage.getItem('learnit_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Initialize safetyCoursesCompleted if it doesn't exist (backwards compatibility)
          if (!parsedUser.safetyCoursesCompleted) {
            parsedUser.safetyCoursesCompleted = [];
          }
          
          // Check if this is the admin user
          if (isUsingAdminCredentials(parsedUser.email)) {
            parsedUser.isAdmin = true;
          }
          
          setUser(parsedUser);
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
      // Check if this is the admin user
      const isAdmin = isUsingAdminCredentials(email, password);
      
      const authenticatedUser = await userDatabase.authenticate(email, password);
      
      if (authenticatedUser) {
        // Initialize safetyCoursesCompleted if it doesn't exist
        if (!authenticatedUser.safetyCoursesCompleted) {
          authenticatedUser.safetyCoursesCompleted = [];
        }
        
        // Override isAdmin if using admin credentials
        if (isAdmin) {
          authenticatedUser.isAdmin = true;
        }
        
        setUser(authenticatedUser);
        await storage.setItem('learnit_user', JSON.stringify(authenticatedUser));
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
      const newUser = await userDatabase.registerUser(email, password, name);
      
      if (newUser) {
        // Initialize safetyCoursesCompleted if it doesn't exist
        if (!newUser.safetyCoursesCompleted) {
          newUser.safetyCoursesCompleted = [];
        }
        
        // Check if this is the admin user
        if (isUsingAdminCredentials(email, password)) {
          newUser.isAdmin = true;
        }
        
        setUser(newUser);
        await storage.setItem('learnit_user', JSON.stringify(newUser));
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
    await storage.removeItem('learnit_user');
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
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  };

  // Track safety course completion
  const completeSafetyCourse = async (courseId: string) => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.completeSafetyCourse(user.id, courseId);
      
      if (success) {
        // Initialize safetyCoursesCompleted if it doesn't exist
        const safetyCoursesCompleted = user.safetyCoursesCompleted || [];
        
        // Update local user state with completed safety course
        const updatedUser = {
          ...user,
          safetyCoursesCompleted: [...safetyCoursesCompleted, courseId]
        };
        
        setUser(updatedUser);
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error completing safety course:', error);
      return false;
    }
  };

  // Update profile
  const updateProfile = async (details: { name?: string; email?: string }) => {
    if (!user) return false;
    
    try {
      const success = await userDatabase.updateUserProfile(user.id, details);
      
      if (success) {
        const updatedUser = { ...user, ...details };
        setUser(updatedUser);
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
    completeSafetyCourse,
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
