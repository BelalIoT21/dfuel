import { toast } from '@/components/ui/use-toast';
import { apiConnection } from './api/apiConnection';
import { apiLogger } from './api/apiLogger';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiService {
  // Get the current base URL
  getBaseUrl(): string {
    return apiConnection.getBaseUrl();
  }

  // Check if the API server is reachable
  async checkHealth(): Promise<ApiResponse<any>> {
    const connected = await apiConnection.checkConnection();
    
    if (connected) {
      try {
        return await this.request<{ status: string, message: string, database?: any }>(
          'health',
          'GET',
          undefined,
          false
        );
      } catch (error) {
        return {
          data: null,
          error: 'Health check request failed',
          status: 0
        };
      }
    } else {
      return {
        data: null,
        error: 'Cannot connect to API server',
        status: 0
      };
    }
  }

  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any,
    authRequired: boolean = true
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    
    try {
      const url = apiConnection.buildUrl(endpoint);
      
      apiLogger.logRequest(method, url, data);
      
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
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      options.signal = controller.signal;
      
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Handle empty responses gracefully
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json') && response.status !== 204) {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : null;
      } else {
        responseData = null;
      }
      
      apiLogger.logResponse(method, url, response.status, responseData, duration);
      
      if (!response.ok) {
        const errorMessage = responseData?.message || `API request failed with status ${response.status}`;
        
        if (response.status === 404) {
          return {
            data: null,
            error: `Endpoint not found: ${url}. The server might be unavailable or the API endpoint is incorrect.`,
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
      apiLogger.logError(method, endpoint, error);
      
      // Check if it's an AbortError (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          data: null,
          error: 'Request timed out. The server might be unavailable.',
          status: 0
        };
      }
      
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
        status: error instanceof Error && 
               (error.message.includes('Failed to fetch') || 
                error.message.includes('Network Error')) ? 0 : 500
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
  
  // User endpoints
  async getCurrentUser() {
    console.log("Fetching current user with auth token");
    return this.request<{ user: any }>('auth/me', 'GET');
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
    return this.request<{ success: boolean }>(
      'certifications', 
      'POST', 
      { userId, machineId }
    );
  }
  
  async removeCertification(userId: string, machineId: string) {
    console.log(`Removing certification for user ${userId}, machine ${machineId}`);
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
    console.log(`Updating booking status: ${bookingId} to ${status}`);
    
    // Try first endpoint format (/:id/status)
    try {
      const response = await this.request<any>(
        `bookings/${bookingId}/status`, 
        'PUT', 
        { status }
      );
      
      if (!response.error) {
        console.log("Successfully updated booking status via primary endpoint");
        return response;
      }
      
      console.log(`Primary endpoint failed: ${response.error}`);
    } catch (error) {
      console.log(`Error with standard endpoint: ${error}`);
    }
    
    // Try alternative endpoint (/update-status)
    try {
      const alternativeResponse = await this.request<any>(
        `bookings/update-status`, 
        'PUT', 
        { bookingId, status }
      );
      
      if (!alternativeResponse.error) {
        console.log("Successfully updated booking status via alternative endpoint");
        return alternativeResponse;
      }
      
      console.log(`Alternative endpoint failed: ${alternativeResponse.error}`);
    } catch (error) {
      console.log(`Error with alternative endpoint: ${error}`);
    }
    
    // Both endpoints failed, try direct MongoDB operation if not in web environment
    if (typeof window === 'undefined' || !window.isSecureContext) {
      try {
        // This would be a direct DB call in Node.js environment
        console.log("Attempting direct MongoDB update (server-side only)");
        // This would be implemented differently in a true server environment
      } catch (dbError) {
        console.log(`Direct MongoDB update failed: ${dbError}`);
      }
    }
    
    // If all attempts fail, return error
    return {
      data: null,
      error: "Failed to update booking status after multiple attempts",
      status: 500
    };
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
  
  // Storage-related API methods
  async getStorageItem(key: string) {
    return this.request<{ value: string }>(
      `storage/${key}`,
      'GET'
    );
  }
  
  async setStorageItem(key: string, value: string) {
    return this.request<{ success: boolean }>(
      'storage',
      'POST',
      { key, value }
    );
  }
  
  async removeStorageItem(key: string) {
    return this.request<{ success: boolean }>(
      `storage/${key}`,
      'DELETE'
    );
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
