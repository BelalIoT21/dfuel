
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { toast } from '../../../server/src/components/ui/use-toast';

/**
 * Service that handles all certification-related database operations.
 */
export class CertificationDatabaseService extends BaseService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationDatabaseService.addCertification: userId=${userId}, machineId=${machineId}`);
    try {
      const response = await apiService.addCertification(userId, machineId);
      if (response.data?.success) {
        return true;
      }
      
      throw new Error(response.error || 'Unknown error occurred while adding certification');
    } catch (error) {
      console.error("API error adding certification:", error);
      toast({
        title: "Error",
        description: "Failed to add certification",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationDatabaseService.removeCertification: userId=${userId}, machineId=${machineId}`);
    try {
      const response = await apiService.removeCertification(userId, machineId);
      if (response.data?.success) {
        return true;
      }
      
      throw new Error(response.error || 'Unknown error occurred while removing certification');
    } catch (error) {
      console.error("API error removing certification:", error);
      toast({
        title: "Error",
        description: "Failed to remove certification",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      const response = await apiService.getUserCertifications(userId);
      if (response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Unknown error occurred while getting user certifications');
    } catch (error) {
      console.error("API error getting user certifications:", error);
      return [];
    }
  }
  
  async addSafetyCertification(userId: string): Promise<boolean> {
    const SAFETY_MACHINE_ID = "5"; // Safety cabinet ID
    return this.addCertification(userId, SAFETY_MACHINE_ID);
  }
  
  async removeSafetyCertification(userId: string): Promise<boolean> {
    const SAFETY_MACHINE_ID = "5"; // Safety cabinet ID
    return this.removeCertification(userId, SAFETY_MACHINE_ID);
  }
  
  async addMachineSafetyCertification(userId: string): Promise<boolean> {
    const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
    return this.addCertification(userId, MACHINE_SAFETY_ID);
  }
  
  async removeMachineSafetyCertification(userId: string): Promise<boolean> {
    const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
    return this.removeCertification(userId, MACHINE_SAFETY_ID);
  }
}

// Create a singleton instance
export const certificationDatabaseService = new CertificationDatabaseService();
