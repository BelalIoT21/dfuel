// Add or update the setToken method and ensure it's used in all requests
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Use environment variables if available, otherwise fallback to localhost
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    this.baseUrl = apiUrl;
    
    // Initialize token from localStorage if available
    this.token = localStorage.getItem('token');
    console.log(`API Service initialized with ${this.token ? 'existing token' : 'no token'}`);
    console.log(`API URL: ${this.baseUrl}`);
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
    } else {
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
    }
    console.log(`API token ${token ? 'set' : 'cleared'}`);
  }

  async request(method: string, endpoint: string, data?: any, requiresAuth: boolean = true) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available and required
    if (requiresAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      // Add credentials to allow cookies if needed
      credentials: 'include',
    };
    
    console.log(`Making API request: ${method} ${url}${data ? ' with data: ' + JSON.stringify(data) : ''}${requiresAuth ? (this.token ? ' with auth token' : ' no auth token available') : ' no auth required'}`);
    
    try {
      const response = await fetch(url, options);
      
      // Try to parse as JSON, but handle non-JSON responses
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        try {
          responseData = JSON.parse(text);
        } catch (e) {
          responseData = { message: text };
        }
      }
      
      if (!response.ok) {
        console.error(`API error for ${method} ${url}: ${response.status} - ${responseData.message || 'Unknown error'}`);
        console.error(`API request failed for ${endpoint.split('/')[1]}: ${responseData.message || 'Unknown error'}`);
        return { 
          data: null, 
          error: responseData.message || 'Server error', 
          status: response.status,
          success: false 
        };
      }
      
      return { 
        data: responseData, 
        error: null, 
        status: response.status,
        success: true 
      };
    } catch (error) {
      console.error(`Network error for ${method} ${url}:`, error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Network error. Server may be unavailable.', 
        status: 0,
        success: false 
      };
    }
  }

  // User authentication methods
  async login(email: string, password: string) {
    console.log("Attempting login via API for:", email);
    return this.request('POST', '/auth/login', { email, password }, false);
  }

  async register(userData: { email: string; password: string; name: string }) {
    return this.request('POST', '/auth/register', userData, false);
  }

  async getCurrentUser() {
    return this.request('GET', '/auth/me');
  }

  // User count (public endpoint)
  async getUserCount() {
    return this.request('GET', '/auth/user-count', undefined, false);
  }

  // Make sure all other API methods include the token
  async getAllUsers() {
    return this.request('GET', '/users');
  }
  
  async getUserByEmail(email: string) {
    return this.request('GET', `/users/email/${email}`);
  }
  
  async getUserById(id: string) {
    return this.request('GET', `/users/${id}`);
  }
  
  async updateProfile(id: string, updates: any) {
    return this.request('PUT', `/users/${id}`, updates);
  }
  
  async deleteUser(id: string) {
    return this.request('DELETE', `/users/${id}`);
  }
  
  async addCertification(userId: string, machineId: string) {
    return this.request('POST', '/certifications/add', { userId, machineId });
  }
  
  async getMachineById(id: string) {
    return this.request('GET', `/machines/${id}`);
  }
  
  async getMachines() {
    return this.request('GET', '/machines');
  }
  
  async getMachineStatus(machineId: string) {
    return this.request('GET', `/machines/${machineId}/status`);
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return this.request('PUT', `/machines/${machineId}/status`, { status, note });
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    return this.request('GET', `/machines/${machineId}/note`);
  }
  
  async deleteBooking(bookingId: string) {
    return this.request('DELETE', `/bookings/${bookingId}`);
  }
  
  async clearAllBookings() {
    return this.request('DELETE', '/bookings/clear-all');
  }
  
  async ping() {
    return this.request('GET', '/health', undefined, false);
  }
  
  async removeCertification(userId: string, machineId: string) {
    return this.request('DELETE', `/certifications`, { userId, machineId });
  }
  
  async getUserCertifications(userId: string) {
    return this.request('GET', `/certifications/user/${userId}`);
  }
}

export const apiService = new ApiService();
