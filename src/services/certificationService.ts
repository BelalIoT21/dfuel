import mongoDbService from './mongoDbService';
import { apiService } from './apiService';

// Define certification constants
const CERTIFICATIONS = {
  LASER_CUTTER: { id: "1", name: "Laser Cutter" },
  ULTIMAKER: { id: "2", name: "Ultimaker" },
  X1_E_CARBON_3D_PRINTER: { id: "3", name: "X1 E Carbon 3D Printer" },
  BAMBU_LAB_X1_E: { id: "4", name: "Bambu Lab X1 E" },
  SAFETY_CABINET: { id: "5", name: "Safety Cabinet" },
  SAFETY_COURSE: { id: "6", name: "Safety Course" },
};

export class CertificationService {
  // Add Laser Cutter certification
  async addLaserCutterCertification(userId: string): Promise<boolean> {
    return this.addCertification(userId, CERTIFICATIONS.LASER_CUTTER.id);
  }

  async removeLaserCutterCertification(userId: string): Promise<boolean> {
    return this.removeCertification(userId, CERTIFICATIONS.LASER_CUTTER.id);
  }

  // Add Ultimaker certification
  async addUltimakerCertification(userId: string): Promise<boolean> {
    return this.addCertification(userId, CERTIFICATIONS.ULTIMAKER.id);
  }

  async removeUltimakerCertification(userId: string): Promise<boolean> {
    return this.removeCertification(userId, CERTIFICATIONS.ULTIMAKER.id);
  }

  // Add X1 E Carbon 3D Printer certification
  async addX1ECarbon3DPrinterCertification(userId: string): Promise<boolean> {
    return this.addCertification(userId, CERTIFICATIONS.X1_E_CARBON_3D_PRINTER.id);
  }

  async removeX1ECarbon3DPrinterCertification(userId: string): Promise<boolean> {
    return this.removeCertification(userId, CERTIFICATIONS.X1_E_CARBON_3D_PRINTER.id);
  }

  // Add Bambu Lab X1 E certification
  async addBambuLabX1ECertification(userId: string): Promise<boolean> {
    return this.addCertification(userId, CERTIFICATIONS.BAMBU_LAB_X1_E.id);
  }

  async removeBambuLabX1ECertification(userId: string): Promise<boolean> {
    return this.removeCertification(userId, CERTIFICATIONS.BAMBU_LAB_X1_E.id);
  }

  // Add Safety Cabinet certification
  async addSafetyCabinetCertification(userId: string): Promise<boolean> {
    return this.addCertification(userId, CERTIFICATIONS.SAFETY_CABINET.id);
  }

  async removeSafetyCabinetCertification(userId: string): Promise<boolean> {
    return this.removeCertification(userId, CERTIFICATIONS.SAFETY_CABINET.id);
  }

  // Add Safety Course certification
  async addSafetyCourseCertification(userId: string): Promise<boolean> {
    return this.addCertification(userId, CERTIFICATIONS.SAFETY_COURSE.id);
  }

  async removeSafetyCourseCertification(userId: string): Promise<boolean> {
    return this.removeCertification(userId, CERTIFICATIONS.SAFETY_COURSE.id);
  }

  // Generic method to add a certification
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`Adding certification for user ${userId}, machine ${machineId}`);
    try {
      // Try MongoDB first
      const mongoSuccess = await mongoDbService.updateUserCertifications(userId, machineId);
      if (mongoSuccess) {
        console.log('Successfully added certification via MongoDB');
        return true;
      }

      // Fallback to API
      const apiResponse = await apiService.addCertification(userId, machineId);
      if (apiResponse?.data?.success) {
        console.log('Successfully added certification via API');
        return true;
      }

      console.error('Failed to add certification via both MongoDB and API');
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error; // Propagate error to UI layer
    }
  }

  // Generic method to remove a certification
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`Removing certification for user ${userId}, machine ${machineId}`);
    try {
      // Try MongoDB first
      const mongoSuccess = await mongoDbService.removeUserCertification(userId, machineId);
      if (mongoSuccess) {
        console.log('Successfully removed certification via MongoDB');
        return true;
      }

      // Fallback to API
      const apiResponse = await apiService.removeCertification(userId, machineId);
      if (apiResponse?.data?.success) {
        console.log('Successfully removed certification via API');
        return true;
      }

      console.error('Failed to remove certification via both MongoDB and API');
      return false;
    } catch (error) {
      console.error('Error removing certification:', error);
      throw error; // Propagate error to UI layer
    }
  }

  // Check if a user has a specific certification
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`Checking certification for user ${userId}, machine ${machineId}`);
    try {
      // Try MongoDB first
      const user = await mongoDbService.getUserById(userId);
      if (user && user.certifications?.includes(machineId)) {
        return true;
      }

      // Fallback to API
      const apiResponse = await apiService.checkCertification(userId, machineId);
      return apiResponse?.data || false;
    } catch (error) {
      console.error('Error checking certification:', error);
      throw error; // Propagate error to UI layer
    }
  }

  // Clear all certifications for a user
  async clearAllCertifications(userId: string): Promise<boolean> {
    console.log(`Clearing all certifications for user ${userId}`);
    try {
      // Try MongoDB first
      const mongoSuccess = await mongoDbService.clearUserCertifications(userId);
      if (mongoSuccess) {
        return true;
      }

      // Fallback to API
      const apiResponse = await apiService.clearCertifications(userId);
      return apiResponse?.data?.success || false;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      throw error; // Propagate error to UI layer
    }
  }
}

// Create a singleton instance
export const certificationService = new CertificationService();