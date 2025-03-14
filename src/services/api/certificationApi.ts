
import { apiClient, ApiResponse } from './apiClient';

class CertificationApi {
  async addCertification(userId: string, machineId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.request<{ success: boolean }>(
      `certifications`, 
      'POST', 
      { userId, machineId }
    );
  }
}

export const certificationApi = new CertificationApi();
