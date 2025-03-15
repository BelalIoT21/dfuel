import { getEnv } from '../utils/env';
import { toast } from '../components/ui/use-toast';

const BASE_URL = 'http://localhost:4000/api'; // Using localhost:4000 explicitly

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  success?: boolean;
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
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      console.log(`Making API request: ${method} ${url}`, 
        data ? `with data: ${JSON.stringify(data)}` : '',
        authRequired ? (token ? 'with token' : 'token required but not found') : 'no auth required');
      
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
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      
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
        
        // If we get 401 and we have a token, it might be expired
        if (response.status === 401 && token && authRequired) {
          console.warn('Token might be expired, consider clearing it');
          // We don't automatically clear the token here to avoid logout loops
        }
        
        if (response.status === 404) {
          return {
            data: null,
            error: `Endpoint not found: ${url}. The server might be unavailable or the API endpoint is incorrect.`,
            status: response.status,
            success: false
          };
        }
        
        throw new Error(errorMessage);
      }
      
      return {
        data: responseData,
        error: null,
        status: response.status,
        success: true
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Don't show toast for health check failures, they're expected when backend is not running
      if (!endpoint.includes('health')) {
        toast({
          title: `API Error (${endpoint})`,
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: 'destructive'
        });
      }
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        success: false
      };
    }
  }
  
  // Auth endpoints
  async login(email: string, password: string) {
    console.log('Attempting login via API for:', email);
    return this.request<{ token: string, user: any }>(
      'auth/login', 
      'POST', 
      { email, password },
      false // No auth required for login
    );
  }
  
  async register(userData: any) {
    console.log('Attempting registration via API for:', userData.email);
    return this.request<{ token: string, user: any }>(
      'auth/register', 
      'POST', 
      userData,
      false // No auth required for registration
    );
  }
  
  // Health check endpoint
  async checkHealth() {
    try {
      console.log('Checking server health...');
      const response = await this.request<{ status: string, message: string }>(
        'health',
        'GET',
        undefined,
        false // No auth required for health check
      );
      
      console.log('Health check response:', response);
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        success: false
      };
    }
  }
  
  // New ping method for simple connectivity testing
  async ping() {
    try {
      console.log('Pinging server...');
      const response = await this.request<{ pong: boolean }>(
        'health/ping',
        'GET',
        undefined,
        false // No auth required for ping
      );
      
      console.log('Ping response:', response);
      return response;
    } catch (error) {
      console.error('Ping failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        success: false
      };
    }
  }
  
  // User endpoints
  async getCurrentUser() {
    console.log('Getting current user from API...');
    return this.request<any>('auth/me', 'GET');
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
  
  // User count and users list
  async getAllUsers() {
    console.log('Getting all users from API...');
    return this.request<any[]>('users', 'GET');
  }
  
  async getUserCount() {
    console.log('Getting user count from API...');
    return this.request<{ count: number }>('users/count', 'GET', undefined, false);
  }
  
  // Machine endpoints
  async getAllMachines() {
    return this.request<any[]>('machines', 'GET', undefined, false);
  }
  
  async getMachineById(machineId: string) {
    return this.request<any>(`machines/${machineId}`, 'GET', undefined, false);
  }
  
  async getMachineStatus(machineId: string) {
    return this.request<{ status: string, note?: string }>(`machines/${machineId}/status`, 'GET', undefined, false);
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return this.request<{ success: boolean }>(
      `machines/${machineId}/status`, 
      'PUT', 
      { status, note }
    );
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
