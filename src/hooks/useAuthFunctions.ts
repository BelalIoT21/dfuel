
import { useState } from 'react';
import { User } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { isWeb } from '@/utils/platform';
import { storage } from '@/utils/storage';

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
        
        setUser(userData as User);
        
        // Only store in AsyncStorage for native platforms
        if (!isWeb) {
          try {
            await storage.setItem('learnit_user', JSON.stringify(userData));
            console.log("User data stored in AsyncStorage");
          } catch (storageError) {
            console.error("Error storing user data:", storageError);
          }
        }
        
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
        
        setUser(userData as User);
        
        // Only store in AsyncStorage for native platforms
        if (!isWeb) {
          try {
            await storage.setItem('learnit_user', JSON.stringify(userData));
            console.log("User data stored in AsyncStorage");
          } catch (storageError) {
            console.error("Error storing user data:", storageError);
          }
        }
        
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
    // Clear AsyncStorage only for non-web platforms
    if (!isWeb) {
      storage.removeItem('learnit_user')
        .then(() => console.log("User data removed from AsyncStorage"))
        .catch(error => console.error("Error removing user data:", error));
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
