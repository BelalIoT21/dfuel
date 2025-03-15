import { getEnv } from '../utils/env';
import { useToast } from '../hooks/use-toast';

// Configuration for API endpoints
// When running in production or with API_URL env set, use that value
// Otherwise, try multiple options with a preference for the local server
const API_URL = (() => {
  // Check for environment variables first
  const envApiUrl = getEnv('API_URL');
  if (envApiUrl) return envApiUrl;
  
  // When running in development, try connecting to the server
  // Default to localhost:4000 which is the typical server port
  return 'http://localhost:4000/api';
})();

// Export for debugging
console.log('API service configured with base URL:', API_URL);
let BASE_URL = API_URL;

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
        mode: 'cors', // Add explicit CORS mode
      };
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(data);
      }
      
      console.log(`Making API request: ${method} ${url}`, data ? `with data: ${JSON.stringify(data)}` : '');
      
      // Try the request
      let response;
      try {
        response = await fetch(url, options);
      } catch (fetchError) {
        console.error(`API fetch failed: ${url}`, fetchError);
        
        // For health check endpoints, provide more debugging info
        if (endpoint.includes('health')) {
          console.log('Server connection issue - please verify:');
          console.log('1. Server is running on port 4000');
          console.log('2. No CORS issues (check browser console)');
          console.log('3. Network connectivity between client and server');
        }
        
        throw fetchError;
      }
      
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
        
        if (response.status === 404) {
          return {
            data: null,
            error: `Endpoint not found: ${endpoint}. The server might be unavailable or the API endpoint is incorrect.`,
            status: response.status
          };
        }
        
        throw new Error(errorMessage);
      }
      
      return {
        data: responseData,
        error: null,
        status: response.status
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Don't show toast for health check failures, they're expected when backend is not running
      if (!endpoint.includes('health')) {
        // Don't use the hook directly here - it's not inside a component
        console.error('API error - would show toast in component');
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
