
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '@/utils/env';

class ApiService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = API_URL || 'http://localhost:4000/api';
  }
  
  // Helper method to get auth header
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  
  // Generic request method
  async request<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // Always include auth header for authenticated requests
      const headers = {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers
      };
      
      const config = {
        ...options,
        headers,
        url
      };
      
      console.log('API request:', endpoint, 'with token:', localStorage.getItem('token') ? 'yes' : 'no');
      return await axios(config);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      data: { email, password }
    });
  }
  
  async register(userData: { name: string, email: string, password: string }) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      data: userData
    });
  }
  
  async getUserProfile() {
    return this.request<any>('/auth/me', {
      method: 'GET'
    });
  }
  
  async forgotPassword(email: string) {
    return this.request<any>('/auth/forgot-password', {
      method: 'POST',
      data: { email }
    });
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    return this.request<any>('/auth/reset-password', {
      method: 'POST',
      data: { email, resetCode, newPassword }
    });
  }
  
  // User endpoints
  async getUsers() {
    return this.request<any>('/users', {
      method: 'GET'
    });
  }
  
  async updateUser(id: string, userData: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      data: userData
    });
  }
  
  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE'
    });
  }
  
  // Machine endpoints
  async getMachines() {
    return this.request<any>('/machines', {
      method: 'GET'
    });
  }
  
  async getMachineById(id: string) {
    return this.request<any>(`/machines/${id}`, {
      method: 'GET'
    });
  }
  
  async createMachine(machineData: any) {
    return this.request<any>('/machines', {
      method: 'POST',
      data: machineData
    });
  }
  
  async updateMachine(id: string, machineData: any) {
    return this.request<any>(`/machines/${id}`, {
      method: 'PUT',
      data: machineData
    });
  }
  
  async deleteMachine(id: string) {
    return this.request<any>(`/machines/${id}`, {
      method: 'DELETE'
    });
  }
  
  async getMachineStatus(id: string) {
    return this.request<any>(`/machines/${id}/status`, {
      method: 'GET'
    });
  }
  
  async updateMachineStatus(id: string, status: string, maintenanceNote?: string) {
    return this.request<any>(`/machines/${id}/status`, {
      method: 'PUT',
      data: { status, maintenanceNote }
    });
  }
  
  // Booking endpoints
  async getBookings() {
    return this.request<any>('/bookings', {
      method: 'GET'
    });
  }
  
  async createBooking(bookingData: any) {
    return this.request<any>('/bookings', {
      method: 'POST',
      data: bookingData
    });
  }
  
  // Certification endpoints
  async addCertification(userId: string, machineId: string) {
    return this.request<any>('/certifications', {
      method: 'POST',
      data: { userId, machineId }
    });
  }
  
  // Admin endpoints
  async getDashboardData() {
    return this.request<any>('/admin/dashboard', {
      method: 'GET'
    });
  }
  
  // Health check
  async checkHealth() {
    return this.request<any>('/health', {
      method: 'GET'
    });
  }
}

export const apiService = new ApiService();
