
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
  
      // MongoDB-only login via API, no localStorage for user data
      console.log("Sending login request to API...");
      const apiResponse = await apiService.login(email, password);
      console.log("API login response:", JSON.stringify(apiResponse, null, 2));
  
      // Handle API errors
      if (apiResponse.error) {
        console.error("API login error:", apiResponse.error);
        toast({
          title: "Login failed",
          description: apiResponse.error,
          variant: "destructive"
        });
        return false;
      }
  
      // Validate the response structure
      const nestedData = apiResponse.data?.data; // Access the nested `data` object
      const userData = nestedData?.user;
      const token = nestedData?.token;
  
      if (!userData || !userData._id || !userData.name || !userData.email || !token) {
        console.error("API response is missing required fields:", apiResponse);
        toast({
          title: "Login failed",
          description: "The server returned incomplete data. Please try again.",
          variant: "destructive"
        });
        return false;
      }
  
      // Normalize user data (map `_id` to `id` for consistency)
      const normalizedUser = {
        ...userData,
        id: String(userData._id), // Convert _id to string if necessary
      };
  
      console.log("Setting user data in state:", normalizedUser);
  
      // Save only the token in localStorage for auth persistence
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
        description: "An unexpected error occurred. MongoDB server may be unavailable.",
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
      console.log("Registration attempt for:", email);
  
      // MongoDB-only registration via API
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
      const token = userData?.token; // Get token from user object
  
      // Validate required fields
      if (!userData?._id || !userData?.email || !token) {
        console.error("API response is missing required fields:", apiResponse);
        toast({
          title: "Registration failed",
          description: "The MongoDB server returned incomplete data. Please try again.",
          variant: "destructive"
        });
        return false;
      }
  
      // Normalize user data - EXPLICITLY set empty certifications array
      const normalizedUser = {
        id: String(userData._id),
        name: userData.name || name || 'User',
        email: userData.email,
        isAdmin: userData.isAdmin || false,
        certifications: [] // Explicitly set to empty array to ensure no default certifications
      };
  
      console.log("Setting user data from MongoDB:", normalizedUser);
  
      // Save token only, no user data in localStorage
      localStorage.setItem('token', token);
      apiService.setToken(token);
      setUser(normalizedUser);
  
      toast({
        title: "Registration successful",
        description: `Welcome, ${normalizedUser.name}!`
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
  const logout = () => {
    console.log("Logging out user from MongoDB session");

    // Clear user state
    setUser(null);

    // Remove token only - no other localStorage usage
    localStorage.removeItem('token');

    // Clear the token from API service
    apiService.setToken(null);

    // Show success message
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
