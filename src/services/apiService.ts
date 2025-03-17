
import { getEnv } from '../utils/env';
import { useToast } from '../hooks/use-toast';

// Try to connect to local API first, but have a fallback to relative path
const API_ENDPOINTS = ['http://localhost:4000/api', '/api'];
let currentEndpointIndex = 0;
let BASE_URL = API_ENDPOINTS[currentEndpointIndex];

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number; 
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async switchEndpoint() {
    currentEndpointIndex = (currentEndpointIndex + 1) % API_ENDPOINTS.length;
    BASE_URL = API_ENDPOINTS[currentEndpointIndex];
    console.log(`Switching to API endpoint: ${BASE_URL}`);
  }

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
      
      if (authRequired && this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      console.log(`Making API request: ${method} ${url}`, data ? `with data: ${JSON.stringify(data)}` : '');
      
      // Try with retry and endpoint switching logic
      let response;
      let retryCount = 0;
      const maxRetries = API_ENDPOINTS.length;
      
      while (retryCount < maxRetries) {
        try {
          response = await fetch(url, options);
          break; // If successful, exit the retry loop
        } catch (fetchError) {
          console.warn(`API fetch failed (attempt ${retryCount + 1}/${maxRetries}): ${url}`);
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Try a different endpoint before giving up
            this.switchEndpoint();
            const newUrl = `${BASE_URL}/${endpoint}`;
            console.log(`Retrying with endpoint: ${newUrl}`);
          } else {
            throw fetchError; // All retries failed, propagate the error
          }
        }
      }
      
      if (!response) {
        throw new Error('Failed to connect to any API endpoints');
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
        const { toast } = useToast();
        toast({
          title: `API Error`,
          description: "Could not connect to server. Using local storage fallback.",
          variant: 'destructive'
        });
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
  
  // Updated removeCertification with proper endpoint
  async removeCertification(userId: string, certificationId: string) {
    console.log(`API: Removing certification ${certificationId} for user ${userId}`);
    return this.request<{ success: boolean }>(
      `certifications/${userId}/${certificationId}`, 
      'DELETE'
    );
  }

  // Add clearCertifications method
  async clearCertifications(userId: string) {
    console.log(`Clearing all certifications for user ${userId}`);
    return this.request<{ success: boolean }>(
      `certifications/clear/${userId}`,
      'DELETE'
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
