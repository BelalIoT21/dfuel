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
      
      // Try API login
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
        // Save the token for future API requests
        if (apiResponse.data.token) {
          localStorage.setItem('token', apiResponse.data.token);
        }
        
        setUser(userData as User);
        localStorage.setItem('learnit_user', JSON.stringify(userData));
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`
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
        description: "An unexpected error occurred.",
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
      
      // First try API registration
      const apiResponse = await apiService.register({ email, password, name });
      
      if (apiResponse.data) {
        console.log("API registration successful:", apiResponse.data);
        const userData = apiResponse.data.user;
        
        // Save the token for future API requests
        if (apiResponse.data.token) {
          localStorage.setItem('token', apiResponse.data.token);
        }
        
        setUser(userData as User);
        localStorage.setItem('learnit_user', JSON.stringify(userData));
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`
        });
        return true;
      }
      
      // Fallback to local storage if API fails
      console.log("API registration failed, trying localStorage");
      const userData = await userDatabase.registerUser(email, password, name);
      
      if (userData) {
        setUser(userData as User);
        localStorage.setItem('learnit_user', JSON.stringify(userData));
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`
        });
        return true;
      } else {
        toast({
          title: "Registration failed",
          description: "Email already in use.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('learnit_user');
    localStorage.removeItem('token');
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
