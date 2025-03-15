
import mongoDbService from './mongoDbService';
import { apiService } from './apiService';
import { toast } from '@/components/ui/use-toast';

export class CertificationService {
  // Update user certifications
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.addCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Only use MongoDB - no fallback
      try {
        // Direct MongoDB connection is preferred
        const success = await mongoDbService.updateUserCertifications(userId, machineId);
        if (success) {
          console.log('Successfully added certification via MongoDB');
          return true;
        }
      } catch (mongoErr) {
        console.error("MongoDB error adding certification:", mongoErr);
        throw mongoErr; // Re-throw to be caught by outer try/catch
      }
      
      // If MongoDB direct connection failed, try API
      try {
        const response = await apiService.addCertification(userId, machineId);
        if (response && response.data?.success) {
          console.log('Successfully added certification via API');
          return true;
        }
      } catch (apiErr) {
        console.error("Error adding certification via API:", apiErr);
        throw apiErr; // Re-throw to be caught by outer try/catch
      }
      
      // If we get here, both methods failed but didn't throw
      console.error("Failed to add certification - no method succeeded");
      return false;
    } catch (error) {
      console.error("Error in certification service:", error);
      toast({
        title: "Certification Error",
        description: "Failed to add certification",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Remove certifications
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.removeCertification: userId=${userId}, machineId=${machineId}`);
    try {
      // Only use MongoDB - no fallback
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
        throw mongoErr; // Re-throw to be caught by outer try/catch
      }
      
      // If MongoDB direct connection failed, try API
      try {
        const response = await apiService.removeCertification(userId, machineId);
        if (response && response.data?.success) {
          console.log('Successfully removed certification via API');
          return true;
        }
      } catch (apiErr) {
        console.error("Error removing certification via API:", apiErr);
        throw apiErr; // Re-throw to be caught by outer try/catch
      }
      
      // If we get here, both methods failed but didn't throw
      console.error("Failed to remove certification - no method succeeded");
      return false;
    } catch (error) {
      console.error("Error removing certification:", error);
      toast({
        title: "Certification Error",
        description: "Failed to remove certification",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Clear all certifications for a user
  async clearAllCertifications(userId: string): Promise<boolean> {
    console.log(`Clearing all certifications for user ${userId}`);
    try {
      // Only use MongoDB - no fallback
      const user = await mongoDbService.getUserById(userId);
      if (user) {
        // Clear all certifications
        const success = await mongoDbService.updateUser(userId, { certifications: [] });
        if (success) {
          console.log('Successfully cleared all certifications via MongoDB');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error clearing certifications:", error);
      toast({
        title: "Certification Error",
        description: "Failed to clear certifications",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Machine Safety Course certification management - simplified without special user handling
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
      // Only use MongoDB - no fallback
      const user = await mongoDbService.getUserById(userId);
      if (user) {
        return user.certifications.includes(machineId);
      }
      return false;
    } catch (error) {
      console.error("Error checking certification:", error);
      toast({
        title: "Certification Error",
        description: "Failed to check certification",
        variant: "destructive"
      });
      return false;
    }
  }
}

// Create a singleton instance
export const certificationService = new CertificationService();
