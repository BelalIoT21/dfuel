import { getEnv } from '../utils/env';
import { useToast } from '../hooks/use-toast';

// Define API URLs - allow fallback paths to help in different environments
const API_URLS = {
  local: 'http://localhost:4000/api',
  development: window.location.origin.includes('localhost') 
    ? 'http://localhost:4000/api' 
    : `${window.location.origin}/api`,
  production: `${window.location.origin}/api`
};

// Get the proper URL based on environment or default to local
const getApiUrl = () => {
  const environment = process.env.NODE_ENV || 'development';
  console.log('Current environment:', environment);
  
  // For safety, check if we're in a browser environment
  if (typeof window === 'undefined') {
    return API_URLS.local;
  }

  // Try to detect if we're running in the same domain as the server
  // This helps with deployment scenarios
  if (environment === 'production') {
    return API_URLS.production;
  }
  
  // In development, prefer localhost:4000
  return API_URLS.local;
};

// Set the base URL and log it for debugging
const BASE_URL = getApiUrl();
console.log('API service configured with base URL:', BASE_URL);

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
      const url = `${BASE_URL}/${endpoint}`;
      const token = localStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (authRequired && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include',
        mode: 'cors',
      };
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(data);
      }
      
      console.log(`Making API request: ${method} ${url}`, data ? `with data: ${JSON.stringify(data)}` : '');
      
      // Check if server is reachable first for non-health endpoints (avoid infinite loop)
      if (!endpoint.includes('health')) {
        try {
          // Make a lightweight fetch to see if the server responds at all
          const pingResponse = await fetch(`${BASE_URL}/health`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-cache',
          });
          
          if (!pingResponse.ok) {
            console.warn(`Server health check failed with status ${pingResponse.status}`);
          } else {
            console.log('Server is reachable');
          }
        } catch (pingError) {
          console.warn('Cannot reach server:', pingError);
          // We continue with the actual request, as the ping is just informational
        }
      }
      
      // Actual API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        options.signal = controller.signal;
        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        
        if (!response) {
          throw new Error('Failed to connect to API endpoint');
        }
        
        // Handle empty responses gracefully
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json') && response.status !== 204) {
          const text = await response.text();
          responseData = text ? JSON.parse(text) : null;
        } else {
          responseData = null;
        }
        
        if (!response.ok) {
          const errorMessage = responseData?.message || `API request failed with status ${response.status}`;
          console.error(`API error for ${method} ${url}: ${response.status} - ${errorMessage}`);
          
          return {
            data: null,
            error: errorMessage,
            status: response.status
          };
        }
        
        return {
          data: responseData,
          error: null,
          status: response.status
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error(`API fetch failed: ${url}`, fetchError);
        
        if (fetchError.name === 'AbortError') {
          return {
            data: null,
            error: 'Request timed out after 10 seconds',
            status: 408
          };
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Don't show toast for health check failures, they're expected when backend is not running
      if (!endpoint.includes('health')) {
        console.error('API error:', error);
      }
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }
  
  // Auth endpoints
  async login(email: string, password: string) {
    console.log('Attempting login via API for:', email);
    console.log('Using base URL:', BASE_URL);
    return this.request<{ token: string, user: any }>(
      'auth/login', 
      'POST', 
      { email, password },
      false
    );
  }
  
  async register(userData: any) {
    console.log('Attempting registration via API for:', userData.email);
    return this.request<{ token: string, user: any }>(
      'auth/register', 
      'POST', 
      userData,
      false
    );
  }
  
  // Health check endpoint
  async checkHealth() {
    console.log('Checking server health at:', `${BASE_URL}/health`);
    return this.request<{ status: string, message: string }>(
      'health',
      'GET',
      undefined,
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
  
  // Additional methods to support databaseService
  async getUserByEmail(email: string) {
    return this.request<any>(`users/email/${email}`, 'GET');
  }
  
  async getUserById(userId: string) {
    return this.request<any>(`users/${userId}`, 'GET');
  }
  
  async updateProfile(userId: string, updates: any) {
    return this.request<{ success: boolean }>(`users/${userId}/profile`, 'PUT', updates);
  }
  
  // Certification endpoints
  async addCertification(userId: string, machineId: string) {
    console.log(`Adding certification for user ${userId}, machine ${machineId}`);
    // Use the correct endpoint format based on the server routes
    return this.request<{ success: boolean }>(
      'certifications', 
      'POST', 
      { userId, machineId }
    );
  }
  
  async removeCertification(userId: string, machineId: string) {
    console.log(`Removing certification for user ${userId}, machine ${machineId}`);
    // The DELETE method might need different handling for the body
    return this.request<{ success: boolean }>(
      'certifications', 
      'DELETE', 
      { userId, machineId }
    );
  }
  
  async getUserCertifications(userId: string) {
    return this.request<string[]>(`certifications/user/${userId}`, 'GET');
  }
  
  async checkCertification(userId: string, machineId: string) {
    return this.request<boolean>(
      'certifications/check', 
      'GET', 
      { userId, machineId }
    );
  }
  
  // Booking endpoints
  async getAllBookings() {
    return this.request<any[]>('bookings/all', 'GET');
  }
  
  async getUserBookings(userId: string) {
    return this.request<any[]>(`bookings`, 'GET');
  }
  
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return this.request<{ success: boolean }>(
      'bookings', 
      'POST', 
      { machineId, date, time }
    );
  }
  
  async updateBookingStatus(bookingId: string, status: string) {
    // For client-generated IDs, ensure they're properly formatted
    console.log(`Updating booking status: ${bookingId} to ${status}`);
    
    // Try endpoint with /:id/status format first
    try {
      const response = await this.request<any>(
        `bookings/${bookingId}/status`, 
        'PUT', 
        { status }
      );
      
      if (!response.error) {
        return response;
      }
    } catch (error) {
      console.log(`Error with standard endpoint: ${error}`);
    }
    
    // Try alternative endpoint if first one fails
    try {
      return await this.request<any>(
        `bookings/update-status`, 
        'PUT', 
        { bookingId, status }
      );
    } catch (error) {
      console.log(`Error with alternative endpoint: ${error}`);
      throw error;
    }
  }
  
  async cancelBooking(bookingId: string) {
    return this.request<any>(`bookings/${bookingId}/cancel`, 'PUT');
  }
  
  // Admin endpoints
  async updateAdminCredentials(email: string, password: string) {
    return this.request<void>(
      'admin/credentials', 
      'PUT', 
      { email, password }
    );
  }
  
  // Dashboard endpoints
  async getAllUsers() {
    return this.request<any[]>('users', 'GET');
  }
  
  async getMachineStatus(machineId: string) {
    return this.request<{ status: string, note?: string }>(`machines/${machineId}/status`, 'GET');
  }
  
  // Safety certification management
  async addSafetyCertification(userId: string) {
    return this.request<{ success: boolean }>(
      'certifications/safety', 
      'POST', 
      { userId }
    );
  }
  
  async removeSafetyCertification(userId: string) {
    return this.request<{ success: boolean }>(
      'certifications/safety', 
      'DELETE', 
      { userId }
    );
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return this.request<{ success: boolean }>(
      `machines/${machineId}/status`, 
      'PUT', 
      { status, maintenanceNote: note }, 
      true
    );
  }
  
  async getAllMachines() {
    return this.request<any[]>('machines', 'GET', undefined, true);
  }
  
  async getMachineById(machineId: string) {
    return this.request<any>(`machines/${machineId}`, 'GET', undefined, true);
  }
  
  async createMachine(machineData: any) {
    return this.request<any>('machines', 'POST', machineData, true);
  }
  
  async updateMachine(machineId: string, machineData: any) {
    return this.request<any>(`machines/${machineId}`, 'PUT', machineData, true);
  }
  
  async deleteMachine(machineId: string) {
    return this.request<{ success: boolean }>(`machines/${machineId}`, 'DELETE', undefined, true);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
