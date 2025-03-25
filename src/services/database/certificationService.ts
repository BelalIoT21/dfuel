
import { BaseService } from './baseService';
import { apiService } from '../apiService';

/**
 * Service that handles all certification-related database operations.
 */
export class CertificationDatabaseService extends BaseService {
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`Calling API to get certifications for user ${userId}`);
      const response = await apiService.getUserCertifications(userId);
      
      console.log("Get user certifications raw response:", response);
      if (response.data && Array.isArray(response.data)) {
        // Process certification data, ensuring all IDs are strings
        const processedCertifications = response.data.map(cert => {
          if (typeof cert === 'object' && cert !== null) {
            return cert._id ? cert._id.toString() : 
                  cert.id ? cert.id.toString() : 
                  String(cert);
          }
          return cert.toString ? cert.toString() : String(cert);
        });
        
        console.log("Processed user certifications:", processedCertifications);
        return processedCertifications;
      }
      
      console.error("Invalid certification data format or API error");
      return [];
    } catch (error) {
      console.error("API error fetching certifications:", error);
      return [];
    }
  }

  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`CertificationDatabaseService.addCertification: userId=${userId}, machineId=${machineId}`);
      
      console.log(`Calling API to add certification: userId=${userId}, machineId=${machineId}`);
      const response = await apiService.addCertification(userId, machineId);
      
      console.log("Add certification response:", response);
      
      if (response.data?.success || response.status === 200 || response.status === 201) {
        console.log(`Successfully added certification via API for user ${userId}, machine ${machineId}`);
        return true;
      }
      
      console.error("API error adding certification:", response.error);
      return false;
    } catch (error) {
      console.error("Error in addCertification:", error);
      return false;
    }
  }

  async removeUserCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      // Use the removeCertification method directly with correct parameter order
      return await this.removeCertification(userId, certificationId);
    } catch (error) {
      console.error("Error in removeUserCertification:", error);
      return false;
    }
  }

  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`CertificationDatabaseService.removeCertification: userId=${userId}, machineId=${machineId}`);
      
      console.log(`Calling API to remove certification: userId=${userId}, machineId=${machineId}`);
      const response = await apiService.removeCertification(userId, machineId);
      
      console.log("Remove certification response:", response);
      
      if (response.data?.success || response.status === 200) {
        console.log(`Successfully removed certification via API for user ${userId}, machine ${machineId}`);
        return true;
      }
      
      console.error("API error removing certification:", response.error);
      return false;
    } catch (error) {
      console.error("Error in removeCertification:", error);
      return false;
    }
  }

  async clearUserCertifications(userId: string): Promise<boolean> {
    try {
      console.log(`CertificationDatabaseService.clearUserCertifications: userId=${userId}`);
      
      console.log(`Calling API to clear certifications: userId=${userId}`);
      const response = await apiService.clearCertifications(userId);
      
      console.log("Clear certifications response:", response);
      
      if (response.data?.success || response.status === 200) {
        console.log(`Successfully cleared all certifications via API for user ${userId}`);
        return true;
      }
      
      console.error("API error clearing certifications:", response.error);
      return false;
    } catch (error) {
      console.error("Error in clearUserCertifications:", error);
      return false;
    }
  }

  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`CertificationDatabaseService.checkCertification: userId=${userId}, machineId=${machineId}`);
      
      console.log(`Calling API to check certification: userId=${userId}, machineId=${machineId}`);
      const response = await apiService.checkCertification(userId, machineId);
      
      console.log("Check certification response:", response);
      
      if (response.data !== undefined) {
        return !!response.data;
      }
      
      console.error("API error checking certification");
      return false;
    } catch (error) {
      console.error("Error in checkCertification:", error);
      return false;
    }
  }
}

export const certificationDatabaseService = new CertificationDatabaseService();
