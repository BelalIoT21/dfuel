
import { apiClient, ApiResponse } from './apiClient';

class AdminApi {
  async updateAdminCredentials(email: string, password: string): Promise<ApiResponse<void>> {
    return apiClient.request<void>(
      'admin/credentials', 
      'PUT', 
      { email, password }
    );
  }
}

export const adminApi = new AdminApi();
