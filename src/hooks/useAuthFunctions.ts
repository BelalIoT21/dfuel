
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
  
      // MongoDB login via API
      const response = await apiService.login(email, password);
  
      if (response.error) {
        throw new Error(response.error);
      }
  
      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      // Extract user data and token
      const userData = response.data.data?.user || response.data.user;
      const token = response.data.data?.token || response.data.token;
      
      if (!userData || !token) {
        throw new Error("Invalid response format from server");
      }
  
      // Normalize user data
      const normalizedUser = {
        id: String(userData._id || userData.id),
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
  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call API to register user
      const response = await apiService.register({ email, password, name });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.data) {
        throw new Error("Invalid response from server");
      }
      
      // Extract user data and token
      const userData = response.data.data?.user || response.data.user;
      const token = response.data.data?.token || response.data.token;
      
      if (!userData) {
        throw new Error("Invalid response format from server");
      }
      
      // If we're registering from admin interface, just return success
      if (user && user.isAdmin) {
        toast({
          title: "Registration successful",
          description: `User ${userData.name || name || 'User'} created successfully!`
        });
        return true;
      }
      
      // For normal registration, set token and user
      if (token) {
        localStorage.setItem('token', token);
        apiService.setToken(token);
      }
      
      // Normalize user data
      const normalizedUser = {
        id: String(userData._id || userData.id),
        name: userData.name || name || 'User',
        email: userData.email,
        isAdmin: Boolean(userData.isAdmin),
        certifications: Array.isArray(userData.certifications) ? userData.certifications : []
      };
      
      // Update user state
      setUser(normalizedUser as User);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${normalizedUser.name}!`
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
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
