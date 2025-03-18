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
  
  // Auth endpoints
  async login(email: string, password: string) {
    try {
      console.log(`Making API request: POST /auth/login`);
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
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
      const response = await axios.post(`${BASE_URL}/auth/register`, userData);
      return { data: response.data };
    } catch (error: any) {
      console.error('API register error:', error.response?.data || error.message);
      return { 
        error: error.response?.data?.message || error.message || 'An error occurred during registration'
      };
    }
  },
  
  // User endpoints
  async getCurrentUser() {
    try {
      console.log(`Making API request: GET /auth/me`);
      const response = await axios.get(`${BASE_URL}/auth/me`);
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
  
  // NEW: Delete user
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
