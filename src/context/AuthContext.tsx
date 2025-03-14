
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import userDatabase from '@/services/userDatabase';
import { storage } from '@/utils/storage';

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
          console.log("Loading user from storage:", storedUser);
          setUser(JSON.parse(storedUser));
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
      console.log("Attempting login:", email);
      const authenticatedUser = await userDatabase.authenticate(email, password);
      
      if (authenticatedUser) {
        console.log("Login successful:", authenticatedUser);
        // Ensure safetyCoursesCompleted exists
        if (!authenticatedUser.safetyCoursesCompleted) {
          authenticatedUser.safetyCoursesCompleted = [];
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
        // Ensure safetyCoursesCompleted exists
        if (!newUser.safetyCoursesCompleted) {
          newUser.safetyCoursesCompleted = [];
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
      console.log("Adding certification:", machineId, "for user:", user.id);
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

  // Add safety course completion
  const addSafetyCourse = async (courseId: string = 'safety-course') => {
    if (!user) return false;
    
    try {
      console.log("Adding safety course:", courseId, "for user:", user.id);
      const success = await userDatabase.addSafetyCourse(user.id, courseId);
      
      if (success) {
        // Ensure safetyCoursesCompleted array exists
        const currentCourses = user.safetyCoursesCompleted || [];
        
        // Update local user state with new safety course
        const updatedUser = {
          ...user,
          safetyCoursesCompleted: [...currentCourses, courseId]
        };
        
        console.log("Updated user with safety course:", updatedUser);
        setUser(updatedUser);
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding safety course:', error);
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
    addSafetyCourse, // Add the new method
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
