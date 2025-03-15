
// Add the missing certification methods to the apiService
import axios from 'axios';
import { getUserToken } from '@/utils/storage';

// Define the API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

interface ApiResponse {
  data: any;
  error: string | null;
  success?: boolean;
}

export class ApiService {
  // Make a generic API request
  async request(method: string, endpoint: string, data?: any, headers?: any): Promise<ApiResponse> {
    try {
      console.log(`Making API request: ${method} ${API_BASE_URL}${endpoint}${headers ? ' with auth token' : ''}`);
      
      // Get the authorization token
      const token = getUserToken();
      
      // Set up the headers
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      };
      
      // Make the request
      const response = await axios({
        method,
        url: `${API_BASE_URL}${endpoint}`,
        data,
        headers: requestHeaders,
      });
      
      return {
        data: response.data,
        error: null,
        success: true
      };
    } catch (error: any) {
      console.error(`API Error: ${error.message}`, error);
      
      // Handle various error types
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      return {
        data: null,
        error: errorMessage,
        success: false
      };
    }
  }
  
  // Simple ping method to check API connectivity
  async ping(): Promise<ApiResponse> {
    return this.request('GET', '/health');
  }
  
  // User certification related methods
  async addCertification(userId: string, machineId: string): Promise<ApiResponse> {
    return this.request('POST', `/certifications/add`, { userId, machineId });
  }
  
  async removeCertification(userId: string, machineId: string): Promise<ApiResponse> {
    return this.request('POST', `/certifications/remove`, { userId, machineId });
  }
  
  async checkCertification(userId: string, machineId: string): Promise<ApiResponse> {
    return this.request('GET', `/certifications/check/${userId}/${machineId}`);
  }
  
  async getUserCertifications(userId: string): Promise<ApiResponse> {
    return this.request('GET', `/users/${userId}/certifications`);
  }
  
  // Machine status methods
  async getMachineStatus(machineId: string): Promise<ApiResponse> {
    return this.request('GET', `/machines/${machineId}/status`);
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<ApiResponse> {
    return this.request('PUT', `/machines/${machineId}/status`, { status, note });
  }
  
  async getMachineMaintenanceNote(machineId: string): Promise<ApiResponse> {
    return this.request('GET', `/machines/${machineId}/maintenance-note`);
  }
  
  // Machine related methods
  async getMachineById(id: string): Promise<ApiResponse> {
    return this.request('GET', `/machines/${id}`);
  }
  
  // User related methods
  async getAllUsers(): Promise<ApiResponse> {
    return this.request('GET', `/users`);
  }
  
  async getUserById(id: string): Promise<ApiResponse> {
    return this.request('GET', `/users/${id}`);
  }
  
  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request('DELETE', `/users/${id}`);
  }
  
  // Booking related methods
  async deleteBooking(id: string): Promise<ApiResponse> {
    return this.request('DELETE', `/bookings/${id}`);
  }
  
  async clearAllBookings(): Promise<ApiResponse> {
    return this.request('DELETE', `/bookings/clear-all`);
  }
}

// Create a singleton instance
export const apiService = new ApiService();
