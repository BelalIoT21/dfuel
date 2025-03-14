
import { useState } from 'react';
import { User } from '@/types/database';
import userDatabase from '@/services/userDatabase';
import { useToast } from '@/hooks/use-toast';

export const useAuthFunctions = (
  user: User | null, 
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
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
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
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
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('learnit_user');
    toast({
      description: "Logged out successfully."
    });
  };

  return {
    login,
    register,
    logout
  };
};
