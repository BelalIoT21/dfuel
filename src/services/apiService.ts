
import axios, { AxiosInstance } from 'axios';
import { getApiEndpoints } from '../utils/env';

// Main API service to handle all API requests
class ApiService {
  private api: AxiosInstance;
  private endpoints: string[];
  private currentEndpointIndex: number = 0;
  
  constructor() {
    this.endpoints = getApiEndpoints();
    
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
        console.error('API Error:', error.message || 'Unknown error');
        return Promise.reject(error);
      }
    );
  }
  
  // Set authorization token for subsequent requests
  setToken(token: string | null): void {
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
  
  // Generic request method with improved error handling
  async request(endpoint: string, method: string = 'GET', data?: any, requiresAuth: boolean = false): Promise<any> {
    try {
      // Ensure endpoint doesn't start with a slash or 'api/'
      let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      // Remove 'api/' prefix if it exists since it's already in the baseURL
      if (cleanEndpoint.startsWith('api/')) {
        cleanEndpoint = cleanEndpoint.substring(4);
      }
      
      // Log the actual URL being requested (for debugging)
      const fullUrl = `${this.api.defaults.baseURL}/${cleanEndpoint}`;
      console.log(`Making ${method} request to: ${fullUrl}`);
      
      // Make the request
      let response;
    try {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.api.get(cleanEndpoint, { params: data });
          break;
        case 'POST':
          response = await this.api.post(cleanEndpoint, data);
          break;
        case 'PUT':
          response = await this.api.put(cleanEndpoint, data);
          break;
        case 'DELETE':
          response = await this.api.delete(cleanEndpoint, { data });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    } catch (error: any) {
      // Handle network errors or invalid JSON responses
      if (error.response?.data?.includes('<!DOCTYPE html>')) {
        throw new Error('Received HTML response instead of JSON');
      }
      throw error;
    }

    return {
      data: response.data,
      status: response.status
    };

  } catch (error: any) {
    const status = error.response?.status || 500;
    let errorMsg = 'Unknown error occurred';

    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMsg = error.response.data;
      } else if (error.response.data.message) {
        errorMsg = error.response.data.message;
      } else if (error.response.data.error) {
        errorMsg = error.response.data.error;
      }
    } else {
      errorMsg = error.message || errorMsg;
    }

    console.error(`API Error (${status}): ${errorMsg}`);
    return {
      error: errorMsg,
      status,
      details: error.response?.data
    };
  }
}
  
  // Auth functions
  async login(email: string, password: string): Promise<any> {
    // Use the server-side path directly matching the auth route in server/src/routes/authRoutes.ts
    return this.request('auth/login', 'POST', { email, password });
  }
  
  async register(userData: { email: string; password: string; name?: string }): Promise<any> {
    return this.request('auth/register', 'POST', userData);
  }
  
  async logout(): Promise<any> {
    return this.request('auth/logout', 'POST', {}, true);
  }
  
  // Rest of API methods...
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

  // Check if user has certification for a machine
  async checkCertification(userId: string, machineId: string): Promise<any> { 
    return this.request(`check/${userId}/${machineId}`, 'GET', undefined, true);
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
