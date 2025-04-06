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
        // Prevent error logging for user registration 400 errors
        if (!(error.response?.status === 400 && 
             (error.config?.url?.includes('auth/register') || 
              error.config?.url?.includes('register')))) {
          console.error('API Error:', error.message || 'Unknown error');
        }
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
    // Ensure endpoint doesn't start with a slash or 'api/'
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Remove 'api/' prefix if it exists since it's already in the baseURL
    if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.substring(4);
    }
    
    try {
      // Log the actual URL being requested (for debugging)
      const fullUrl = `${this.api.defaults.baseURL}/${cleanEndpoint}`;
      console.log(`Making ${method} request to: ${fullUrl}`);
      
      // Make the request
      let response;
      try {
        // For registration endpoint, always use validateStatus to prevent throwing errors
        const options = {
          validateStatus: (status: number) => {
            // For registration endpoint, treat 400 as a valid status
            if (cleanEndpoint === 'auth/register' && status === 400) {
              return true;
            }
            // For other endpoints, only 2xx and 3xx are valid
            return status >= 200 && status < 400;
          }
        };

        switch (method.toUpperCase()) {
          case 'GET':
            response = await this.api.get(cleanEndpoint, { 
              params: data,
              validateStatus: (status) => status < 500 // Don't reject on 4xx errors
            });
            break;
          case 'POST':
            if (cleanEndpoint === 'auth/register') {
              response = await this.api.post(cleanEndpoint, data, options);
            } else {
              response = await this.api.post(cleanEndpoint, data);
            }
            break;
          case 'PUT':
            response = await this.api.post(cleanEndpoint, data);
            break;
          case 'DELETE':
            response = await this.api.delete(cleanEndpoint, { data });
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      } catch (error: any) {
        // Handle network errors or invalid JSON responses
        if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          console.error('Received HTML response instead of JSON:', error.response.data);
          return {
            error: 'Server error: Received HTML response',
            status: error.response?.status || 500,
            details: error.response?.data
          };
        }
        throw error;
      }

      // Check if response is valid JSON
      if (response.data && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.error('Response is HTML instead of JSON:', response.data);
        return {
          error: 'Server error: Received HTML response',
          status: response.status,
          details: response.data
        };
      }

      // Check for 400 Bad Request responses for registration
      if (response.status === 400 && cleanEndpoint === 'auth/register') {
        const errorMsg = response.data?.message || response.data?.error || 'Bad Request';
        
        // For user already exists, don't log anything (already logged in register method)
        return {
          error: errorMsg,
          status: response.status,
          details: response.data
        };
      }

      return {
        data: response.data,
        status: response.status
      };

    } catch (error: any) {
      const status = error.response?.status || 500;
      let errorMsg = 'An error occurred while processing your request';

      // Special handling for registration endpoint with 500 error
      if (cleanEndpoint === 'auth/register' && status === 500) {
        // Check if the error message contains "b.l.mishm" which might indicate a user already exists
        if (error.message && typeof error.message === 'string' && 
            (error.message.includes('b.l.mishm') || 
             error.message.includes('Unexpected token') || 
             error.message.includes('already exists'))) {
          console.info('User already exists: Email is already registered');
          return {
            error: 'User already exists',
            status: 400,
            details: error.response?.data
          };
        }
      }

      // Handle JSON parsing errors
      if (error.message && error.message.includes('Unexpected token')) {
        errorMsg = 'Server error: Invalid response format';
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        } else if (typeof error.response.data === 'object') {
          errorMsg = 'Server error: Please try again later';
        }
      } else {
        errorMsg = error.message || errorMsg;
      }

      // Only log as error if not related to user existence
      if (!(errorMsg === 'User already exists' || errorMsg.includes('already exists'))) {
        console.error(`API Error (${status}): ${errorMsg}`);
      } else {
        console.info('User already exists: Email is already registered');
      }
      
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
  
  async register(email: string, password: string, name: string): Promise<any> {
    try {
      // Format the data properly
      const userData = {
        email,
        password,
        name
      };
      
      // Single silent log message for registration attempt
      console.info(`Registration attempt for: ${email}`);
      
      // Use XMLHttpRequest instead of fetch to have more control over error reporting
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        
        // Set up a custom error handler that doesn't log to console
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            let response;
            
            try {
              response = JSON.parse(xhr.responseText);
            } catch (e) {
              response = { message: xhr.responseText || 'Unknown error' };
            }
            
            if (xhr.status === 400) {
              // User already exists case - silent info log
              console.info('User already exists');
              resolve({
                error: 'User already exists',
                status: 400
              });
            } else if (xhr.status >= 200 && xhr.status < 300) {
              // Success case
              resolve({
                data: response,
                status: xhr.status
              });
            } else {
              // Other error case
              console.error('Registration failed:', response.message || 'Unknown error');
              resolve({
                error: response.message || 'Registration failed',
                status: xhr.status
              });
            }
          }
        };
        
        // Open the request
        xhr.open('POST', `${this.api.defaults.baseURL}/auth/register`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        
        // Send the request
        xhr.send(JSON.stringify(userData));
      });
    } catch (error: any) {
      console.error('Registration critical error:', error);
      return {
        error: 'Registration failed. Please try again later.',
        status: 500
      };
    }
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
  
  // Course related endpoints with improved error handling
  async getAllCourses(): Promise<any> {
    try {
      const response = await this.request('courses', 'GET');
      if (response.error) {
        console.error('Error fetching courses:', response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      return { success: false, error: 'Failed to fetch courses' };
    }
  }
  
  async getCourseById(courseId: string): Promise<any> {
    try {
      const response = await this.request(`courses/${courseId}`, 'GET');
      if (response.error) {
        console.error('Error fetching course:', response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error in getCourseById:', error);
      return { success: false, error: 'Failed to fetch course' };
    }
  }

  async getAdminDashboard(): Promise<any> {
    try {
      const response = await this.request('admin/dashboard', 'GET', undefined, true);
      return response;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      return {
        error: 'Failed to fetch dashboard data',
        status: 500
      };
    }
  }

  // Certification related methods
  async addCertification(userId: string, machineId: string): Promise<any> {
    try {
      const response = await this.request(
        'certifications', 
        'POST',
        { userId, machineId },
        true
      );
      return response;
    } catch (error) {
      console.error('Error adding certification:', error);
      return {
        error: 'Failed to add certification',
        status: 500
      };
    }
  }
  
  async removeCertification(userId: string, machineId: string): Promise<any> {
    try {
      const response = await this.request(
        `certifications/${userId}/${machineId}`,
        'DELETE',
        undefined,
        true
      );
      return response;
    } catch (error) {
      console.error('Error removing certification:', error);
      return {
        error: 'Failed to remove certification',
        status: 500
      };
    }
  }
  
  async getUserCertifications(userId: string): Promise<any> {
    try {
      const response = await this.request(
        `certifications/user/${userId}`,
        'GET',
        undefined,
        true
      );
      return response;
    } catch (error) {
      console.error('Error fetching user certifications:', error);
      return {
        error: 'Failed to fetch user certifications',
        status: 500
      };
    }
  }
  
  async checkCertification(userId: string, machineId: string): Promise<any> {
    try {
      const response = await this.request(
        `certifications/check/${userId}/${machineId}`,
        'GET',
        undefined,
        true
      );
      return response;
    } catch (error) {
      console.error('Error checking certification:', error);
      return {
        error: 'Failed to check certification',
        status: 500
      };
    }
  }
  
  async clearUserCertifications(userId: string): Promise<any> {
    try {
      const response = await this.request(
        `certifications/user/${userId}/clear`,
        'DELETE',
        undefined,
        true
      );
      return response;
    } catch (error) {
      console.error('Error clearing user certifications:', error);
      return {
        error: 'Failed to clear user certifications',
        status: 500
      };
    }
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

// Create a singleton instance and export it as a named export
export const apiService = new ApiService();