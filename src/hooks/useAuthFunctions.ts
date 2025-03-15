
import { useState } from 'react';
import { User } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { storage } from '@/utils/storage';
import { logger } from '@/utils/logger';

// Create a hook-specific logger
const authLogger = logger.child('AuthFunctions');

export const useAuthFunctions = (
  user: User | null, 
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      authLogger.info("Login attempt for:", { email });
      
      // API login
      const apiResponse = await apiService.login(email, password);
      
      if (apiResponse.error) {
        authLogger.error("API login error:", apiResponse.error);
        toast({
          title: "Login failed",
          description: apiResponse.error,
          variant: "destructive"
        });
        return false;
      }
      
      if (apiResponse.data) {
        authLogger.info("API login successful for:", { email });
        const userData = apiResponse.data.user;
        // Save the token for future API requests in sessionStorage
        if (apiResponse.data.token) {
          sessionStorage.setItem('token', apiResponse.data.token);
          authLogger.debug("Token saved to sessionStorage");
        }
        
        setUser(userData as User);
        // Also save to storage for persistence
        await storage.setItem('learnit_user', JSON.stringify(userData));
        authLogger.debug("User data saved to persistent storage");
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`
        });
        return true;
      }
      
      authLogger.warn("Login failed - unexpected response format");
      toast({
        title: "Login failed",
        description: "The server returned an unexpected response. Please try again.",
        variant: "destructive"
      });
      return false;
      
    } catch (error) {
      authLogger.error("Error during login:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please ensure the server is running.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      authLogger.info("Registration attempt for:", { email });
      
      // API registration
      const apiResponse = await apiService.register({ email, password, name });
      
      if (apiResponse.error) {
        authLogger.error("API registration error:", apiResponse.error);
        toast({
          title: "Registration failed",
          description: apiResponse.error,
          variant: "destructive"
        });
        return false;
      }
      
      if (apiResponse.data) {
        authLogger.info("API registration successful for:", { email });
        const userData = apiResponse.data.user;
        
        // Save the token for future API requests in sessionStorage
        if (apiResponse.data.token) {
          sessionStorage.setItem('token', apiResponse.data.token);
          authLogger.debug("Token saved to sessionStorage");
        }
        
        setUser(userData as User);
        await storage.setItem('learnit_user', JSON.stringify(userData));
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`
        });
        return true;
      }
      
      authLogger.warn("Registration failed - unexpected response format");
      toast({
        title: "Registration failed",
        description: "The server returned an unexpected response. Please try again.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      authLogger.error("Error during registration:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please ensure the server is running.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authLogger.info("User logged out");
    setUser(null);
    sessionStorage.removeItem('token');
    toast({
      description: "Logged out successfully."
    });
  };

  return {
    login,
    register,
    logout,
    isLoading
  };
};
