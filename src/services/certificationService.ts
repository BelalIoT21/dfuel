import { apiService } from './apiService';

export class CertificationService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Adding certification ${machineId} for user ${userId}`);
      const response = await apiService.post(
        'certifications',
        { userId, machineId },
        { requiresAuth: true }
      );

      if (response.error) {
        console.error('Failed to add certification:', response.error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Removing certification ${machineId} for user ${userId}`);
      
      // Use the corrected apiService method
      const response = await apiService.removeCertification(userId, machineId);
      
      if (response.error) {
        console.error('Failed to remove certification:', {
          userId,
          machineId,
          status: response.status,
          error: response.error,
          details: response.details
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error removing certification:', {
        userId,
        machineId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Checking certification for user ${userId}, machine ${machineId}`);
      
      // Special handling for safety equipment (IDs 5 and 6)
      if (machineId === "5" || machineId === "6") {
        return true;
      }

      // First try the dedicated check endpoint
      const checkResponse = await apiService.get<{ isCertified: boolean }>(
        `certifications/check/${userId}/${machineId}`,
        undefined,
        { requiresAuth: true }
      );

      if (!checkResponse.error && checkResponse.data !== undefined) {
        return checkResponse.data.isCertified;
      }

      // Fallback to checking against user's certifications if check endpoint fails
      console.log('Using fallback certification check');
      const userCerts = await this.getUserCertifications(userId);
      return userCerts.includes(machineId);
    } catch (error) {
      console.error('Error checking certification:', error);
      return false;
    }
  }

  async getAllCertifications(): Promise<Array<{ id: string; name: string }>> {
    try {
      console.log('Fetching all available certifications');
      const response = await apiService.get<Array<{ id: string; name: string }>>(
        'certifications',
        undefined,
        { requiresAuth: true }
      );

      if (response.error || !response.data) {
        console.error('Failed to fetch all certifications:', response.error);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching all certifications:', error);
      return [];
    }
  }

  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`Fetching certifications for user ${userId}`);
      const response = await apiService.get<string[]>(
        `certifications/user/${userId}`,
        undefined,
        { requiresAuth: true }
      );

      if (response.error || !response.data) {
        console.error('Failed to fetch user certifications:', response.error);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user certifications:', error);
      return [];
    }
  }
}

export const certificationService = new CertificationService();