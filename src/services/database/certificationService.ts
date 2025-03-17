
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { toast } from '@/components/ui/use-toast';

/**
 * Service that handles all certification-related database operations.
 */
export class CertificationDatabaseService extends BaseService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationDatabaseService.addCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Ensure IDs are strings
      const stringUserId = userId.toString();
      const stringMachineId = machineId.toString();
      
      const response = await apiService.post('certifications', { 
        userId: stringUserId, 
        machineId: stringMachineId 
      });
      
      // Both newly added and already had it are considered success
      if (response.data?.success) {
        if (response.data.message === 'User already has this certification') {
          console.log(`User ${userId} already has certification ${machineId}`);
        } else {
          toast({
            title: "Success",
            description: "Certification added successfully",
          });
        }
        return true;
      }
      
      toast({
        title: "Error",
        description: response.error || "Failed to add certification",
        variant: "destructive"
      });
      
      return false;
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
      // Ensure IDs are strings
      const stringUserId = userId.toString();
      const stringMachineId = machineId.toString();
      
      const response = await apiService.delete(`certifications/${stringUserId}/${stringMachineId}`);
      
      // Both removed and didn't have it are considered success
      if (response.data?.success) {
        if (response.data.message === 'User does not have this certification') {
          console.log(`User ${userId} does not have certification ${machineId}`);
        } else {
          toast({
            title: "Success",
            description: "Certification removed successfully",
          });
        }
        return true;
      }
      
      toast({
        title: "Error",
        description: response.error || "Failed to remove certification",
        variant: "destructive"
      });
      
      return false;
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
      // Ensure ID is string
      const stringUserId = userId.toString();
      
      const response = await apiService.get(`certifications/user/${stringUserId}`);
      if (response.data && Array.isArray(response.data)) {
        // Ensure all certification IDs are strings
        return response.data.map(cert => cert.toString());
      }
      
      if (response.error) {
        console.error("Error getting user certifications:", response.error);
      }
      
      return [];
    } catch (error) {
      console.error("API error getting certifications:", error);
      return [];
    }
  }
  
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      const response = await apiService.get(`certifications/check/${userId}/${machineId}`);
      return !!response.data;
    } catch (error) {
      console.error("API error checking certification:", error);
      return false;
    }
  }
  
  async clearUserCertifications(userId: string): Promise<boolean> {
    try {
      const response = await apiService.delete(`certifications/clear/${userId}`);
      if (response.data?.success) {
        toast({
          title: "Success",
          description: "All certifications cleared successfully"
        });
        return true;
      }
      
      toast({
        title: "Error",
        description: response.error || "Failed to clear certifications",
        variant: "destructive"
      });
      
      return false;
    } catch (error) {
      console.error("API error clearing certifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear certifications",
        variant: "destructive"
      });
      return false;
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
