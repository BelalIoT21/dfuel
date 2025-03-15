
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { apiService } from './apiService';

export class CertificationService {
  // Update user certifications
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.addCertification: userId=${userId}, machineId=${machineId}`);
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
      
      // Always add the certification, even if it already exists
      // This helps overcome issues where the certification list isn't being updated properly
      if (!user.certifications) {
        user.certifications = [];
      }
      
      // Remove it first to ensure no duplicates
      user.certifications = user.certifications.filter(id => id !== machineId);
      
      // Add the certification
      user.certifications.push(machineId);
      
      // Update the user
      const updated = localStorageService.updateUser(userId, { certifications: user.certifications });
      console.log(`Added certification via localStorage: ${updated}`);
      return updated;
    } catch (error) {
      console.error("Error in certification service:", error);
      return false;
    }
  }
  
  // Remove certifications
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.removeCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Try MongoDB first - ALWAYS PRIORITIZE MONGODB
      try {
        // For MongoDB, we need a special remove certification method
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          // Filter out the certification
          const updatedCertifications = user.certifications.filter(id => id !== machineId);
          // Update the user with the new certifications list
          const success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
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
  
  // Clear all certifications for a user
  async clearAllCertifications(userId: string): Promise<boolean> {
    console.log(`Clearing all certifications for user ${userId}`);
    try {
      // Try MongoDB first
      try {
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          // Clear all certifications
          const success = await mongoDbService.updateUser(userId, { certifications: [] });
          if (success) {
            console.log('Successfully cleared all certifications via MongoDB');
            return true;
          }
        }
      } catch (mongoErr) {
        console.error("MongoDB error clearing certifications:", mongoErr);
      }
      
      // Last resort - localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      // Clear all certifications
      const updated = localStorageService.updateUser(userId, { certifications: [] });
      console.log(`Cleared all certifications via localStorage: ${updated}`);
      return updated;
    } catch (error) {
      console.error("Error clearing certifications:", error);
      return false;
    }
  }
  
  // Machine Safety Course certification management - simplified without special user handling
  async addMachineSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Adding machine safety course certification for user ${userId}`);
    const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
    
    // Just add the certification directly for all users
    return this.addCertification(userId, MACHINE_SAFETY_ID);
  }
  
  async removeMachineSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Removing machine safety course certification for user ${userId}`);
    const MACHINE_SAFETY_ID = "6"; // Machine Safety Course ID
    
    // Just remove the certification directly for all users
    return this.removeCertification(userId, MACHINE_SAFETY_ID);
  }
}

// Create a singleton instance
export const certificationService = new CertificationService();
