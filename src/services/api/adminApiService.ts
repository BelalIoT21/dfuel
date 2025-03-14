
import { BaseApiService } from './baseApiService';

export class AdminApiService extends BaseApiService {
  async updateAdminCredentials(email: string, password: string) {
    return this.request<void>(
      'admin/credentials', 
      'PUT', 
      { email, password }
    );
  }
}

export const adminApiService = new AdminApiService();
