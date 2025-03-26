
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, saveToken } from '../utils/tokenStorage';

const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  private token: string | null = null;

  // Initialize token from storage
  constructor() {
    this.token = getToken();
    console.log('ApiService initialized, token exists:', !!this.token);
  }

  // Set token manually (used during login)
  setToken(token: string | null): void {
    console.log('Setting API service token:', token ? 'token-present' : 'token-removed');
    this.token = token;
  }

  async request(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    data?: any, 
    requireAuth: boolean = true,
    additionalOptions: AxiosRequestConfig = {}
  ): Promise<any> {
    try {
      console.log(`API request to: ${API_BASE_URL}/${endpoint} (method: ${method})`);
      
      // Configure headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add authorization if required
      if (requireAuth) {
        // First try token from instance (set during login)
        let token = this.token;
        
        // If not available, try from storage
        if (!token) {
          token = getToken();
          // Update instance token if found in storage
          if (token) this.token = token;
        }
        
        console.log(`Using token for authorization: ${token ? 'token-present' : 'no-token'}`);
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.warn('No token available for authenticated request');
        }
      }
      
      // Merge headers with any additional headers from options
      const mergedHeaders = {
        ...headers,
        ...(additionalOptions.headers || {})
      };
      
      const config: AxiosRequestConfig = {
        method,
        url: `${API_BASE_URL}/${endpoint}`,
        headers: mergedHeaders,
        ...additionalOptions,
        // Ensure higher timeouts and size limits for large requests
        timeout: 60000, // 60 seconds
        maxContentLength: 100 * 1024 * 1024, // 100MB
        maxBodyLength: 100 * 1024 * 1024, // 100MB
      };

      if (method !== 'GET' && data) {
        config.data = data;
      }

      console.log(`Making API request: ${method} ${config.url} `, config.headers);
      
      const response: AxiosResponse = await axios(config);
      console.log(`Response from ${config.url}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      return {
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      console.error(`API error (${endpoint}):`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      return {
        error: true,
        status: error.response?.status || 500,
        message: error.message,
        data: error.response?.data,
      };
    }
  }

  // Add login endpoint
  async login(email: string, password: string): Promise<any> {
    console.log(`Attempting login for user: ${email}`);
    const response = await this.request('auth/login', 'POST', { email, password }, false);
    
    // If login successful, store the token
    if (response.data && response.data.data && response.data.data.token) {
      const token = response.data.data.token;
      console.log('Login successful, saving token');
      this.setToken(token);
      saveToken(token, true); // Save with remember=true for persistence
    }
    
    return response;
  }

  // Add getCurrentUser endpoint
  async getCurrentUser(): Promise<any> {
    return this.request('auth/me', 'GET');
  }

  // Add health check endpoint
  async checkHealth(): Promise<any> {
    return this.request('health', 'GET', undefined, false);
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<any> {
    return this.request('admin/users', 'GET');
  }

  // Get user by ID
  async getUserById(id: string): Promise<any> {
    return this.request(`users/${id}`, 'GET');
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<any> {
    return this.request(`users/email/${email}`, 'GET');
  }

  // Register new user
  async register(userData: { email: string, password: string, name?: string }): Promise<any> {
    return this.request('auth/register', 'POST', userData, false);
  }

  // Update user profile
  async updateProfile(userId: string, updates: any): Promise<any> {
    return this.request(`auth/profile`, 'PUT', updates);
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return this.request('auth/change-password', 'POST', { 
      currentPassword, 
      newPassword 
    });
  }

  // Machine endpoints
  async getMachineStatus(machineId: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'GET');
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'PUT', { status, maintenanceNote: note });
  }
}

export const apiService = new ApiService();
