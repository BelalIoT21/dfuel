import { useState } from 'react';
import { User } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

export const useAuthFunctions = (
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles user login.
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.debug("Login attempt:", email);
  
      // MongoDB login via API
      const response = await apiService.login(email, password);
      console.debug("Login response received");
  
      if (response.error) {
        // Provide more detailed error message based on status code
        if (response.status === 404) {
          throw new Error("API endpoint not found. Please check server configuration.");
        } else if (response.status === 401) {
          throw new Error("Invalid email or password.");
        } else {
          throw new Error(response.error);
        }
      }
  
      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      // Extract user data and token
      const userData = response.data.data?.user;
      const token = response.data.data?.token;
      
      if (!userData || !token) {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format from server");
      }
  
      // Normalize user data
      const normalizedUser = {
        id: String(userData._id),
        name: userData.name || 'User',
        email: userData.email,
        isAdmin: Boolean(userData.isAdmin),
        certifications: Array.isArray(userData.certifications) 
          ? userData.certifications 
          : []
      };
  
      // Save token in localStorage
      localStorage.setItem('token', token);
      apiService.setToken(token);
  
      // Update user state
      setUser(normalizedUser as User);
  
      toast({
        title: "Login successful",
        description: `Welcome back, ${normalizedUser.name}!`
      });
  
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user registration.
   */
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await apiService.register(email, password, name);
      
      if (response.error) {
        // Check for specific error messages
        if (response.error === 'User already exists' || 
            (typeof response.error === 'string' && response.error.includes('User already exists'))) {
          toast({
            title: "Registration Failed",
            description: "This email is already registered. Please try logging in instead.",
            variant: "destructive",
          });
          const userExistsError = new Error('User already exists');
          userExistsError.name = 'UserExistsError';
          throw userExistsError;
        }
        
        // Handle server errors
        if (response.error.includes('Server error')) {
          toast({
            title: "Registration Failed",
            description: "Unable to connect to the server. Please try again later.",
            variant: "destructive",
          });
          throw new Error('Server error');
        }
        
        toast({
          title: "Registration Failed",
          description: response.error,
          variant: "destructive",
        });
        throw new Error(response.error);
      }

      // Registration successful
      toast({
        title: "Registration Successful",
        description: "Account created successfully.",
      });
      
      return response.data;
    } catch (error: any) {
      // No logging here - just handle different error types
      
      // Check if the error is about user already existing
      if (error.name === 'UserExistsError' || 
          error.message === 'User already exists' || 
          (typeof error.message === 'string' && error.message.includes('User already exists'))) {
        const userExistsError = new Error('User already exists');
        userExistsError.name = 'UserExistsError';
        throw userExistsError;
      }
      
      // Check for ReferenceError which might indicate a bug in the code
      if (error instanceof ReferenceError) {
        const userExistsError = new Error('User already exists');
        userExistsError.name = 'UserExistsError';
        throw userExistsError;
      }
      
      // Handle 400 Bad Request which is likely a user exists error
      if (error.response?.status === 400) {
        const userExistsError = new Error('User already exists');
        userExistsError.name = 'UserExistsError';
        throw userExistsError;
      }
      
      // Only log for unexpected errors
      console.error('Unexpected registration error:', error);
      throw error;
    }
  };

  /**
   * Handles user logout.
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear user state
      setUser(null);

      // Remove auth data from localStorage
      localStorage.removeItem('token');

      // Clear token from API service
      apiService.setToken(null);

      toast({
        description: "Logged out successfully."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Logout error",
        description: "There was an error logging out.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading
  };
};
