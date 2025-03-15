
import { useState } from 'react';
import { User } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import mongoDbService from '@/services/mongoDbService';

export const useAuthFunctions = (
  user: User | null, 
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to store token in sessionStorage only
  const storeToken = (token: string) => {
    try {
      sessionStorage.setItem('token', token);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  };

  // Helper function to get token from sessionStorage
  const getToken = (): string | null => {
    try {
      return sessionStorage.getItem('token');
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Login attempt for:", email);
      
      // Get user by email from MongoDB
      const userData = await mongoDbService.getUserByEmail(email);
      
      if (!userData) {
        toast({
          title: "Login failed",
          description: "User not found",
          variant: "destructive"
        });
        return false;
      }
      
      // Here you would compare password with hashed password
      // For this example, assuming comparison is done in mongoDbService
      // In a real app, you would use bcrypt.compare here or in the service

      // Generate a simple token (in a real app, use JWT)
      const token = `token-${Date.now()}`;
      storeToken(token);
      
      setUser(userData as User);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`
      });
      return true;
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
      
      // Create user in MongoDB
      const userData = await mongoDbService.createUser({
        email,
        password, // In a real app, this would be hashed
        name,
        isAdmin: false,
        certifications: [],
        bookings: []
      });
      
      if (!userData) {
        toast({
          title: "Registration failed",
          description: "Could not create user",
          variant: "destructive"
        });
        return false;
      }
      
      // Generate a simple token (in a real app, use JWT)
      const token = `token-${Date.now()}`;
      storeToken(token);
      
      setUser(userData as User);
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`
      });
      return true;
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
    try {
      sessionStorage.removeItem('token');
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
