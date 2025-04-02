
import { apiService } from './apiService';

// Define constant certifications for reference
const CERTIFICATIONS = {
  LASER_CUTTER: { id: "1", name: "Laser Cutter" },
  ULTIMAKER: { id: "2", name: "Ultimaker" },
  X1_E_CARBON_3D_PRINTER: { id: "3", name: "X1 E Carbon 3D Printer" },
  BAMBU_LAB_X1_E: { id: "4", name: "Bambu Lab X1 E" },
  SAFETY_CABINET: { id: "5", name: "Safety Cabinet" },
  SAFETY_COURSE: { id: "6", name: "Safety Course" },
};

// Default certifications for demo/development purposes
const DEFAULT_ADMIN_CERTIFICATIONS = ["1", "2", "3", "4", "5", "6"];
const DEFAULT_USER_CERTIFICATIONS = ["1", "2", "3", "4", "5", "6"];

// Map of user IDs to their fixed certifications - for demo/development only
const FIXED_USER_CERTIFICATIONS = {
  "1": [...DEFAULT_ADMIN_CERTIFICATIONS],
  "2": [...DEFAULT_USER_CERTIFICATIONS],
  "admin": [...DEFAULT_ADMIN_CERTIFICATIONS],
  "user": [...DEFAULT_USER_CERTIFICATIONS]
};

export class CertificationService {
  async addCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      console.log(`CertificationService: Adding certification ${certificationId} for user ${userId}`);
      
      if (!userId || !certificationId) {
        console.error('Invalid userId or certificationId');
        return false;
      }

      // Ensure IDs are strings
      const stringUserId = String(userId);
      const stringCertId = String(certificationId);
      
      console.log(`Using string IDs: userID=${stringUserId}, machineID=${stringCertId}`);
      
      // For demo/development purposes, return success
      console.log(`Demo mode: Simulating successful certification add for user ${userId}, cert ${certificationId}`);
      return true;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      console.log(`CertificationService: Removing certification ${certificationId} for user ${userId}`);
      
      if (!userId || !certificationId) {
        console.error('Invalid userId or certificationId');
        return false;
      }

      // Ensure IDs are strings
      const stringUserId = userId.toString();
      const stringCertId = certificationId.toString();
      
      console.log(`Using string IDs: userID=${stringUserId}, machineID=${stringCertId}`);
      
      // For demo/development purposes, return success
      console.log(`Demo mode: Simulating successful certification removal for user ${userId}, cert ${certificationId}`);
      return true;
    } catch (error) {
      console.error('Certification removal failed:', error);
      return false;
    }
  }

  async clearAllCertifications(userId: string): Promise<boolean> {
    try {
      console.log(`CertificationService: Clearing all certifications for user ${userId}`);
      
      if (!userId) {
        console.error('Invalid userId');
        return false;
      }

      // Ensure ID is string
      const stringUserId = userId.toString();
      
      console.log(`Using string ID: userID=${stringUserId}`);
      
      // For demo/development purposes, return success
      console.log(`Demo mode: Simulating successful clearing of certifications for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      return false;
    }
  }
  
  async getUserCertifications(userId: string): Promise<string[]> {
    console.log(`CertificationService: Getting certifications for user ${userId}`);
    
    if (!userId) {
      console.error('Invalid userId');
      return this.getFixedCertifications(userId);
    }
    
    // Ensure ID is string
    const stringUserId = userId.toString();
    
    console.log(`Using string ID: userID=${stringUserId}`);
    
    // Skip API call and use fixed certifications for demo/development
    console.log("Using fixed certifications for demo/development");
    return this.getFixedCertifications(userId);
  }

  // Helper method to get fixed certifications for a user (for demo purposes only)
  private getFixedCertifications(userId: string): string[] {
    console.log(`Getting fixed certifications for user ${userId}`);
    
    // Return specific certs based on user ID if we have them defined
    if (userId && FIXED_USER_CERTIFICATIONS[userId]) {
      return [...FIXED_USER_CERTIFICATIONS[userId]];
    }
    
    // Default to all certifications
    return [...DEFAULT_USER_CERTIFICATIONS];
  }

  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`CertificationService: Checking certification for user ${userId}, machine ${machineId}`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId');
        return false;
      }
      
      // Ensure IDs are strings
      const stringUserId = userId.toString();
      const stringMachineId = machineId.toString();
      
      // Special handling for safety machines (IDs 5 and 6)
      if (stringMachineId === "5" || stringMachineId === "6") {
        return true;
      }
      
      // Check against fixed user's certifications
      const userCerts = await this.getUserCertifications(stringUserId);
      
      // Check if the user has the certification
      return userCerts.includes(stringMachineId);
    } catch (error) {
      console.error('Error checking certification:', error);
      return false;
    }
  }
  
  getAllCertifications() {
    return Object.values(CERTIFICATIONS);
  }
}

export const certificationService = new CertificationService();
