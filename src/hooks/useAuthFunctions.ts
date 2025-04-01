
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
      console.log("Login attempt for:", email);
  
      // MongoDB login via API
      console.log("Sending login request to API...");
      const apiResponse = await apiService.login(email, password);
      console.log("API login response:", JSON.stringify(apiResponse, null, 2));
  
      // Handle API errors
      if (apiResponse.error) {
        console.error("API login error:", apiResponse.error);
        if (apiResponse.status === 404) {
          throw new Error("Server endpoint not found. Please check the server is running.");
        } else if (apiResponse.status === 401) {
          throw new Error("Invalid email or password.");
        } else {
          throw new Error(apiResponse.error);
        }
      }
  
      // Validate response data - handle different response structures
      if (!apiResponse.data) {
        console.error("API response is missing data:", apiResponse);
        throw new Error("The server returned incomplete data. Please try again.");
      }

      // Assuming the standard API response follows the LoginResponse interface from server code
      // Which returns data: { user: {...}, token: "..." }
      // But handle other formats too
      
      let userData;
      let token;
      
      // Try to extract user data from various possible response structures
      if (apiResponse.data.user) {
        userData = apiResponse.data.user;
      } else if (apiResponse.data.data?.user) {
        userData = apiResponse.data.data.user;
      } else if (apiResponse.data._id || apiResponse.data.id) {
        userData = apiResponse.data;
      }
      
      // Try to extract token from various possible response structures
      if (apiResponse.data.token) {
        token = apiResponse.data.token;
      } else if (apiResponse.data.data?.token) {
        token = apiResponse.data.data.token;
      }
      
      // Validate extracted data
      if (!userData) {
        console.error("Could not extract user data from response:", apiResponse);
        throw new Error("Invalid response format from server - missing user data");
      }
      
      if (!token) {
        console.error("Could not extract token from response:", apiResponse);
        throw new Error("Invalid response format from server - missing token");
      }
  
      // Normalize user data for consistency
      const normalizedUser = {
        id: String(userData._id || userData.id),
        name: userData.name || 'User',
        email: userData.email,
        isAdmin: Boolean(userData.isAdmin),
        certifications: Array.isArray(userData.certifications) 
          ? userData.certifications 
          : (userData.certifications ? [String(userData.certifications)] : [])
      };
  
      console.log("Setting user data in state:", normalizedUser);
  
      // Save token in localStorage for auth persistence
      localStorage.setItem('token', token);
      apiService.setToken(token);
  
      // Update the user state
      setUser(normalizedUser as User);
  
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${normalizedUser.name}!`
      });
  
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive"
      });
      throw error; // Re-throw to be caught by the login form
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
      console.log("Registration attempt for:", email);
  
      // MongoDB registration via API
      console.log("Sending registration request to API...");
      const apiResponse = await apiService.register({ email, password, name });
      console.log("API registration response:", JSON.stringify(apiResponse, null, 2));
  
      // Handle API errors
      if (apiResponse.error) {
        console.error("API registration error:", apiResponse.error);
        toast({
          title: "Registration failed",
          description: apiResponse.error,
          variant: "destructive"
        });
        return false;
      }
  
      // Extract data from the response structure
      let userData = null;
      let token = null;
      
      // Check various possible response structures
      if (apiResponse.data?.data?.user) {
        // Most common format from our server
        userData = apiResponse.data.data.user;
        token = apiResponse.data.data.token;
      } else if (apiResponse.data?.user) {
        // Alternative format
        userData = apiResponse.data.user;
        token = apiResponse.data.token;
      } else if (apiResponse.data?._id || apiResponse.data?.id) {
        // Direct user object in data
        userData = apiResponse.data;
        token = apiResponse.data.token;
      }
      
      console.log("Extracted user data:", userData);
      console.log("Extracted token:", token);
  
      // Validate required fields
      if (!userData || !userData.email) {
        console.error("API response is missing required fields:", apiResponse);
        toast({
          title: "Registration failed",
          description: "The server returned incomplete data. Please try again.",
          variant: "destructive"
        });
        return false;
      }
  
      // If we're registering from the admin interface, we don't want to set the user or token
      // Just return success so the admin can stay logged in
      if (user && user.isAdmin) {
        console.log("Admin is adding a user, registration successful");
        return true;
      }
  
      // For normal registration, proceed with setting token and user
      if (token) {
        // Save token in localStorage for auth persistence
        localStorage.setItem('token', token);
        apiService.setToken(token);
      } else {
        console.warn("No token received from registration, user may need to login");
      }
  
      // Normalize user data
      const normalizedUser = {
        id: String(userData._id || userData.id),
        name: userData.name || name || 'User',
        email: userData.email,
        isAdmin: Boolean(userData.isAdmin),
        certifications: Array.isArray(userData.certifications) 
          ? userData.certifications 
          : (userData.certifications ? [String(userData.certifications)] : [])
      };
  
      console.log("Setting user data from registration:", normalizedUser);
      
      // Only set user in state if we're not in an admin adding a user context
      setUser(normalizedUser as User);
  
      toast({
        title: "Registration successful",
        description: `User ${normalizedUser.name} created successfully!`
      });
  
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
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
      console.log("Logging out user from MongoDB session");
      
      try {
        // Make a request to the server to handle server-side logout
        await apiService.logout();
        console.log("Server-side logout successful");
      } catch (error) {
        // Even if server-side logout fails, continue with client-side logout
        console.warn("Server-side logout failed, proceeding with client-side logout", error);
      }
      
      // Clear user state
      setUser(null);

      // Remove auth data from localStorage
      localStorage.removeItem('token');

      // Clear the token from API service
      apiService.setToken(null);

      // Show success message
      toast({
        description: "Logged out successfully."
      });
      
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout error",
        description: "There was an error logging out. Please try again.",
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
