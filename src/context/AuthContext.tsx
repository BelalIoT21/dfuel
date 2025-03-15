
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';
import { AuthContextType } from '@/types/auth';
import userDatabase from '@/services/userDatabase';
import { storage } from '@/utils/storage';
import { apiService } from '@/services/apiService';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from tokens on initial load (web) or storage (native)
  useEffect(() => {
    console.log("AuthProvider: Loading user data");
    const loadUser = async () => {
      try {
        setLoading(true);
        
        // For web - try to get from localStorage first
        const storedUserStr = localStorage.getItem('learnit_user');
        if (storedUserStr) {
          try {
            const storedUser = JSON.parse(storedUserStr);
            console.log("Found user in localStorage:", storedUser.name);
            setUser(storedUser);
          } catch (e) {
            console.error("Error parsing stored user:", e);
            localStorage.removeItem('learnit_user');
          }
        } else {
          // Try to get from token if no user in localStorage
          console.log("No user in localStorage, checking token");
          const token = localStorage.getItem('token');
          if (token) {
            try {
              console.log("Found token, fetching current user");
              const response = await apiService.getCurrentUser();
              if (response.data && response.data.user) {
                console.log("Got user from API:", response.data.user.name);
                setUser(response.data.user);
                localStorage.setItem('learnit_user', JSON.stringify(response.data.user));
              }
            } catch (error) {
              console.error('Error getting current user:', error);
              localStorage.removeItem('token');
            }
          } else {
            console.log("No token found");
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        console.log("Auth loading complete");
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Authenticating user:", email);
      
      const authenticatedUser = await userDatabase.authenticate(email, password);
      
      if (authenticatedUser) {
        console.log("Authentication successful for:", authenticatedUser.name);
        setUser(authenticatedUser);
        localStorage.setItem('learnit_user', JSON.stringify(authenticatedUser));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${authenticatedUser.name}!`
        });
        
        return true;
      } else {
        console.log("Authentication failed");
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log("Registering new user:", email);
      
      const newUser = await userDatabase.registerUser(email, password, name);
      
      if (newUser) {
        console.log("Registration successful for:", newUser.name);
        setUser(newUser);
        localStorage.setItem('learnit_user', JSON.stringify(newUser));
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${newUser.name}!`
        });
        
        return true;
      } else {
        console.log("Registration failed");
        toast({
          title: "Registration failed",
          description: "Could not create user account",
          variant: "destructive"
        });
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    console.log("Logging out user");
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('learnit_user');
    
    toast({
      description: "You have been logged out successfully."
    });
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
