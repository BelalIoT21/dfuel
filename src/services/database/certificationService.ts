import { apiService } from '../apiService';

export class CertificationService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      const response = await apiService.addCertification(userId, machineId);
      
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
      const response = await apiService.removeCertification(userId, machineId);
      
      if (response.error) {
        console.error('Failed to remove certification:', response.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error removing certification:', error);
      return false;
    }
  }

  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      const response = await apiService.getUserCertifications(userId);
      
      if (response.error) {
        console.error('Error fetching certifications:', response.error);
        return [];
      }
      
      // Handle both array and object responses
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.certifications) {
        return response.data.certifications;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching certifications:', error);
      return [];
    }
  }

  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // Safety equipment always returns true
      if (machineId === "5" || machineId === "6") return true;

      const response = await apiService.checkCertification(userId, machineId);
      
      if (response.error) {
        console.error('Error checking certification:', response.error);
        return false;
      }
      
      return response.data?.isCertified || false;
    } catch (error) {
      console.error('Error checking certification:', error);
      return false;
    }
  }
}

export const certificationService = new CertificationService();