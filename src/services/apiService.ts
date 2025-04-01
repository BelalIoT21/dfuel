import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { formatApiEndpoint, getApiUrl } from '../utils/env';

// Create axios instance
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

// Add interceptors for logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`API request to: ${config.url} (method: ${config.method})`);
    console.log('Making API request:', `${config.method} ${config.url}`, config.headers);
    
    // Only log request data for non-GET requests
    if (config.method !== 'get' && config.data) {
      console.log('Request data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Error response interceptor for better logging
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses (with minimal information)
    const logResponse = {
      status: response.status,
      url: response.config.url,
      data: response.data ? (typeof response.data === 'object' ? 'object' : 'data') : null
    };
    
    // Only log full response for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API response:', logResponse);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Log API errors with helpful details
    console.error(`API error for ${error.config?.method?.toUpperCase()} ${error.config?.url}: ${error.response?.status} - ${error.message}`);
    
    // Log the error details to help with debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API error response:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API error message:', error.message);
    }
    
    // Make sure to reject the promise so the error can be handled
    return Promise.reject(error);
  }
);

class ApiService {
  // Format the URL with proper path separation
  private formatUrl(url: string): string {
    // If it's already an absolute URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Make sure URL always starts with /api/ if not already
    if (!url.startsWith('/api/') && !url.startsWith('api/')) {
      url = url.startsWith('/') ? `/api${url}` : `/api/${url}`;
    }
    
    // If URL doesn't include protocol but has a domain, add http://
    if (url.includes('.') && !url.startsWith('http')) {
      return `http://${url}`;
    }
    
    return url;
  }
  
  // Main request method
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      // Ensure URL is properly formatted
      const baseApiUrl = getApiUrl();
      let fullUrl = config.url || '';
      
      // If URL is not absolute, use formatApiEndpoint to build it
      if (!fullUrl.startsWith('http')) {
        // Remove leading slash for formatApiEndpoint
        const endpoint = fullUrl.startsWith('/') ? fullUrl.substring(1) : fullUrl;
        fullUrl = formatApiEndpoint(endpoint);
      }
      
      // Update the config with the formatted URL
      const updatedConfig: AxiosRequestConfig = {
        ...config,
        url: fullUrl
      };
      
      // Make the request
      return await axiosInstance(updatedConfig);
    } catch (error) {
      // Log the error
      console.error('API error:', error);
      
      // Rethrow to allow handling elsewhere
      throw error;
    }
  }
  
  // Health check endpoint
  async checkHealth() {
    try {
      return await this.request({
        method: 'GET',
        url: 'health'
      });
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
  
  async getAllUsers() {
    return await this.request({
      method: 'GET',
      url: 'users'
    });
  }

  async getUserById(id: string) {
    return await this.request({
      method: 'GET',
      url: `users/${id}`
    });
  }

  async createUser(userData: any) {
    return await this.request({
      method: 'POST',
      url: 'users',
      data: userData
    });
  }

  async updateUser(id: string, userData: any) {
    return await this.request({
      method: 'PUT',
      url: `users/${id}`,
      data: userData
    });
  }

  async deleteUser(id: string) {
    return await this.request({
      method: 'DELETE',
      url: `users/${id}`
    });
  }

  async getMachines(timestamp: number) {
    return await this.request({
      method: 'GET',
      url: `machines?t=${timestamp}`
    });
  }

  async getMachineById(id: string) {
    return await this.request({
      method: 'GET',
      url: `machines/${id}`
    });
  }

  async createMachine(machineData: any) {
    return await this.request({
      method: 'POST',
      url: 'machines',
      data: machineData
    });
  }

  async updateMachine(id: string, machineData: any) {
    return await this.request({
      method: 'PUT',
      url: `machines/${id}`,
      data: machineData
    });
  }

  async deleteMachine(id: string) {
    return await this.request({
      method: 'DELETE',
      url: `machines/${id}`
    });
  }

  async getMachineStatus(machineId: string) {
    try {
      const response = await this.request({
        method: 'GET',
        url: `machines/${machineId}/status`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching status for machine ${machineId}:`, error);
      throw error;
    }
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    try {
      const response = await this.request({
        method: 'GET',
        url: `machines/${machineId}/maintenance-note`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching maintenance note for machine ${machineId}:`, error);
      return ''; // Return empty string if there's an error
    }
  }

  async updateMachineStatus(machineId: string, status: string) {
    return await this.request({
      method: 'PUT',
      url: `machines/${machineId}/status`,
      data: { status }
    });
  }

  async getAllBookings() {
    return await this.request({
      method: 'GET',
      url: 'bookings'
    });
  }

  async getBookingById(id: string) {
    return await this.request({
      method: 'GET',
      url: `bookings/${id}`
    });
  }

  async createBooking(bookingData: any) {
    return await this.request({
      method: 'POST',
      url: 'bookings',
      data: bookingData
    });
  }

  async updateBooking(id: string, bookingData: any) {
    return await this.request({
      method: 'PUT',
      url: `bookings/${id}`,
      data: bookingData
    });
  }

  async deleteBooking(id: string) {
    return await this.request({
      method: 'DELETE',
      url: `bookings/${id}`
    });
  }

  async getCertifications() {
    return await this.request({
      method: 'GET',
      url: 'certifications'
    });
  }

  async getCertificationById(id: string) {
    return await this.request({
      method: 'GET',
      url: `certifications/${id}`
    });
  }

  async createCertification(certificationData: any) {
    return await this.request({
      method: 'POST',
      url: 'certifications',
      data: certificationData
    });
  }

  async updateCertification(id: string, certificationData: any) {
    return await this.request({
      method: 'PUT',
      url: `certifications/${id}`,
      data: certificationData
    });
  }

  async deleteCertification(id: string) {
    return await this.request({
      method: 'DELETE',
      url: `certifications/${id}`
    });
  }

  async checkCertification(userId: string, machineId: string) {
      try {
          const response = await this.request({
              method: 'GET',
              url: `certifications/check?userId=${userId}&machineId=${machineId}`
          });
          return response.data;
      } catch (error) {
          console.error('Error checking certification:', error);
          throw error;
      }
  }

  async getCourses() {
    return await this.request({
      method: 'GET',
      url: 'courses'
    });
  }

  async getCourseById(id: string) {
    return await this.request({
      method: 'GET',
      url: `courses/${id}`
    });
  }

  async createCourse(courseData: any) {
    return await this.request({
      method: 'POST',
      url: 'courses',
      data: courseData
    });
  }

  async updateCourse(id: string, courseData: any) {
    return await this.request({
      method: 'PUT',
      url: `courses/${id}`,
      data: courseData
    });
  }

  async deleteCourse(id: string) {
    return await this.request({
      method: 'DELETE',
      url: `courses/${id}`
    });
  }

    async getQuizzes() {
        return await this.request({
            method: 'GET',
            url: 'quizzes'
        });
    }

    async getQuizById(id: string) {
        return await this.request({
            method: 'GET',
            url: `quizzes/${id}`
        });
    }

    async createQuiz(quizData: any) {
        return await this.request({
            method: 'POST',
            url: 'quizzes',
            data: quizData
        });
    }

    async updateQuiz(id: string, quizData: any) {
        return await this.request({
            method: 'PUT',
            url: `quizzes/${id}`,
            data: quizData
        });
    }

    async deleteQuiz(id: string) {
        return await this.request({
            method: 'DELETE',
            url: `quizzes/${id}`
        });
    }
}

// Create and export a singleton instance
export const apiService = new ApiService();
