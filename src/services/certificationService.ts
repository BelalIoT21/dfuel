
import { isWeb } from '../utils/platform';
import { apiService } from './apiService';
import mongoDbService from './mongoDbService';

class CertificationService {
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Checking certification for user ${userId} and machine ${machineId} - always from MongoDB`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to checkCertification');
        return false;
      }
      
      // Always try API first for fresh data
      try {
        console.log(`Fetching fresh certification data from API for user ${userId}, machine ${machineId}`);
        const response = await apiService.get(`certifications/${userId}/${machineId}`);
        
        if (response.data) {
          console.log(`API certification check result: ${response.data.certified}`);
          return !!response.data.certified;
        }
      } catch (apiError) {
        console.error('API error checking certification:', apiError);
      }
      
      // Try mongoDbService directly as fallback
      try {
        console.log(`API failed, trying MongoDB directly for certification check`);
        const user = await mongoDbService.getUserById(userId);
        
        if (user && user.certifications) {
          const certifications = Array.isArray(user.certifications) 
            ? user.certifications 
            : [String(user.certifications)];
          
          const isCertified = certifications.includes(machineId);
          console.log(`MongoDB direct certification check result: ${isCertified}`);
          return isCertified;
        }
      } catch (mongoError) {
        console.error('MongoDB error checking certification:', mongoError);
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
      console.log(`Getting certifications for user ${userId} - always from MongoDB`);
      
      if (!userId) {
        console.error('Invalid userId passed to getUserCertifications');
        return [];
      }
      
      // Always try API first for fresh data
      try {
        console.log(`Fetching fresh certification list from API for user ${userId}`);
        const response = await apiService.get(`certifications/${userId}`);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`API returned ${response.data.length} certifications`);
          return response.data.map(cert => cert.machineId || cert);
        }
      } catch (apiError) {
        console.error('API error getting user certifications:', apiError);
      }
      
      // Try mongoDbService directly as fallback
      try {
        console.log(`API failed, trying MongoDB directly for certifications`);
        const user = await mongoDbService.getUserById(userId);
        
        if (user && user.certifications) {
          const certifications = Array.isArray(user.certifications) 
            ? user.certifications 
            : [String(user.certifications)];
          
          console.log(`MongoDB direct returned ${certifications.length} certifications`);
          return certifications;
        }
      } catch (mongoError) {
        console.error('MongoDB error getting user certifications:', mongoError);
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
      console.log(`Adding certification for user ${userId} and machine ${machineId} - direct to MongoDB`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to addCertification');
        return false;
      }
      
      // Always use API for certification updates
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
      
      // Try mongoDbService directly as fallback
      try {
        console.log(`API failed, trying MongoDB directly to add certification`);
        const success = await mongoDbService.updateUserCertifications(userId, machineId);
        
        if (success) {
          console.log('MongoDB direct certification addition successful');
          return true;
        }
      } catch (mongoError) {
        console.error('MongoDB error adding certification:', mongoError);
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
      console.log(`Removing certification for user ${userId} and machine ${machineId} - direct to MongoDB`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to removeCertification');
        return false;
      }
      
      // Always use API for certification updates
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
      
      // Try mongoDbService directly as fallback
      try {
        console.log(`API failed, trying MongoDB directly to remove certification`);
        const success = await mongoDbService.removeUserCertification(userId, machineId);
        
        if (success) {
          console.log('MongoDB direct certification removal successful');
          return true;
        }
      } catch (mongoError) {
        console.error('MongoDB error removing certification:', mongoError);
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
