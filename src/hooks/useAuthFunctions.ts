
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
      console.log("Login attempt:", email);
  
      // MongoDB login via API
      const response = await apiService.login(email, password);
      console.log("Login response:", response);
  
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
  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Registration attempt:", email);
      
      // Call API to register user
      const response = await apiService.register({ email, password, name: name || '' });
      console.log("Registration response:", response);
      
      // Check for specific error about user already existing
      if (response.error) {
        if (response.error.includes("User already exists") || 
            response.data?.message?.includes("User already exists")) {
          throw new Error("A user with this email already exists");
        }
        throw new Error(response.error);
      }
      
      if (!response.data) {
        throw new Error("Invalid response from server");
      }
      
      // Extract user data and token
      const userData = response.data.data?.user;
      const token = response.data.data?.token;
      
      if (!userData) {
        console.error("Invalid response format:", response.data);
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
        id: String(userData._id),
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
      console.error("Registration error:", error);
      
      // Show a specific toast for user already exists error
      if (error instanceof Error && error.message.includes("user with this email already exists")) {
        toast({
          title: "Email already registered",
          description: "This email address is already in use. Please try logging in instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration failed",
          description: error instanceof Error ? error.message : "Registration failed",
          variant: "destructive"
        });
      }
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
