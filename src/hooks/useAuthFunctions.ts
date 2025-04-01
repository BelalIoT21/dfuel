
import { apiService } from '../services/apiService';
import { toast } from '../components/ui/use-toast';
import { User } from '@/types/database';
import { useState } from 'react';

// Function to handle user login
export const login = async (email: string, password: string) => {
  try {
    console.log('Login attempt for:', email);
    
    // Make sure we're using the correct path format: auth/login (not authlogin)
    const response = await apiService.request({
      method: 'POST',
      url: 'auth/login', // This will be properly formatted by apiService
      data: { email, password }
    });
    
    console.log('API login response:', response);
    
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error: any) {
    console.error('API login error:', error.message);
    
    // Extract meaningful error message
    let errorMessage = 'Authentication failed';
    
    if (error.response) {
      errorMessage = error.response.data?.message || 'Server error';
    } else if (error.message === 'Request failed with status code 404') {
      errorMessage = 'API endpoint not found. Please check server configuration.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    toast({
      title: 'Login Error',
      description: errorMessage,
      variant: 'destructive'
    });
    
    throw error;
  }
};

// Function to handle user registration
export const register = async (email: string, password: string, name: string) => {
  try {
    console.log('Registration attempt for:', email);
    
    const response = await apiService.request({
      method: 'POST',
      url: 'auth/register',
      data: { email, password, name }
    });
    
    console.log('API register response:', response);
    
    if (response.status === 201 && response.data) {
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created.',
      });
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Registration failed');
    }
  } catch (error: any) {
    console.error('API register error:', error);
    
    let errorMessage = 'Registration failed';
    
    if (error.response) {
      errorMessage = error.response.data?.message || 'Server error';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    toast({
      title: 'Registration Error',
      description: errorMessage,
      variant: 'destructive'
    });
    
    throw error;
  }
};

// Function to handle user logout
export const logout = async () => {
  try {
    console.log('Logout attempt');
    
    const response = await apiService.request({
      method: 'POST',
      url: 'auth/logout',
    });
    
    console.log('API logout response:', response);
    
    if (response.status === 200) {
      toast({
        title: 'Logout Successful',
        description: 'You have been successfully logged out.',
      });
      return true;
    } else {
      throw new Error(response.data?.message || 'Logout failed');
    }
  } catch (error: any) {
    console.error('API logout error:', error);
    
    let errorMessage = 'Logout failed';
    
    if (error.response) {
      errorMessage = error.response.data?.message || 'Server error';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    toast({
      title: 'Logout Error',
      description: errorMessage,
      variant: 'destructive'
    });
    
    throw error;
  }
};

// Create a custom hook that returns the auth functions
export const useAuthFunctions = (user: User | null, setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  // Create the login function with user state management
  const loginFn = async (email: string, password: string) => {
    try {
      const data = await login(email, password);
      
      console.log('Login successful, setting user state:', data);
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        apiService.setToken?.(data.token);
        
        const userData = {
          ...data.user,
          id: data.user._id || data.user.id
        };
        
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login function error:', error);
      return false;
    }
  };
  
  // Create the registration function with user state management
  const registerFn = async (email: string, password: string, name: string) => {
    try {
      const data = await register(email, password, name);
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        apiService.setToken?.(data.token);
        
        const userData = {
          ...data.user,
          id: data.user._id || data.user.id
        };
        
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register function error:', error);
      return false;
    }
  };
  
  // Create the logout function with user state management
  const logoutFn = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      apiService.setToken?.(null);
      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout function error:', error);
      // Even if the API call fails, we should remove the token and user state
      localStorage.removeItem('token');
      apiService.setToken?.(null);
      setUser(null);
      return false;
    }
  };
  
  return {
    login: loginFn,
    register: registerFn,
    logout: logoutFn
  };
};
