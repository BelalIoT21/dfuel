
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getApiEndpoints } from '../utils/env';

// Main API service to handle all API requests
class ApiService {
  private api: AxiosInstance;
  private endpoints: string[];
  private currentEndpointIndex: number = 0;
  private token: string | null = null;
  
  constructor() {
    this.endpoints = getApiEndpoints();
    console.log("Available API endpoints:", this.endpoints);
    
    // Create axios instance with initial base URL
    this.api = axios.create({
      baseURL: this.endpoints[this.currentEndpointIndex],
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Intercept responses to handle errors consistently
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(`API error: ${error}`);
        return Promise.reject(error);
      }
    );
  }
  
  // Set authorization token for subsequent requests
  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }
  
  // Get the current user profile when logged in
  async getCurrentUser(): Promise<any> {
    return this.request('auth/me', 'GET', undefined, true);
  }
  
  // Generic request method for all API calls
  async request(endpoint: string, method: string = 'GET', data?: any, requiresAuth: boolean = false): Promise<any> {
    try {
      // Add authentication header if required and available
      if (requiresAuth && !this.token) {
        console.log("Auth required but no token available");
      }
      
      // Log the request for debugging
      console.log(`API request to: ${this.api.defaults.baseURL}${endpoint} (method: ${method})`);
      if (this.token) {
        console.log(`Using token for authorization: token-present`);
      }
      
      console.log(`Making API request: ${method} ${this.api.defaults.baseURL}${endpoint} `);
      console.log(`Request headers:`, this.api.defaults.headers);
      if (data) {
        console.log(`Request data:`, data);
      }
      
      // Make the request
      let response: AxiosResponse;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.api.get(endpoint);
          break;
        case 'POST':
          response = await this.api.post(endpoint, data);
          break;
        case 'PUT':
          response = await this.api.put(endpoint, data);
          break;
        case 'DELETE':
          response = await this.api.delete(endpoint, { data });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      // Log the response
      console.log(`Response from ${this.api.defaults.baseURL}${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error: any) {
      const status = error.response?.status || 500;
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      
      console.error(`API error for ${method} ${this.api.defaults.baseURL}${endpoint}: ${status} - ${errorMsg}`);
      console.error(`API request failed for ${endpoint}: ${errorMsg}`);
      console.error(`Could not connect to server.`);
      
      return {
        error: errorMsg,
        status,
        data: error.response?.data
      };
    }
  }
  
  // Auth functions
  async login(email: string, password: string): Promise<any> {
    return this.request('auth/login', 'POST', { email, password });
  }
  
  async register(userData: { email: string; password: string; name?: string }): Promise<any> {
    return this.request('auth/register', 'POST', userData);
  }
  
  // Machine functions
  async getMachineStatus(machineId: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'GET');
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'PUT', { status, maintenanceNote: note }, true);
  }

  // User functions
  async getAllUsers(): Promise<any> {
    return this.request('users', 'GET', undefined, true);
  }

  // Get all machines
  async getAllMachines(): Promise<any> {
    return this.request('machines', 'GET');
  }

  // Get all bookings
  async getAllBookings(): Promise<any> {
    return this.request('bookings', 'GET', undefined, true);
  }
  
  // Get user bookings
  async getUserBookings(userId?: string): Promise<any> {
    return this.request('bookings', 'GET', undefined, true);
  }
  
  // Add booking
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<any> {
    console.log(`API: Adding booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
    return this.request('bookings', 'POST', { 
      userId, 
      machineId, 
      date, 
      time 
    }, true);
  }
  
  // Update booking status
  async updateBookingStatus(bookingId: string, status: string): Promise<any> {
    return this.request(`bookings/${bookingId}/status`, 'PUT', { status }, true);
  }
  
  // Cancel booking
  async cancelBooking(bookingId: string): Promise<any> {
    return this.request(`bookings/${bookingId}/cancel`, 'PUT', {}, true);
  }
  
  // Add certification
  async addCertification(userId: string, certificationId: string): Promise<any> {
    return this.request('certifications', 'POST', { userId, machineId: certificationId }, true);
  }
  
  // Remove certification
  async removeCertification(userId: string, certificationId: string): Promise<any> {
    return this.request(`certifications/${userId}/${certificationId}`, 'DELETE', undefined, true);
  }

  // Get admin dashboard data
  async getAdminDashboard(): Promise<any> {
    return this.request('admin/dashboard', 'GET', undefined, true);
  }
  
  // Generic REST methods
  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, 'GET');
  }
  
  async post(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, 'POST', data);
  }
  
  async put(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, 'PUT', data);
  }
  
  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, 'DELETE');
  }
}

// Create a singleton instance
export const apiService = new ApiService();
