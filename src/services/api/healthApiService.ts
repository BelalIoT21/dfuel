
import { BaseApiService } from './baseApiService';

export class HealthApiService extends BaseApiService {
  async checkHealth() {
    return this.request<{ status: string, message: string }>(
      'health',
      'GET',
      undefined,
      false
    );
  }
}

export const healthApiService = new HealthApiService();
