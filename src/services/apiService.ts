import { getEnv } from '../utils/env';
import { toast } from '../components/ui/use-toast';

/**
 * This service provides functions to interact with the backend API.
 * For now, it simulates a real backend by using local storage,
 * but in a production app, this would make real HTTP requests.
 */

const BASE_URL = getEnv('API_BASE_URL');

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any,
    authRequired: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      // For demo purposes, we'll simulate API responses
      // In a real app, this would be a fetch or axios request
      
      console.log(`API ${method} request to ${endpoint}`, data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get data from localStorage to simulate database
      const storageKey = endpoint.split('/')[0];
      const storedData = localStorage.getItem(storageKey);
      
      // Simulate different API operations
      if (method === 'GET') {
        // Return stored data or empty array
        return {
          data: (storedData ? JSON.parse(storedData) : []) as T,
          error: null,
          status: 200
        };
      } else if (method === 'POST' || method === 'PUT') {
        // Store the data
        localStorage.setItem(storageKey, JSON.stringify(data));
        return {
          data: data as T,
          error: null,
          status: 201
        };
      } else if (method === 'DELETE') {
        // Remove the data
        localStorage.removeItem(storageKey);
        return {
          data: null,
          error: null,
          status: 204
        };
      }
      
      // Default response
      return {
        data: null,
        error: 'Method not implemented',
        status: 501
      };
    } catch (error) {
      console.error('API request failed:', error);
      toast({
        title: 'API Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }
  
  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string, user: any }>(
      'auth/login', 
      'POST', 
      { email, password },
      false
    );
  }
  
  async register(userData: any) {
    return this.request<{ token: string, user: any }>(
      'auth/register', 
      'POST', 
      userData,
      false
    );
  }
  
  // User endpoints
  async getCurrentUser() {
    return this.request<any>('users/me', 'GET');
  }
  
  async updateUser(userId: string, updates: any) {
    return this.request<any>(`users/${userId}`, 'PUT', updates);
  }
  
  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.request<void>(
      `users/${userId}/password`, 
      'PUT', 
      { currentPassword, newPassword }
    );
  }
  
  // Admin endpoints
  async updateAdminCredentials(email: string, password: string) {
    return this.request<void>(
      'admin/credentials', 
      'PUT', 
      { email, password }
    );
  }
  
  // Other endpoints as needed
}

// Create and export a singleton instance
export const apiService = new ApiService();
