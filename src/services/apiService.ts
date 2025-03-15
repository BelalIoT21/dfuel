import axios from 'axios';
import { authUtils } from './authUtils';

/**
 * Main API Service for communicating with the backend.
 */

class ApiService {
  baseURL: string;
  
  constructor() {
    this.baseURL = 'http://localhost:4000/api';
  }
  
  /**
   * Set the authentication token
   */
  setToken(token: string | null): void {
    authUtils.setToken(token);
  }
  
  /**
   * Make a request to the API
   */
  async request(endpoint: string, method: string = 'GET', data?: any, useToken: boolean = true): Promise<any> {
    try {
      const url = `${this.baseURL}/${endpoint}`;
      console.info(`Making API request: ${method} ${url}${useToken ? ' with auth token' : ''}`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication token if required
      if (useToken) {
        const token = authUtils.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.warn('Authentication token required but not found');
        }
      }
      
      const config = {
        method,
        url,
        headers,
        data: data ? JSON.stringify(data) : undefined,
      };
      
      const response = await axios(config);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      const errorResponse = error.response;
      const status = errorResponse?.status;
      const message = errorResponse?.data?.message || 'An error occurred';
      
      console.error(`API error for ${method} ${this.baseURL}/${endpoint}: ${status} - ${message} - ${endpoint}`, error);
      
      return {
        data: null,
        error: message,
        status
      };
    }
  }
  
  // User-related methods
  
  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string): Promise<any> {
    return this.request('auth/register', 'POST', { email, password, name }, false);
  }
  
  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<any> {
    return this.request('auth/login', 'POST', { email, password }, false);
  }
  
  /**
   * Get the current user's profile
   */
  async getUserProfile(): Promise<any> {
    return this.request('auth/me', 'GET', undefined, true);
  }
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<any> {
    return this.request('auth/me', 'GET', undefined, true);
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(updates: any): Promise<any> {
    return this.request('auth/profile', 'PUT', updates, true);
  }
  
  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<any> {
    return this.request('users', 'GET', undefined, true);
  }
  
  // Machine-related methods
  
  /**
   * Get all machines
   */
  async getMachines(): Promise<any> {
    return this.request('machines', 'GET', undefined, false);
  }
  
  /**
   * Get machine by id
   */
  async getMachineById(id: string): Promise<any> {
    return this.request(`machines/${id}`, 'GET', undefined, false);
  }
  
  /**
   * Update machine status
   */
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'PUT', { status, note }, true);
  }
  
  /**
   * Get machine status
   */
  async getMachineStatus(machineId: string): Promise<any> {
    return this.request(`machines/${machineId}/status`, 'GET', undefined, true);
  }
  
  // Booking-related methods
  
  /**
   * Create a booking
   */
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<any> {
    return this.request('bookings', 'POST', { userId, machineId, date, time }, true);
  }
  
  /**
   * Add a booking
   */
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<any> {
    return this.request('bookings', 'POST', { userId, machineId, date, time }, true);
  }
  
  /**
   * Get all bookings (admin only)
   */
  async getAllBookings(): Promise<any> {
    return this.request('bookings/all', 'GET', undefined, true);
  }
  
  /**
   * Get user bookings
   */
  async getUserBookings(userId: string): Promise<any> {
    return this.request(`bookings/user/${userId}`, 'GET', undefined, true);
  }
  
  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<any> {
    return this.request(`bookings/${bookingId}/status`, 'PUT', { status }, true);
  }
  
  // Certification-related methods
  
  /**
   * Add certification
   */
  async addCertification(userId: string, machineId: string): Promise<any> {
    return this.request('certifications', 'POST', { userId, machineId }, true);
  }
  
  /**
   * Remove certification
   */
  async removeCertification(userId: string, machineId: string): Promise<any> {
    return this.request('certifications', 'DELETE', { userId, machineId }, true);
  }
  
  /**
   * Get user certifications
   */
  async getUserCertifications(userId: string): Promise<any> {
    return this.request(`certifications/user/${userId}`, 'GET', undefined, true);
  }
}

// Create a singleton instance of the service
export const apiService = new ApiService();
