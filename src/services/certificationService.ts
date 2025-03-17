
import { apiService } from './apiService';

const CERTIFICATIONS = {
  LASER_CUTTER: { id: "1", name: "Laser Cutter" },
  ULTIMAKER: { id: "2", name: "Ultimaker" },
  X1_E_CARBON_3D_PRINTER: { id: "3", name: "X1 E Carbon 3D Printer" },
  BAMBU_LAB_X1_E: { id: "4", name: "Bambu Lab X1 E" },
  SAFETY_CABINET: { id: "5", name: "Safety Cabinet" },
  SAFETY_COURSE: { id: "6", name: "Safety Course" },
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
      const stringUserId = userId.toString();
      const stringCertId = certificationId.toString();

      // Make the API call
      const response = await apiService.post('certifications', {
        userId: stringUserId,
        machineId: stringCertId
      });
      
      console.log("API certification response:", response);
      
      // Check for success response
      if (response.data?.success) {
        console.log(`API add certification succeeded for user ${userId}, cert ${certificationId}`);
        return true;
      }
      
      // Log error if unsuccessful
      console.error("API certification error:", response.error || "Unknown error");
      return false;
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

      // Make the API call
      const response = await apiService.delete(`certifications/${stringUserId}/${stringCertId}`);
      
      console.log("API remove certification response:", response);
      
      // Check for success response
      if (response.data?.success) {
        console.log(`API remove certification succeeded for user ${userId}, cert ${certificationId}`);
        return true;
      }
      
      // Log error if unsuccessful
      console.error("API certification removal error:", response.error || "Unknown error");
      return false;
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

      // Make the API call
      const response = await apiService.delete(`certifications/clear/${stringUserId}`);
      
      console.log("API clear certifications response:", response);
      if (response.data?.success) {
        console.log(`API clear certifications succeeded for user ${userId}`);
        return true;
      }
      
      // Log error if unsuccessful
      console.error("API clear certifications error:", response.error || "Unknown error");
      return false;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      return false;
    }
  }
  
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`CertificationService: Getting certifications for user ${userId}`);
      
      if (!userId) {
        console.error('Invalid userId');
        return [];
      }
      
      // Ensure ID is string
      const stringUserId = userId.toString();
      
      // Make the API call
      const response = await apiService.get(`certifications/user/${stringUserId}`);
      console.log("API get certifications response:", response);
      
      if (response.data && Array.isArray(response.data)) {
        // Make sure all certification IDs are strings
        const certifications = response.data.map(cert => cert.toString ? cert.toString() : String(cert));
        console.log("Received certifications from service:", certifications);
        return certifications;
      }
      
      // Log error if unsuccessful
      console.error("API get certifications error:", response.error || "Unknown error");
      return [];
    } catch (error) {
      console.error('Error getting certifications:', error);
      return [];
    }
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
      
      // Make the API call
      const response = await apiService.get(`certifications/check/${stringUserId}/${stringMachineId}`);
      console.log("API check certification response:", response);
      
      return !!response.data; // Convert to boolean
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
