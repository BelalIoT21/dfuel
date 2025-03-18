
import axios from 'axios';

const BASE_URL = '/api';
let token: string | null = null;

// Configure axios defaults
axios.defaults.baseURL = BASE_URL;

// Function to set the authentication token
const setToken = (newToken: string | null) => {
  token = newToken;
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage if available
const initializeToken = () => {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    setToken(savedToken);
  }
};

// Call initialize on module load
initializeToken();

export const apiService = {
  // Set token
  setToken,
  
  // Health check
  async checkHealth() {
    try {
      console.log(`Making API request: GET /health`);
      const response = await axios.get(`${BASE_URL}/health`);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      console.error('API health check error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },
  
  // Auth endpoints
  async login(email: string, password: string) {
    try {
      // Updated URL to match the server endpoint path
      console.log(`Making API request: POST /auth/login`);
      const response = await axios.post(`/auth/login`, { email, password });
      console.log('Login response:', response.data);
      return { data: response.data };
    } catch (error: any) {
      console.error('API login error:', error.response?.data || error.message);
      return { 
        error: error.response?.data?.message || error.message || 'An error occurred during login'
      };
    }
  },
  
  async register(userData: { email: string; password: string; name?: string }) {
    try {
      console.log(`Making API request: POST /auth/register`);
      // Updated URL to match the server endpoint path
      const response = await axios.post(`/auth/register`, userData);
      return { data: response.data };
    } catch (error: any) {
      console.error('API register error:', error.response?.data || error.message);
      return { 
        error: error.response?.data?.message || error.message || 'An error occurred during registration'
      };
    }
  },
  
  async getCurrentUser() {
    try {
      console.log(`Making API request: GET /auth/me`);
      // Updated URL to match the server endpoint path
      const response = await axios.get(`/auth/me`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API getCurrentUser error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },
  
  async getAllUsers() {
    try {
      console.log(`Making API request: GET /users`);
      const response = await axios.get(`${BASE_URL}/users`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API getAllUsers error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },
  
  async getUserByEmail(email: string) {
    try {
      console.log(`Making API request: GET /users/email/${email}`);
      const response = await axios.get(`${BASE_URL}/users/email/${email}`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API getUserByEmail error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },
  
  async deleteUser(userId: string) {
    try {
      console.log(`Making API request: DELETE /users/${userId}`);
      const response = await axios.delete(`${BASE_URL}/users/${userId}`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API deleteUser error:', error.response?.data || error.message);
      return { 
        error: error.response?.data?.message || error.message || 'Failed to delete user'
      };
    }
  },
  
  async getMachines() {
    try {
      console.log(`Making API request: GET /machines`);
      const response = await axios.get(`${BASE_URL}/machines`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API getMachines error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },

  async getMachineById(machineId: string) {
    try {
      console.log(`Making API request: GET /machines/${machineId}`);
      const response = await axios.get(`${BASE_URL}/machines/${machineId}`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API getMachineById error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },

  async getAllCertifications() {
    try {
      console.log(`Making API request: GET /certifications`);
      const response = await axios.get(`${BASE_URL}/certifications`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API getAllCertifications error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },

  async getUserCertifications(userId: string) {
    try {
      console.log(`Making API request: GET /certifications/user/${userId}`);
      const response = await axios.get(`${BASE_URL}/certifications/user/${userId}`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API getUserCertifications error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },

  async addCertification(userId: string, certificationId: string) {
    try {
      console.log(`Making API request: POST /certifications/user/${userId}/add/${certificationId}`);
      const response = await axios.post(`${BASE_URL}/certifications/user/${userId}/add/${certificationId}`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API addCertification error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },

  async removeCertification(userId: string, certificationId: string) {
    try {
      console.log(`Making API request: POST /certifications/user/${userId}/remove/${certificationId}`);
      const response = await axios.post(`${BASE_URL}/certifications/user/${userId}/remove/${certificationId}`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API removeCertification error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },

  async clearUserCertifications(userId: string) {
    try {
      console.log(`Making API request: POST /certifications/user/${userId}/clear`);
      const response = await axios.post(`${BASE_URL}/certifications/user/${userId}/clear`);
      return { data: response.data };
    } catch (error: any) {
      console.error('API clearUserCertifications error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || error.message };
    }
  },
};
