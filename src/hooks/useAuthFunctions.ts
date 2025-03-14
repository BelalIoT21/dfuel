
import { useState } from 'react';
import { User } from '@/types/database';
import userDatabase from '@/services/userDatabase';
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
      
      // First try API login
      const apiResponse = await apiService.login(email, password);
      
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
      
      // Fallback to local storage if API fails
      console.log("API login failed, trying localStorage");
      const userData = await userDatabase.authenticate(email, password);
      
      if (userData) {
        setUser(userData as User);
        localStorage.setItem('learnit_user', JSON.stringify(userData));
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials.",
          variant: "destructive"
        });
        return false;
      }
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

  const googleLogin = async (googleData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Google login attempt with token:", googleData);
      
      // Try API login with Google token
      const apiResponse = await apiService.googleAuth({
        name: googleData.name,
        email: googleData.email,
        googleId: googleData.sub,
        picture: googleData.picture
      });
      
      if (apiResponse.data) {
        console.log("Google API login successful:", apiResponse.data);
        const userData = apiResponse.data.user;
        
        // Save the token for future API requests
        if (apiResponse.data.token) {
          localStorage.setItem('token', apiResponse.data.token);
        }
        
        setUser(userData as User);
        localStorage.setItem('learnit_user', JSON.stringify(userData));
        toast({
          title: "Login successful",
          description: `Welcome, ${userData.name}!`
        });
        return true;
      }
      
      // Fallback to local storage if API fails
      console.log("API Google login failed, trying localStorage");
      // For local storage we'll just create a new user or find existing one
      const userData = await userDatabase.findUserByEmail(googleData.email) || 
                      await userDatabase.registerUser(
                        googleData.email, 
                        "google-" + Math.random().toString(36).substring(2), 
                        googleData.name
                      );
      
      if (userData) {
        setUser(userData as User);
        localStorage.setItem('learnit_user', JSON.stringify(userData));
        toast({
          title: "Login successful",
          description: `Welcome, ${userData.name}!`
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Could not authenticate with Google.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error during Google login:", error);
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
    googleLogin,
    register,
    logout,
    isLoading
  };
};
