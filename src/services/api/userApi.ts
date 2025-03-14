
import { apiClient, ApiResponse } from './apiClient';

class UserApi {
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return apiClient.request<any>('users/me', 'GET');
  }
  
  async updateUser(userId: string, updates: any): Promise<ApiResponse<any>> {
    return apiClient.request<any>(`users/${userId}`, 'PUT', updates);
  }
  
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.request<void>(
      `users/${userId}/password`, 
      'PUT', 
      { currentPassword, newPassword }
    );
  }
  
  async getUserByEmail(email: string): Promise<ApiResponse<any>> {
    return apiClient.request<any>(`users/email/${email}`, 'GET');
  }
  
  async getUserById(userId: string): Promise<ApiResponse<any>> {
    return apiClient.request<any>(`users/${userId}`, 'GET');
  }
  
  async updateProfile(userId: string, updates: any): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.request<{ success: boolean }>(`users/${userId}/profile`, 'PUT', updates);
  }
  
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    return apiClient.request<any[]>('users', 'GET');
  }
}

export const userApi = new UserApi();
