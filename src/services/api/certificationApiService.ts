
import { BaseApiService } from './baseApiService';

export class CertificationApiService extends BaseApiService {
  async addCertification(userId: string, machineId: string) {
    return this.request<{ success: boolean }>(
      `certifications`, 
      'POST', 
      { userId, machineId }
    );
  }
}

export const certificationApiService = new CertificationApiService();
