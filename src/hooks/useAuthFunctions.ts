
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Login attempt for:", email);
      
      // API login
      console.log("Sending login request to API...");
      const apiResponse = await apiService.login(email, password);
      console.log("API login response:", apiResponse);
      
      if (apiResponse.error) {
        console.error("API login error:", apiResponse.error);
        toast({
          title: "Login failed",
          description: apiResponse.error,
          variant: "destructive"
        });
        return false;
      }
      
      if (apiResponse.data) {
        console.log("API login successful:", apiResponse.data);
        const userData = apiResponse.data.user;
        
        // Save the token for future API requests
        if (apiResponse.data.token) {
          console.log("Saving token to localStorage");
          localStorage.setItem('token', apiResponse.data.token);
        } else {
          console.error("No token received from API");
        }
        
        // Transform MongoDB _id to id if needed
        const normalizedUser = {
          ...userData,
          id: userData._id || userData.id
        };
        
        console.log("Setting user data in state:", normalizedUser);
        setUser(normalizedUser as User);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${normalizedUser.name}!`
        });
        
        return true;
      }
      
      // If we get here, the API returned no data and no error, which is odd
      toast({
        title: "Login failed",
        description: "The server returned an unexpected response. Please try again.",
        variant: "destructive"
      });
      return false;
      
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Server may be unavailable.",
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
      console.log("Registration attempt for:", email);
      
      // API registration
      const apiResponse = await apiService.register({ email, password, name });
      
      if (apiResponse.error) {
        console.error("API registration error:", apiResponse.error);
        toast({
          title: "Registration failed",
          description: apiResponse.error,
          variant: "destructive"
        });
        return false;
      }
      
      if (apiResponse.data) {
        console.log("API registration successful:", apiResponse.data);
        const userData = apiResponse.data.user;
        
        // Save the token for future API requests
        if (apiResponse.data.token) {
          console.log("Saving token to localStorage");
          localStorage.setItem('token', apiResponse.data.token);
        } else {
          console.error("No token received from API");
        }
        
        // Transform MongoDB _id to id if needed
        const normalizedUser = {
          ...userData,
          id: userData._id || userData.id
        };
        
        console.log("Setting user data in state after registration:", normalizedUser);
        setUser(normalizedUser as User);
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`
        });
        return true;
      }
      
      toast({
        title: "Registration failed",
        description: "The server returned an unexpected response. Please try again.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Server may be unavailable.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out user");
    setUser(null);
    // Remove all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
