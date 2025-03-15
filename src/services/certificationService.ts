
import mongoDbService from './mongoDbService';
import { apiService } from './apiService';

export class CertificationService {
  // Update user certifications
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.addCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Try MongoDB first
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
      
      return false;
    } catch (error) {
      console.error("Error in certification service:", error);
      return false;
    }
  }
  
  // Remove certifications
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.removeCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Try MongoDB first
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
      
      return false;
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
      
      return false;
    } catch (error) {
      console.error("Error clearing certifications:", error);
      return false;
    }
  }
  
  // Machine Safety Course certification management
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
  
  // Safety course certification management
  async addSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Adding safety certification for user ${userId}`);
    const SAFETY_MACHINE_ID = "3"; // Safety cabinet ID
    return this.addCertification(userId, SAFETY_MACHINE_ID);
  }
  
  async removeSafetyCertification(userId: string): Promise<boolean> {
    console.log(`Removing safety certification for user ${userId}`);
    const SAFETY_MACHINE_ID = "3"; // Safety cabinet ID
    return this.removeCertification(userId, SAFETY_MACHINE_ID);
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
      
      return false;
    } catch (error) {
      console.error("Error checking certification:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const certificationService = new CertificationService();
