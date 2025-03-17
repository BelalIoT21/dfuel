
import { apiService } from '../apiService';
import { localStorageService } from '../localStorageService';
import { BaseService } from './baseService';
import { toast } from '@/components/ui/use-toast';

/**
 * Service that handles all certification-related database operations.
 */
export class CertificationDatabaseService extends BaseService {
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationDatabaseService.addCertification: userId=${userId}, machineId=${machineId}`);
    try {
      const response = await apiService.post('certifications', { userId, machineId });
      if (response.data?.success) {
        return true;
      }
      
      throw new Error(response.error || 'Unknown error occurred while adding certification');
    } catch (error) {
      console.error("API error, falling back to localStorage certification:", error);
      
      // Fallback to localStorage
      try {
        const user = localStorageService.findUserById(userId);
        if (!user) return false;
        
        if (!user.certifications.includes(machineId)) {
          user.certifications.push(machineId);
          console.log(`Adding certification ${machineId} to user ${userId}`);
          return localStorageService.updateUser(userId, { certifications: user.certifications });
        }
        
        return true; // Already certified
      } catch (storageError) {
        console.error("LocalStorage error:", storageError);
        toast({
          title: "Error",
          description: "Failed to add certification",
          variant: "destructive"
        });
        return false;
      }
    }
  }
  
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationDatabaseService.removeCertification: userId=${userId}, machineId=${machineId}`);
    try {
      const response = await apiService.delete(`certifications/${userId}/${machineId}`);
      if (response.data?.success) {
        return true;
      }
      
      throw new Error(response.error || 'Unknown error occurred while removing certification');
    } catch (error) {
      console.error("API error, falling back to localStorage:", error);
      
      // Fallback to localStorage
      try {
        const user = localStorageService.findUserById(userId);
        if (!user) return false;
        
        if (user.certifications.includes(machineId)) {
          user.certifications = user.certifications.filter(id => id !== machineId);
          console.log(`Removing certification ${machineId} from user ${userId}`);
          return localStorageService.updateUser(userId, { certifications: user.certifications });
        }
        
        return true; // Already not certified
      } catch (storageError) {
        console.error("LocalStorage error:", storageError);
        toast({
          title: "Error",
          description: "Failed to remove certification",
          variant: "destructive"
        });
        return false;
      }
    }
  }
  
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      const response = await apiService.get(`certifications/user/${userId}`);
      if (response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Unknown error occurred while getting user certifications');
    } catch (error) {
      console.error("API error, falling back to localStorage:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserById(userId);
      return user ? user.certifications : [];
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
