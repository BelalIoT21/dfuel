
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
        throw new Error(apiResponse.error);
      }
  
      // Validate the response structure
      const nestedData = apiResponse.data?.data; // Access the nested `data` object
      const userData = nestedData?.user;
      const token = nestedData?.token;
  
      if (!userData || !userData._id || !userData.name || !userData.email || !token) {
        console.error("API response is missing required fields:", apiResponse);
        throw new Error("The server returned incomplete data. Please try again.");
      }
  
      // Ensure certifications are properly set and always an array
      if (!userData.certifications) {
        userData.certifications = [];
      } else if (!Array.isArray(userData.certifications)) {
        // Convert to array if it's not already
        userData.certifications = [String(userData.certifications)];
      }
      
      console.log("User certifications from API:", userData.certifications);
  
      // Normalize user data (map `_id` to `id` for consistency)
      const normalizedUser = {
        ...userData,
        id: String(userData._id), // Convert _id to string if necessary
        certifications: userData.certifications || []
      };
  
      console.log("Setting user data in state:", normalizedUser);
  
      // Save token in localStorage for auth persistence
      console.log("Saving token to localStorage");
      localStorage.setItem('token', token);
      apiService.setToken(token); // Set token in API service
  
      setUser(normalizedUser as User); // Update the user state
  
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
      const responseData = apiResponse.data?.data; // Access the nested data
      const userData = responseData?.user; // Directly access user object
      const token = responseData?.token || userData?.token; // Get token from user object or directly
      
      console.log("MongoDB response data:", responseData);
      console.log("MongoDB user data:", userData);
      console.log("MongoDB token:", token);
  
      // Validate required fields
      if (!userData || !userData._id || !userData.email) {
        console.error("API response is missing required fields:", apiResponse);
        toast({
          title: "Registration failed",
          description: "The MongoDB server returned incomplete data. Please try again.",
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
        id: String(userData._id),
        name: userData.name || name || 'User',
        email: userData.email,
        isAdmin: userData.isAdmin || false,
        certifications: userData.certifications || [] 
      };
  
      console.log("Setting user data from MongoDB:", normalizedUser);
      
      // Only set user in state if we're not in an admin adding a user context
      setUser(normalizedUser as User);
  
      toast({
        title: "Registration successful",
        description: `User ${normalizedUser.name} created successfully!`
      });
  
      return true;
    } catch (error) {
      console.error("MongoDB registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred with MongoDB. Please try again.",
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
