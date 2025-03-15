
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import { useAuthFunctions } from '@/hooks/useAuthFunctions';
import { apiService } from '@/services/apiService';
import { useToast } from '@/components/ui/use-toast';

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { login: apiLogin, register: apiRegister, logout: apiLogout, isLoading } = useAuthFunctions(user, setUser);
  const { toast } = useToast();

  // Load user from token on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("No token found, user is not logged in");
          setLoading(false);
          return;
        }
        
        console.log("Token found, attempting to load user");
        // Try to get current user from API
        const response = await apiService.getCurrentUser();
        
        if (response.error) {
          console.error("Error loading user session:", response.error);
          // Clear invalid token
          if (response.status === 401) {
            localStorage.removeItem('token');
            toast({
              title: "Session expired",
              description: "Your login session has expired. Please log in again.",
              variant: "destructive"
            });
          }
        } else if (response.data && response.data.user) {
          setUser(response.data.user);
          console.log("User loaded successfully:", response.data.user);
        } else {
          // If no current user, user is not logged in
          console.log("No active user session found");
        }
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [toast]);

  // Login function - directly use the apiLogin from useAuthFunctions
  const login = async (email: string, password: string) => {
    console.log("Authenticating via API:", email);
    return await apiLogin(email, password);
  };

  // Register function - directly use the apiRegister from useAuthFunctions
  const register = async (email: string, password: string, name: string) => {
    return await apiRegister(email, password, name);
  };

  // Logout function - use the apiLogout from useAuthFunctions
  const logout = () => {
    apiLogout();
  };

  // Add certification
  const addCertification = async (machineId: string) => {
    if (!user) return false;
    
    try {
      const response = await apiService.addCertification(user._id, machineId);
      
      if (response.data && response.data.success) {
        // Update local user state with new certification
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

  // Update profile
  const updateProfile = async (name: string, email: string) => {
    if (!user) return false;
    
    try {
      const response = await apiService.updateProfile(user._id, { name, email });
      
      if (response.data && response.data.success) {
        const updatedUser = { ...user, name, email };
        setUser(updatedUser);
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
      const response = await apiService.updatePassword(user._id, currentPassword, newPassword);
      
      if (response.data) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Password reset functions
  const requestPasswordReset = async (email: string) => {
    try {
      // Replace userDatabase call with apiService
      const response = await apiService.getStorageItem(`resetCode_${email}`);
      return response.data !== null;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    try {
      // This would need to be implemented in apiService
      // For now, return false
      return false;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  };

  // Combine all functions into the auth context value
  const value: AuthContextType = {
    user,
    loading: loading || isLoading,
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
