import { getEnv } from '../utils/env';
import { toast } from '../components/ui/use-toast';

// Define the base URL for the API, with a fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

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
      const url = `${API_BASE_URL}/${endpoint}`;
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
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      console.log(`Making API request: ${method} ${url}`, data ? 'with data' : '');
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
        const errorMessage = responseData?.message || 'API request failed';
        console.error(`API error: ${response.status} - ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      return {
        data: responseData,
        error: null,
        status: response.status
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Don't show toast for health check failures, they're expected when backend is not running
      if (!endpoint.includes('health')) {
        toast({
          title: 'API Error',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
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
  
  async addCertification(userId: string, machineId: string) {
    return this.request<{ success: boolean }>(
      `certifications`, 
      'POST', 
      { userId, machineId }
    );
  }
  
  async addSafetyCourse(userId: string, courseId: string) {
    return this.request<{ success: boolean }>(
      `certifications/safety-course`, 
      'POST', 
      { userId, courseId }
    );
  }
  
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return this.request<{ success: boolean }>(
      `bookings`, 
      'POST', 
      { machineId, date, time }
    );
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return this.request<{ success: boolean }>(
      `machines/${machineId}/status`, 
      'PUT', 
      { status, note }
    );
  }
  
  // Booking endpoints
  async getAllBookings() {
    return this.request<any[]>('bookings/all', 'GET');
  }
  
  async updateBookingStatus(bookingId: string, status: string) {
    return this.request<any>(
      `bookings/${bookingId}/status`, 
      'PUT', 
      { status }
    );
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
}

// Create and export a singleton instance
export const apiService = new ApiService();
