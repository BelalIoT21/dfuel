import { User } from '@/types/database';

class ApiService {
  private readonly baseURL: string = 'http://localhost:4000/api';
  
  // Helper method to handle API requests
  private async request<T>(
    url: string, 
    method: string = 'GET', 
    body?: any, 
    customHeaders?: Record<string, string>
  ): Promise<{ data: T | null; error: string | null; success: boolean }> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include'
      };
      
      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${this.baseURL}${url}`, options);
      
      if (response.status === 404) {
        throw new Error(`${response.status} - ${response.statusText} - ${url}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`API error for ${method} ${this.baseURL}${url}:`, response.status, '-', data.message || response.statusText);
        throw new Error(data.message || response.statusText);
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`API error for ${method} ${this.baseURL}${url}:`, error);
      
      // If it's a network error or CORS issue, return a more user-friendly message
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
        return { 
          data: null, 
          error: 'Server is unreachable. Please check your connection.', 
          success: false 
        };
      }
      
      return { 
        data: null, 
        error: errorMessage, 
        success: false 
      };
    }
  }
  
  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{user: User, token: string}>('/auth/login', 'POST', { email, password });
  }
  
  async register(userData: { email: string; password: string; name: string }) {
    return this.request<{user: User, token: string}>('/auth/register', 'POST', userData);
  }
  
  async getCurrentUser() {
    return this.request<{user: User}>('/auth/me');
  }
  
  async requestPasswordReset(email: string) {
    return this.request<{success: boolean}>('/auth/forgot-password', 'POST', { email });
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    return this.request<{success: boolean}>('/auth/reset-password', 'POST', { email, resetCode, newPassword });
  }
  
  // User endpoints
  async getAllUsers() {
    try {
      const result = await this.request<User[]>('/users');
      console.log('API response for users:', result);
      return result;
    } catch (error) {
      console.error('API request failed for users:', error);
      throw error;
    }
  }
  
  async getUserById(id: string) {
    return this.request<User>(`/users/${id}`);
  }
  
  async getUserByEmail(email: string) {
    return this.request<User>(`/users/email/${email}`);
  }
  
  async updateUser(id: string, updates: any) {
    return this.request<{success: boolean}>(`/users/${id}`, 'PUT', updates);
  }
  
  async updateProfile(id: string, updates: any) {
    return this.request<{success: boolean}>(`/users/${id}/profile`, 'PUT', updates);
  }
  
  async deleteUser(id: string) {
    return this.request<{success: boolean}>(`/users/${id}`, 'DELETE');
  }
  
  // Health check
  async ping() {
    return this.request<{pong: boolean, mongodb?: {userCount: number, status: string}}>('/health');
  }
  
  // Machine endpoints
  async getAllMachines() {
    return this.request<any[]>('/machines', 'GET', undefined, true);
  }
  
  async getMachineById(machineId: string) {
    return this.request<any>(`/machines/${machineId}`, 'GET', undefined, true);
  }
  
  async createMachine(machineData: any) {
    return this.request<any>('/machines', 'POST', machineData, true);
  }
  
  async updateMachine(machineId: string, machineData: any) {
    return this.request<any>(`/machines/${machineId}`, 'PUT', machineData, true);
  }
  
  async deleteMachine(machineId: string) {
    return this.request<{success: boolean}>(`/machines/${machineId}`, 'DELETE', undefined, true);
  }
  
  // Certification endpoints
  async addCertification(userId: string, machineId: string) {
    console.log(`Adding certification for user ${userId}, machine ${machineId}`);
    return this.request<{success: boolean}>('/certifications', 'POST', { userId, machineId });
  }
  
  async removeCertification(userId: string, machineId: string) {
    console.log(`Removing certification for user ${userId}, machine ${machineId}`);
    return this.request<{success: boolean}>('/certifications', 'DELETE', { userId, machineId });
  }
  
  async getUserCertifications(userId: string) {
    return this.request<string[]>(`/certifications/user/${userId}`, 'GET');
  }
  
  async checkCertification(userId: string, machineId: string) {
    return this.request<boolean>('/certifications/check', 'GET', { userId, machineId });
  }
  
  // Booking endpoints
  async getAllBookings() {
    return this.request<any[]>('/bookings/all', 'GET');
  }
  
  async getUserBookings(userId: string) {
    return this.request<any[]>(`/bookings`, 'GET');
  }
  
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return this.request<{success: boolean}>('/bookings', 'POST', { machineId, date, time });
  }
  
  async updateBookingStatus(bookingId: string, status: string) {
    console.log(`Updating booking status: ${bookingId} to ${status}`);
    
    try {
      const response = await this.request<any>(`/bookings/${bookingId}/status`, 'PUT', { status });
      
      if (!response.error) {
        return response;
      }
    } catch (error) {
      console.log(`Error with standard endpoint: ${error}`);
    }
    
    try {
      return await this.request<any>('/bookings/update-status', 'PUT', { bookingId, status });
    } catch (error) {
      console.log(`Error with alternative endpoint: ${error}`);
      throw error;
    }
  }
  
  async cancelBooking(bookingId: string) {
    return this.request<any>(`/bookings/${bookingId}/cancel`, 'PUT');
  }
  
  // Admin endpoints
  async updateAdminCredentials(email: string, password: string) {
    return this.request<void>('/admin/credentials', 'PUT', { email, password });
  }
  
  // Dashboard endpoints
  async getAllUsers() {
    return this.request<any[]>('/users', 'GET');
  }
  
  async getMachineStatus(machineId: string) {
    return this.request<{ status: string, note?: string }>(`/machines/${machineId}/status`, 'GET');
  }
  
  // Safety certification management
  async addSafetyCertification(userId: string) {
    return this.request<{ success: boolean }>(`/certifications/safety`, 'POST', { userId });
  }
  
  async removeSafetyCertification(userId: string) {
    return this.request<{ success: boolean }>(`/certifications/safety`, 'DELETE', { userId });
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return this.request<{ success: boolean }>(`/machines/${machineId}/status`, 'PUT', { status, maintenanceNote: note }, true);
  }
}

export const apiService = new ApiService();
