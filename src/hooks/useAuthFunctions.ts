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

  // Helper function to store token with fallback
  const storeToken = (token: string) => {
    try {
      // Use sessionStorage for token
      sessionStorage.setItem('token', token);
      // Also store in localStorage as fallback
      localStorage.setItem('token_fallback', token);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  };

  // Helper function to get token with fallback
  const getToken = (): string | null => {
    try {
      // Try sessionStorage first
      const token = sessionStorage.getItem('token');
      if (token) return token;
      
      // Fallback to localStorage
      return localStorage.getItem('token_fallback');
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Login attempt for:", email);
      
      // API login
      const apiResponse = await apiService.login(email, password);
      
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
        // Save the token with fallback
        if (apiResponse.data.token) {
          storeToken(apiResponse.data.token);
        }
        
        setUser(userData as User);
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`
        });
        return true;
      }
      
      // Try local fallback if API fails
      toast({
        title: "Login failed",
        description: "API unavailable and no fallback credentials found.",
        variant: "destructive"
      });
      return false;
      
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Using fallback if available.",
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
          sessionStorage.setItem('token', apiResponse.data.token);
        }
        
        setUser(userData as User);
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
    setUser(null);
    try {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token_fallback');
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
