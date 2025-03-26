// Only update the request method to handle additional options
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from '../utils/tokenStorage';

const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
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
        const token = getToken();
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

  async getMachineStatus(machineId: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'GET');
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'PUT', { status, maintenanceNote: note });
  }
}

export const apiService = new ApiService();
