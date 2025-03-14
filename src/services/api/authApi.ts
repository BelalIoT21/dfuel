
import { apiClient, ApiResponse } from './apiClient';

class AuthApi {
  async login(email: string, password: string): Promise<ApiResponse<{ token: string, user: any }>> {
    console.log('Attempting login via API for:', email);
    return apiClient.request<{ token: string, user: any }>(
      'auth/login', 
      'POST', 
      { email, password },
      false
    );
  }
  
  async register(userData: any): Promise<ApiResponse<{ token: string, user: any }>> {
    console.log('Attempting registration via API for:', userData.email);
    return apiClient.request<{ token: string, user: any }>(
      'auth/register', 
      'POST', 
      userData,
      false
    );
  }
  
  async checkHealth(): Promise<ApiResponse<{ status: string, message: string }>> {
    return apiClient.request<{ status: string, message: string }>(
      'health',
      'GET',
      undefined,
      false
    );
  }
}

export const authApi = new AuthApi();
