import { getEnv } from '../utils/env';

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
      } else if (authRequired && token) {
        // Fallback to token from localStorage if this.token is not set
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
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
        console.error("Could not connect to server. Using local storage fallback.");
      }
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }
  
  async get<T>(endpoint: string, authRequired: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, authRequired);
  }
  
  async post<T>(endpoint: string, data: any, authRequired: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, authRequired);
  }
  
  async put<T>(endpoint: string, data: any, authRequired: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, authRequired);
  }
  
  async delete<T>(endpoint: string, data?: any, authRequired: boolean = true): Promise<ApiResponse<T>> {
    if (data) {
      return this.request<T>(endpoint, 'DELETE', data, authRequired);
    }
    return this.request<T>(endpoint, 'DELETE', undefined, authRequired);
  }
  
  async login(email: string, password: string) {
    console.log('Attempting login via API for:', email);
    return this.post<{ token: string, user: any }>(
      'auth/login', 
      { email, password },
      false
    );
  }
  
  async register(userData: any) {
    console.log('Attempting registration via API for:', userData.email);
    return this.post<{ token: string, user: any }>(
      'auth/register', 
      userData,
      false
    );
  }
  
  async checkHealth() {
    return this.get<{ status: string, message: string }>(
      'health',
      false
    );
  }
  
  async getCurrentUser() {
    return this.get<any>('users/me');
  }
  
  async updateUser(userId: string, updates: any) {
    return this.put<any>(`users/${userId}`, updates);
  }
  
  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.put<void>(
      `users/${userId}/password`, 
      { currentPassword, newPassword }
    );
  }
  
  async getUserByEmail(email: string) {
    return this.get<any>(`users/email/${email}`);
  }
  
  async getUserById(userId: string) {
    return this.get<any>(`users/${userId}`);
  }
  
  async updateProfile(userId: string, updates: any) {
    return this.put<{ success: boolean }>(`users/${userId}/profile`, updates);
  }
  
  async addCertification(userId: string, certificationId: string) {
    console.log(`Adding certification for user ${userId}, machine ${certificationId}`);
    return this.post<{ success: boolean }>(
      'certifications', 
      { userId, machineId: certificationId }
    );
  }
  
  async removeCertification(userId: string, machineId: string) {
    console.log(`API: Removing certification for user ${userId}, machine ${machineId}`);
    return this.delete<{ success: boolean }>(`certifications/${userId}/${machineId}`);
  }

  async clearCertifications(userId: string) {
    console.log(`Clearing all certifications for user ${userId}`);
    return this.delete<{ success: boolean }>(`certifications/user/${userId}/clear`);
  }
  
  async getUserCertifications(userId: string) {
    return this.get<string[]>(`certifications/user/${userId}`);
  }
  
  async checkCertification(userId: string, machineId: string) {
    return this.get<boolean>(`certifications/check/${userId}/${machineId}`);
  }
  
  async getAllBookings() {
    return this.get<any[]>('bookings/all');
  }
  
  async getUserBookings(userId: string) {
    return this.get<any[]>(`bookings`);
  }
  
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return this.post<{ success: boolean }>(
      'bookings', 
      { machineId, date, time }
    );
  }
  
  async updateBookingStatus(bookingId: string, status: string) {
    console.log(`Updating booking status: ${bookingId} to ${status}`);
    
    try {
      const response = await this.put<any>(
        `bookings/${bookingId}/status`, 
        { status }
      );
      
      if (!response.error) {
        return response;
      }
    } catch (error) {
      console.log(`Error with standard endpoint: ${error}`);
    }
    
    try {
      return await this.put<any>(
        `bookings/update-status`, 
        { bookingId, status }
      );
    } catch (error) {
      console.log(`Error with alternative endpoint: ${error}`);
      throw error;
    }
  }
  
  async cancelBooking(bookingId: string) {
    return this.put<any>(`bookings/${bookingId}/cancel`);
  }
  
  async updateAdminCredentials(email: string, password: string) {
    return this.put<void>(
      'admin/credentials', 
      { email, password }
    );
  }
  
  async getAllUsers() {
    return this.get<any[]>('users');
  }
  
  async getMachineStatus(machineId: string) {
    return this.get<{ status: string, note?: string }>(`machines/${machineId}/status`);
  }
  
  async addSafetyCertification(userId: string) {
    return this.post<{ success: boolean }>(
      'certifications/safety', 
      { userId }
    );
  }
  
  async removeSafetyCertification(userId: string) {
    return this.delete<{ success: boolean }>(
      'certifications/safety', 
      { userId }
    );
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return this.put<{ success: boolean }>(
      `machines/${machineId}/status`, 
      { status, maintenanceNote: note }
    );
  }
  
  async getAllMachines() {
    return this.get<any[]>('machines');
  }
  
  async getMachineById(machineId: string) {
    return this.get<any>(`machines/${machineId}`);
  }
  
  async createMachine(machineData: any) {
    return this.post<any>('machines', machineData);
  }
  
  async updateMachine(machineId: string, machineData: any) {
    return this.put<any>(`machines/${machineId}`, machineData);
  }
  
  async deleteMachine(machineId: string) {
    return this.delete<{ success: boolean }>(`machines/${machineId}`);
  }
}

export const apiService = new ApiService();
