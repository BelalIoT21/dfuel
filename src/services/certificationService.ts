
import { apiService } from './apiService';

class CertificationService {
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Checking certification for user ${userId} and machine ${machineId} from MongoDB API`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to checkCertification');
        return false;
      }
      
      // Get certification data from API
      try {
        console.log(`Fetching certification data from API for user ${userId}, machine ${machineId}`);
        const response = await apiService.get(`certifications/${userId}/${machineId}`);
        
        if (response.data) {
          console.log(`API certification check result: ${response.data.certified}`);
          return !!response.data.certified;
        }
      } catch (apiError) {
        console.error('API error checking certification:', apiError);
      }
      
      console.log(`No certification found for user ${userId} and machine ${machineId}`);
      return false;
    } catch (error) {
      console.error('Error checking certification:', error);
      return false;
    }
  }

  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`Getting certifications for user ${userId} from MongoDB API`);
      
      if (!userId) {
        console.error('Invalid userId passed to getUserCertifications');
        return [];
      }
      
      // Get certification list from API
      try {
        console.log(`Fetching certification list from API for user ${userId}`);
        const response = await apiService.get(`certifications/${userId}`);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`API returned ${response.data.length} certifications`);
          return response.data.map(cert => cert.machineId || cert);
        }
      } catch (apiError) {
        console.error('API error getting user certifications:', apiError);
      }
      
      console.log(`No certifications found for user ${userId}`);
      return [];
    } catch (error) {
      console.error('Error getting user certifications:', error);
      return [];
    }
  }

  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Adding certification for user ${userId} and machine ${machineId} via MongoDB API`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to addCertification');
        return false;
      }
      
      // Add certification via API
      try {
        console.log(`Using API to add certification: user=${userId}, machine=${machineId}`);
        const response = await apiService.post('certifications', { userId, machineId });
        
        if (response.data && response.data.success) {
          console.log('API certification addition successful');
          return true;
        }
      } catch (apiError) {
        console.error('API error adding certification:', apiError);
      }
      
      console.log(`Failed to add certification for user ${userId} and machine ${machineId}`);
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Removing certification for user ${userId} and machine ${machineId} via MongoDB API`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to removeCertification');
        return false;
      }
      
      // Remove certification via API
      try {
        console.log(`Using API to remove certification: user=${userId}, machine=${machineId}`);
        const response = await apiService.delete(`certifications/${userId}/${machineId}`);
        
        if (response.data && response.data.success) {
          console.log('API certification removal successful');
          return true;
        }
      } catch (apiError) {
        console.error('API error removing certification:', apiError);
      }
      
      console.log(`Failed to remove certification for user ${userId} and machine ${machineId}`);
      return false;
    } catch (error) {
      console.error('Error removing certification:', error);
      return false;
    }
  }
}

export const certificationService = new CertificationService();
