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

  // Load user from localStorage or tokens on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // For native, try to get from AsyncStorage
        const storedUser = await storage.getItem('learnit_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // For web, try to get from token
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const response = await apiService.getCurrentUser();
              if (response.data) {
                setUser(response.data);
                localStorage.setItem('learnit_user', JSON.stringify(response.data));
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
      console.log("Login attempt for:", email);
      
      // First try API login
      const apiResponse = await apiService.login(email, password);
      
      if (apiResponse.data && apiResponse.data.token) {
        // Successfully authenticated via API
        console.log("Login successful via API");
        const userData = apiResponse.data;
        
        // Ensure we have both user data and token
        if (userData) {
          // Store token for future API requests
          localStorage.setItem('token', userData.token);
          
          // Store user data without sensitive info
          const userToStore = userData;
          setUser(userToStore);
          localStorage.setItem('learnit_user', JSON.stringify(userToStore));
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${userToStore.name || 'User'}!`
          });
          
          return true;
        }
      }
      
      // If API login fails, fallback to local authentication
      if (apiResponse.error) {
        console.warn("API login failed, falling back to local auth:", apiResponse.error);
        
        const authenticatedUser = await userDatabase.authenticate(email, password);
        
        if (authenticatedUser) {
          setUser(authenticatedUser);
          // For native, still store in AsyncStorage
          await storage.setItem('learnit_user', JSON.stringify(authenticatedUser));
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${authenticatedUser.name || 'User'}!`
          });
          
          return true;
        }
      }
      
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive"
      });
      
      throw new Error("Invalid credentials");
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("Registration attempt for:", email);
      
      // First try API registration
      const apiResponse = await apiService.register({ email, password, name });
      
      if (apiResponse.data && apiResponse.data.token) {
        // Successfully registered via API
        console.log("Registration successful via API");
        const userData = apiResponse.data;
        
        // Ensure we have both user data and token
        if (userData) {
          // Store token for future API requests
          localStorage.setItem('token', userData.token);
          
          // Store user data without sensitive info
          const userToStore = userData;
          setUser(userToStore);
          localStorage.setItem('learnit_user', JSON.stringify(userToStore));
          
          toast({
            title: "Registration successful",
            description: `Welcome, ${userToStore.name || 'User'}!`
          });
          
          return true;
        }
      }
      
      // If API registration fails with a specific error, show it
      if (apiResponse.error) {
        console.warn("API registration failed:", apiResponse.error);
        
        // Check if it's a "user already exists" error from API
        if (apiResponse.error.includes("already exists")) {
          toast({
            title: "Registration failed",
            description: "A user with this email already exists",
            variant: "destructive"
          });
          throw new Error("User already exists");
        }
        
        // Fallback to local registration
        console.log("Falling back to local registration");
        const newUser = await userDatabase.registerUser(email, password, name);
        
        if (newUser) {
          setUser(newUser);
          await storage.setItem('learnit_user', JSON.stringify(newUser));
          
          toast({
            title: "Registration successful",
            description: `Welcome, ${newUser.name || 'User'}!`
          });
          
          return true;
        }
      }
      
      toast({
        title: "Registration failed",
        description: "Could not create your account. Please try again later.",
        variant: "destructive"
      });
      
      throw new Error("Registration failed");
    } catch (error) {
      console.error('Registration error:', error);
      
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('token');
    await storage.removeItem('learnit_user');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
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
      return false;
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
    addCertification: userDatabase.addCertification,
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
