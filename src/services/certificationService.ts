
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { apiService } from './apiService';
import { useToast } from '@/hooks/use-toast';

export class CertificationService {
  // Update user certifications
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.addCertification: userId=${userId}, machineId=${machineId}`);
    console.log(`Adding certification for user ${userId}, machine ${machineId}`);
    try {
      // Try MongoDB first - ALWAYS PRIORITIZE MONGODB
      try {
        // Direct MongoDB connection is preferred
        const success = await mongoDbService.updateUserCertifications(userId, machineId);
        if (success) {
          console.log('Successfully added certification via MongoDB');
          return true;
        }
      } catch (mongoErr) {
        console.error("MongoDB error adding certification:", mongoErr);
      }
      
      // Then try API
      try {
        const response = await apiService.addCertification(userId, machineId);
        if (response && response.data?.success) {
          console.log('Successfully added certification via API');
          return true;
        }
      } catch (apiErr) {
        console.error("Error adding certification via API:", apiErr);
      }
      
      // Last resort - localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) {
        console.error("User not found in localStorage");
        return false;
      }
      
      // Check if user already has this certification
      if (!user.certifications.includes(machineId)) {
        // Add the certification
        user.certifications.push(machineId);
        // Update the user
        const updated = localStorageService.updateUser(userId, { certifications: user.certifications });
        console.log(`Added certification via localStorage: ${updated}`);
        return updated;
      }
      
      return true; // User already has certification
    } catch (error) {
      console.error("Error in certification service:", error);
      return false;
    }
  }
  
  // Remove certifications
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.removeCertification: userId=${userId}, machineId=${machineId}`);
    console.log(`Removing certification for user ${userId}, machine ${machineId}`);
    try {
      // Try MongoDB first - ALWAYS PRIORITIZE MONGODB
      try {
        // For MongoDB, we need a special remove certification method
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          // Filter out the certification
          const updatedCertifications = user.certifications.filter(id => id !== machineId);
          // Update the user with the new certifications list
          const success = await mongoDbService.updateUser(user._id, { certifications: updatedCertifications });
          if (success) {
            console.log('Successfully removed certification via MongoDB');
            return true;
          }
        }
      } catch (mongoErr) {
        console.error("MongoDB error removing certification:", mongoErr);
      }
      
      // Then try API
      try {
        const response = await apiService.removeCertification(userId, machineId);
        if (response && response.data?.success) {
          console.log('Successfully removed certification via API');
          return true;
        }
      } catch (apiErr) {
        console.error("Error removing certification via API:", apiErr);
      }
      
      // Last resort - localStorage
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
      console.error("Error removing certification:", error);
      return false;
    }
  }
  
  // Safety course certification management - uses the same methods as other certifications
  async addSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Adding safety certification for user ${userId}`);
    const SAFETY_MACHINE_ID = "5"; // Safety cabinet ID
    return this.addCertification(userId, SAFETY_MACHINE_ID);
  }
  
  async removeSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Removing safety certification for user ${userId}`);
    const SAFETY_MACHINE_ID = "5"; // Safety cabinet ID
    return this.removeCertification(userId, SAFETY_MACHINE_ID);
  }
  
  // Machine Safety Course certification management - uses the same methods as other certifications
  async addMachineSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Adding machine safety course certification for user ${userId}`);
    const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
    return this.addCertification(userId, MACHINE_SAFETY_ID);
  }
  
  async removeMachineSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Removing machine safety course certification for user ${userId}`);
    const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
    return this.removeCertification(userId, MACHINE_SAFETY_ID);
  }
  
  // Check if user has a specific certification
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // Try MongoDB first
      try {
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          return user.certifications.includes(machineId);
        }
      } catch (mongoErr) {
        console.error("MongoDB error checking certification:", mongoErr);
      }
      
      // Then try API
      try {
        const response = await apiService.checkCertification(userId, machineId);
        if (response.data !== null && response.error === null) {
          return !!response.data;
        }
      } catch (apiErr) {
        console.error("Error checking certification via API:", apiErr);
      }
      
      // Last resort - localStorage
      const user = localStorageService.findUserById(userId);
      return user ? user.certifications.includes(machineId) : false;
    } catch (error) {
      console.error("Error checking certification:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const certificationService = new CertificationService();
