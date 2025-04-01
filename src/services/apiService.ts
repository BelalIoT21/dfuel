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
    return this.request('api/auth/me', 'GET', undefined, true);
  }
  
  // Generic request method for all API calls
  async request(endpoint: string, method: string = 'GET', data?: any, requiresAuth: boolean = false): Promise<any> {
    try {
      // Add authentication header if required and available
      if (requiresAuth && !this.token) {
        console.log("Auth required but no token available");
      }
      
      // Ensure endpoint doesn't start with a slash
      let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      // Check if the endpoint needs api/ prefix
      if (!cleanEndpoint.startsWith('api/') && 
          !this.api.defaults.baseURL?.endsWith('/api') && 
          !cleanEndpoint.includes('/api/')) {
        cleanEndpoint = `api/${cleanEndpoint}`;
      }
      
      // Make the request
      let response: AxiosResponse;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.api.get(cleanEndpoint);
          break;
        case 'POST':
          response = await this.api.post(cleanEndpoint, data || {});
          break;
        case 'PUT':
          response = await this.api.put(cleanEndpoint, data || {});
          break;
        case 'DELETE':
          if (data === null) {
            response = await this.api.delete(cleanEndpoint);
          } else if (data) {
            response = await this.api.delete(cleanEndpoint, { data });
          } else {
            response = await this.api.delete(cleanEndpoint);
          }
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error: any) {
      const status = error.response?.status || 500;
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      
      // For bookings endpoints, if we get a 404 or similar for GET, return empty array instead of error
      if (method === 'GET' && endpoint.includes('bookings') && (status === 404 || status === 204)) {
        return {
          data: [],
          status: status,
          headers: error.response?.headers || {}
        };
      }
      
      return {
        error: errorMsg,
        status,
        data: error.response?.data
      };
    }
  }
  
  // Auth functions - use exact paths from server routes
  async login(email: string, password: string): Promise<any> {
    console.log("Attempting login with API service");
    return this.request('auth/login', 'POST', { email, password });
  }
  
  async register(userData: { email: string; password: string; name?: string }): Promise<any> {
    console.log("Attempting registration with API service");
    return this.request('auth/register', 'POST', userData);
  }
  
  async logout(): Promise<any> {
    return this.request('auth/logout', 'POST', {}, true);
  }
  
  // Machine functions
  async getMachineStatus(machineId: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'GET');
  }
  
  // User functions
  async getAllUsers(): Promise<any> {
    return this.request('users', 'GET', undefined, true);
  }
  
  async getUserByEmail(email: string): Promise<any> {
    return this.request(`users/email/${email}`, 'GET', undefined, true);
  }
  
  async getUserById(id: string): Promise<any> {
    return this.request(`users/${id}`, 'GET', undefined, true);
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
  
  // Course related endpoints
  async getAllCourses(): Promise<any> {
    return this.request('courses', 'GET');
  }
  
  async getCourseById(courseId: string): Promise<any> {
    return this.request(`courses/${courseId}`, 'GET');
  }
  
  async createCourse(courseData: any): Promise<any> {
    return this.request('courses', 'POST', courseData, true);
  }
  
  async updateCourse(courseId: string, courseData: any): Promise<any> {
    return this.request(`courses/${courseId}`, 'PUT', courseData, true);
  }
  
  async deleteCourse(courseId: string): Promise<any> {
    return this.request(`courses/${courseId}`, 'DELETE', undefined, true);
  }
  
  // Add booking
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<any> {
    console.log(`API: Adding booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
    return this.request('bookings', 'POST', { 
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
  
  // Get user certifications
  async getUserCertifications(userId: string): Promise<any> {
    return this.request(`certifications/user/${userId}`, 'GET', undefined, true);
  }
  
  // Add certification
  async addCertification(userId: string, certificationId: string): Promise<any> {
    return this.request('certifications', 'POST', { userId, machineId: certificationId }, true);
  }
  
  // Remove certification
  async removeCertification(userId: string, certificationId: string): Promise<any> {
    return this.request(`certifications/${userId}/${certificationId}`, 'DELETE', undefined, true);
  }

  // Clear all certifications for a user
  async clearUserCertifications(userId: string): Promise<any> {
    return this.request(`certifications/user/${userId}/clear`, 'DELETE', undefined, true);
  }
  
  // Get admin dashboard data
  async getAdminDashboard(): Promise<any> {
    return this.request('admin/dashboard', 'GET', undefined, true);
  }
  
  // Health check
  async checkHealth(): Promise<any> {
    return this.request('health', 'GET');
  }
  
  // Update user profile
  async updateProfile(userId: string, updates: any): Promise<any> {
    return this.request('auth/profile', 'PUT', updates, true);
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
