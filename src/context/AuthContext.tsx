
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const { login, register, logout } = useAuthFunctions(user, setUser);

  // Debug render
  console.log("Rendering AuthProvider");

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("Loading user from storage/API");
        const storedUser = await storage.getItem('learnit_user');
        
        if (storedUser) {
          console.log("User found in storage");
          const parsedUser = JSON.parse(storedUser);
          console.log("Stored user:", parsedUser);
          setUser(parsedUser);
        } else {
          console.log("No user in storage, checking token");
          const token = localStorage.getItem('token');
          if (token) {
            try {
              console.log("Token found, getting current user from API");
              const response = await apiService.getCurrentUser();
              console.log("Current user API response:", response);
              if (response.data && response.data.user) {
                console.log("Setting user from API response");
                setUser(response.data.user);
              }
            } catch (error) {
              console.error('Error getting current user:', error);
            }
          } else {
            console.log("No token found");
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

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
        await storage.setItem('learnit_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  };

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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return false;
    
    try {
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

  // Stub functions for password reset to maintain interface compatibility
  const requestPasswordReset = async () => false;
  const resetPassword = async () => false;

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

  console.log("AuthProvider state:", { user: user?.name, isAdmin: user?.isAdmin, loading });

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
