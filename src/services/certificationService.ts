
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { apiService } from './apiService';
import { toast } from '@/components/ui/use-toast';

export class CertificationService {
  // Update user certifications
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.addCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Try API first
      const response = await apiService.addCertification(userId, machineId);
      if (response.data?.success) {
        console.log('Successfully added certification via API');
        return true;
      }
      
      // Try MongoDB next
      const success = await mongoDbService.updateUserCertifications(userId, machineId);
      if (success) {
        console.log('Successfully added certification via MongoDB');
        return true;
      }
    } catch (error) {
      console.error("Error adding certification:", error);
      // Continue with localStorage if previous methods fail
    }
    
    // Fallback to localStorage
    const result = localStorageService.addCertification(userId, machineId);
    console.log(`Added certification via localStorage: ${result}`);
    return result;
  }
  
  // Remove certifications
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.removeCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Try API first
      const response = await apiService.removeCertification(userId, machineId);
      if (response.data?.success) {
        console.log('Successfully removed certification via API');
        return true;
      }
      
      // Try direct MongoDB access
      const mongoSuccess = await mongoDbService.removeUserCertification(userId, machineId);
      if (mongoSuccess) {
        console.log('Successfully removed certification via MongoDB');
        return true;
      }
    } catch (error) {
      console.error("Error removing certification:", error);
      // Continue with localStorage if API fails
    }
    
    // Fallback to localStorage
    try {
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      if (user.certifications.includes(machineId)) {
        user.certifications = user.certifications.filter(id => id !== machineId);
        const updated = localStorageService.updateUser(userId, { certifications: user.certifications });
        console.log(`Removed certification via localStorage: ${updated}`);
        return updated;
      }
      return true; // Already not certified
    } catch (error) {
      console.error("Error removing certification from localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to remove certification",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Safety course certification management
  async addSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Adding safety certification for user ${userId}`);
    const SAFETY_MACHINE_ID = "5"; // Safety cabinet ID
    
    try {
      // Try API first
      const response = await apiService.addSafetyCertification(userId);
      if (response.data?.success) {
        console.log('Successfully added safety certification via API');
        return true;
      }
    } catch (error) {
      console.log('API method failed, falling back to regular certification methods');
    }
    
    // Fallback to regular certification methods with the safety machine ID
    return this.addCertification(userId, SAFETY_MACHINE_ID);
  }
  
  async removeSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Removing safety certification for user ${userId}`);
    const SAFETY_MACHINE_ID = "5"; // Safety cabinet ID
    
    try {
      // Try API first
      const response = await apiService.removeSafetyCertification(userId);
      if (response.data?.success) {
        console.log('Successfully removed safety certification via API');
        return true;
      }
    } catch (error) {
      console.log('API method failed, falling back to regular certification methods');
    }
    
    // Fallback to regular certification removal with the safety machine ID
    return this.removeCertification(userId, SAFETY_MACHINE_ID);
  }
  
  // Check if user has a specific certification
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // Try API first
      const response = await apiService.checkCertification(userId, machineId);
      if (response.data !== null && response.error === null) {
        return !!response.data;
      }
    } catch (error) {
      console.error("Error checking certification via API:", error);
    }
    
    // Fallback to direct data checks
    try {
      const user = await mongoDbService.findUserById(userId);
      if (user && user.certifications && user.certifications.includes(machineId)) {
        return true;
      }
    } catch (error) {
      console.error("Error checking certification via MongoDB:", error);
    }
    
    // Final fallback to localStorage
    const user = localStorageService.findUserById(userId);
    return user ? user.certifications.includes(machineId) : false;
  }
}

// Create a singleton instance
export const certificationService = new CertificationService();
