
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
      
      console.log(`Calling API to add certification: userId=${stringUserId}, machineId=${stringMachineId}`);
      
      const response = await apiService.post('certifications', { 
        userId: stringUserId, 
        machineId: stringMachineId 
      });
      
      console.log("Add certification response:", response);
      
      // Both newly added and already had it are considered success
      if (response.data?.success) {
        if (response.data.message === 'User already has this certification') {
          console.log(`User ${userId} already has certification ${machineId}`);
          toast({
            title: "Info",
            description: "User already has this certification",
          });
        } else {
          toast({
            title: "Success",
            description: "Certification added successfully",
          });
        }
        return true;
      }
      
      console.error("API error adding certification:", response.error || response.data?.message || "Unknown error");
      toast({
        title: "Error",
        description: response.error || response.data?.message || "Failed to add certification",
        variant: "destructive"
      });
      
      return false;
    } catch (error) {
      console.error("Error adding certification:", error);
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
      
      console.log(`Calling API to remove certification: userId=${stringUserId}, machineId=${stringMachineId}`);
      
      const response = await apiService.delete(`certifications/${stringUserId}/${stringMachineId}`);
      
      console.log("Remove certification response:", response);
      
      // Both removed and didn't have it are considered success
      if (response.data?.success) {
        if (response.data.message === 'User does not have this certification') {
          console.log(`User ${userId} does not have certification ${machineId}`);
          toast({
            title: "Info",
            description: "User does not have this certification",
          });
        } else {
          toast({
            title: "Success",
            description: "Certification removed successfully",
          });
        }
        return true;
      }
      
      console.error("API error removing certification:", response.error || response.data?.message || "Unknown error");
      toast({
        title: "Error",
        description: response.error || response.data?.message || "Failed to remove certification",
        variant: "destructive"
      });
      
      return false;
    } catch (error) {
      console.error("Error removing certification:", error);
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
      
      console.log(`Calling API to get certifications for user ${stringUserId}`);
      
      const response = await apiService.get(`certifications/user/${stringUserId}`);
      console.log("Get user certifications raw response:", response);
      
      if (response.data && Array.isArray(response.data)) {
        // Ensure all certification IDs are strings and handle [object Object] cases
        const certifications = response.data.map(cert => {
          if (typeof cert === 'object' && cert !== null) {
            // If it's an object, extract the ID or convert to string
            return cert._id ? cert._id.toString() : cert.id ? cert.id.toString() : cert.toString();
          }
          return cert.toString ? cert.toString() : String(cert);
        });
        console.log("Processed user certifications:", certifications);
        return certifications;
      }
      
      if (response.error) {
        console.error("Error getting user certifications:", response.error);
      }
      
      return [];
    } catch (error) {
      console.error("Error getting certifications:", error);
      return [];
    }
  }
  
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      const stringUserId = userId.toString();
      const stringMachineId = machineId.toString();
      
      console.log(`Checking certification for user ${stringUserId}, machine ${stringMachineId}`);
      
      const response = await apiService.get(`certifications/check/${stringUserId}/${stringMachineId}`);
      console.log("Check certification response:", response);
      
      return !!response.data;
    } catch (error) {
      console.error("Error checking certification:", error);
      return false;
    }
  }
  
  async clearUserCertifications(userId: string): Promise<boolean> {
    try {
      const stringUserId = userId.toString();
      
      console.log(`Clearing all certifications for user ${stringUserId}`);
      console.log(`API endpoint: certifications/clear/${stringUserId}`);
      
      const response = await apiService.delete(`certifications/clear/${stringUserId}`);
      console.log("Clear certifications response:", response);
      
      if (response.data?.success) {
        toast({
          title: "Success",
          description: "All certifications cleared successfully"
        });
        return true;
      }
      
      toast({
        title: "Error",
        description: response.error || response.data?.message || "Failed to clear certifications",
        variant: "destructive"
      });
      
      return false;
    } catch (error) {
      console.error("Error clearing certifications:", error);
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
