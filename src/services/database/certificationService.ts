
import { apiService } from '../apiService';

class CertificationDatabaseService {
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`Calling API to get certifications for user ${userId}`);
      const response = await apiService.getUserCertifications(userId);
      
      if (response.error) {
        console.error('Error fetching certifications:', response.error);
        return [];
      }
      
      console.log('Received certifications from service:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('API error fetching certifications:', error);
      return [];
    }
  }

  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Adding certification ${machineId} for user ${userId}`);
      const response = await apiService.addCertification(userId, machineId);
      
      if (response.error) {
        console.error('Error adding certification:', response.error);
        return false;
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Removing certification ${machineId} for user ${userId}`);
      const response = await apiService.removeCertification(userId, machineId);
      
      if (response.error) {
        console.error('Error removing certification:', response.error);
        return false;
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error removing certification:', error);
      return false;
    }
  }

  async clearUserCertifications(userId: string): Promise<boolean> {
    try {
      console.log(`Clearing all certifications for user ${userId}`);
      const response = await apiService.delete(`certifications/user/${userId}/clear`);
      
      if (response.error) {
        console.error('Error clearing certifications:', response.error);
        return false;
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      return false;
    }
  }
}

export const certificationDatabaseService = new CertificationDatabaseService();
