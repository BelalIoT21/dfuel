// Add or update the setToken method and ensure it's used in all requests
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = 'http://localhost:4000/api';
    // Initialize token from localStorage if available
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    console.log(`API token ${token ? 'set' : 'cleared'}`);
  }

  async request(method: string, endpoint: string, data?: any, requiresAuth: boolean = true) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available
    if (requiresAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    console.log(`Making API request: ${method} ${url}${data ? ' with data: ' + JSON.stringify(data) : ''}${requiresAuth ? (this.token ? ' with auth token' : ' no auth required') : ' no auth required'}`);
    
    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      
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
        error: 'Network error. Server may be unavailable.', 
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
    return this.request('POST', `/certifications/add`, { userId, machineId });
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
}

export const apiService = new ApiService();
