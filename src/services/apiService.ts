import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { formatApiEndpoint } from '@/utils/env';

// Define response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// ApiService class to handle all API requests
class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    // Create an axios instance with default config
    this.client = axios.create({
      baseURL: '/api',  // Default to relative path for production
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add response interceptor to standardize responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API error:', error);
        
        // Return a standardized error object
        if (error.response) {
          console.error(`API error for ${error.config.method.toUpperCase()} ${error.config.url}: ${error.response.status} - ${error.message}`);
          return Promise.reject({
            status: error.response.status,
            data: error.response.data,
            error: error.response.data?.message || error.message
          });
        }
        
        console.error(`API request failed: ${error.message}`);
        return Promise.reject({
          status: 500,
          data: null,
          error: error.message
        });
      }
    );

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        // If token exists, add it to the headers
        if (this.token) {
          config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Set auth token for future requests
  setToken(token: string | null): void {
    this.token = token;
  }

  // Get the currently set token
  getToken(): string | null {
    return this.token;
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.log(`API request to: ${config.url} (method: ${config.method || 'GET'})`);
      
      // Log headers and data if present
      console.log('Making API request:', `${config.method || 'GET'} ${config.url}`, {
        ...(config.data && { data: config.data })
      });
      
      console.log('Request headers:', this.client.defaults.headers);
      if (config.data) {
        console.log('Request data:', config.data);
      }
      
      const response: AxiosResponse<T> = await this.client(config);
      return {
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      console.error(`API request failed for ${config.url}:`, error.message || 'Unknown error');
      return {
        error: error.error || error.message || 'API request failed',
        status: error.status || 500
      };
    }
  }

  // Health check endpoint
  async checkHealth(): Promise<ApiResponse> {
    return this.request({
      url: '/health',
      method: 'GET'
    });
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    console.log("Sending login request to API endpoint: /auth/login");
    return this.request({
      url: '/auth/login',
      method: 'POST',
      data: { email, password }
    });
  }

  async register(userData: { email: string; password: string; name?: string }): Promise<ApiResponse> {
    console.log("Sending registration request to API endpoint: auth/register");
    return this.request({
      url: '/auth/register',
      method: 'POST',
      data: userData
    });
  }

  async logout(): Promise<ApiResponse> {
    console.log("Sending logout request to API endpoint: auth/logout");
    return this.request({
      url: '/auth/logout',
      method: 'POST'
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    console.log("Getting current user from API endpoint: user/me");
    return this.request({
      url: '/user/me',
      method: 'GET'
    });
  }

  async getAllUsers(): Promise<ApiResponse> {
    console.log("Getting all users from API endpoint: user");
    return this.request({
      url: '/user',
      method: 'GET'
    });
  }

  async getUserById(id: string): Promise<ApiResponse> {
    console.log(`Getting user by ID ${id} from API endpoint: user/${id}`);
    return this.request({
      url: `/user/${id}`,
      method: 'GET'
    });
  }

  async getUserByEmail(email: string): Promise<ApiResponse> {
    console.log(`Getting user by email ${email} from API`);
    return this.request({
      url: `/user?email=${email}`,
      method: 'GET'
    });
  }

  async updateProfile(userId: string, updates: { name?: string; email?: string; password?: string }): Promise<ApiResponse> {
    console.log(`Updating profile for user ID ${userId} via API`);
    return this.request({
      url: `/user/profile`,
      method: 'PUT',
      data: updates
    });
  }

  async changePassword(userId: string, passwords: { currentPassword?: string, newPassword?: string }): Promise<ApiResponse> {
    console.log(`Updating password for user ID ${userId} via API`);
    return this.request({
      url: `/user/password`,
      method: 'PUT',
      data: passwords
    });
  }

  async getBookings(): Promise<ApiResponse> {
    console.log("Getting bookings from API endpoint: booking");
    return this.request({
      url: '/booking',
      method: 'GET'
    });
  }

  async getBookingById(id: string): Promise<ApiResponse> {
      console.log(`Getting booking by ID ${id} from API endpoint: booking/${id}`);
      return this.request({
          url: `/booking/${id}`,
          method: 'GET'
      });
  }

  async createBooking(bookingData: any): Promise<ApiResponse> {
    console.log("Creating a new booking via API");
    return this.request({
      url: '/booking',
      method: 'POST',
      data: bookingData
    });
  }

  async updateBooking(id: string, updates: any): Promise<ApiResponse> {
    console.log(`Updating booking with ID ${id} via API`);
    return this.request({
      url: `/booking/${id}`,
      method: 'PUT',
      data: updates
    });
  }

  async deleteBooking(id: string): Promise<ApiResponse> {
    console.log(`Deleting booking with ID ${id} via API`);
    return this.request({
      url: `/booking/${id}`,
      method: 'DELETE'
    });
  }

  async getMachines(): Promise<ApiResponse> {
    console.log("Getting machines from API endpoint: machine");
    return this.request({
      url: '/machine',
      method: 'GET'
    });
  }

  async getMachineById(id: string): Promise<ApiResponse> {
    console.log(`Getting machine by ID ${id} from API endpoint: machine/${id}`);
    return this.request({
      url: `/machine/${id}`,
      method: 'GET'
    });
  }

  async createMachine(machineData: any): Promise<ApiResponse> {
    console.log("Creating a new machine via API");
    return this.request({
      url: '/machine',
      method: 'POST',
      data: machineData
    });
  }

  async updateMachine(id: string, updates: any): Promise<ApiResponse> {
    console.log(`Updating machine with ID ${id} via API`);
    return this.request({
      url: `/machine/${id}`,
      method: 'PUT',
      data: updates
    });
  }

  async deleteMachine(id: string): Promise<ApiResponse> {
    console.log(`Deleting machine with ID ${id} via API`);
    return this.request({
      url: `/machine/${id}`,
      method: 'DELETE'
    });
  }

  async getCourses(): Promise<ApiResponse> {
    console.log("Getting courses from API endpoint: course");
    return this.request({
      url: '/course',
      method: 'GET'
    });
  }

  async getCourseById(id: string): Promise<ApiResponse> {
    console.log(`Getting course by ID ${id} from API endpoint: course/${id}`);
    return this.request({
      url: `/course/${id}`,
      method: 'GET'
    });
  }

  async createCourse(courseData: any): Promise<ApiResponse> {
    console.log("Creating a new course via API");
    return this.request({
      url: '/course',
      method: 'POST',
      data: courseData
    });
  }

  async updateCourse(id: string, updates: any): Promise<ApiResponse> {
    console.log(`Updating course with ID ${id} via API`);
    return this.request({
      url: `/course/${id}`,
      method: 'PUT',
      data: updates
    });
  }

  async deleteCourse(id: string): Promise<ApiResponse> {
    console.log(`Deleting course with ID ${id} via API`);
    return this.request({
      url: `/course/${id}`,
      method: 'DELETE'
    });
  }

  async getQuizzes(): Promise<ApiResponse> {
    console.log("Getting quizzes from API endpoint: quiz");
    return this.request({
      url: '/quiz',
      method: 'GET'
    });
  }

  async getQuizById(id: string): Promise<ApiResponse> {
    console.log(`Getting quiz by ID ${id} from API endpoint: quiz/${id}`);
    return this.request({
      url: `/quiz/${id}`,
      method: 'GET'
    });
  }

  async createQuiz(quizData: any): Promise<ApiResponse> {
    console.log("Creating a new quiz via API");
    return this.request({
      url: '/quiz',
      method: 'POST',
      data: quizData
    });
  }

  async updateQuiz(id: string, updates: any): Promise<ApiResponse> {
    console.log(`Updating quiz with ID ${id} via API`);
    return this.request({
      url: `/quiz/${id}`,
      method: 'PUT',
      data: updates
    });
  }

  async deleteQuiz(id: string): Promise<ApiResponse> {
    console.log(`Deleting quiz with ID ${id} via API`);
    return this.request({
      url: `/quiz/${id}`,
      method: 'DELETE'
    });
  }
}

// Create a singleton instance
export const apiService = new ApiService();
