
import { apiService } from './apiService';
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';

class CertificationService {
  /**
   * Add certification to a user - tries multiple approaches
   */
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.addCertification: userId=${userId}, machineId=${machineId}`);
    
    // Try multiple approaches in sequence to ensure certification is added
    try {
      // First try the API
      const response = await apiService.addCertification(userId, machineId);
      if (response.success) {
        console.log("Added certification via API");
        return true;
      }
      
      // If API fails, try MongoDB directly
      try {
        const success = await mongoDbService.updateUserCertifications(userId, machineId);
        if (success) {
          console.log("Added certification via MongoDB");
          return true;
        }
      } catch (mongoError) {
        console.error("MongoDB certification error:", mongoError);
      }
      
      // Last resort - try localStorage
      try {
        const user = localStorageService.findUserById(userId);
        if (user) {
          if (!user.certifications.includes(machineId)) {
            user.certifications.push(machineId);
            const updated = await localStorageService.updateUser(userId, { certifications: user.certifications });
            if (updated) {
              console.log("Added certification via localStorage");
              return true;
            }
          } else {
            console.log("User already has this certification");
            return true; // Already certified is considered success
          }
        }
      } catch (localError) {
        console.error("LocalStorage certification error:", localError);
      }
      
      console.error("All certification methods failed");
      return false;
    } catch (error) {
      console.error("Error in addCertification:", error);
      return false;
    }
  }
  
  /**
   * Remove certification from a user - tries multiple approaches
   */
  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    console.log(`CertificationService.removeCertification: userId=${userId}, machineId=${machineId}`);
    
    try {
      // First try the API
      const response = await apiService.removeCertification(userId, machineId);
      if (response.success) {
        console.log("Removed certification via API");
        return true;
      }
      
      // If API fails, try MongoDB directly
      try {
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          const updatedCertifications = user.certifications.filter(id => id !== machineId);
          const success = await mongoDbService.updateUser(userId, { certifications: updatedCertifications });
          if (success) {
            console.log("Removed certification via MongoDB");
            return true;
          }
        }
      } catch (mongoError) {
        console.error("MongoDB remove certification error:", mongoError);
      }
      
      // Last resort - try localStorage
      try {
        const user = localStorageService.findUserById(userId);
        if (user) {
          const updatedCertifications = user.certifications.filter(id => id !== machineId);
          const updated = await localStorageService.updateUser(userId, { certifications: updatedCertifications });
          if (updated) {
            console.log("Removed certification via localStorage");
            return true;
          }
        }
      } catch (localError) {
        console.error("LocalStorage remove certification error:", localError);
      }
      
      console.error("All certification removal methods failed");
      return false;
    } catch (error) {
      console.error("Error in removeCertification:", error);
      return false;
    }
  }
  
  /**
   * Check if a user has a specific certification
   */
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // Try to get user's certifications
      const user = await mongoDbService.getUserById(userId);
      if (user && user.certifications) {
        return user.certifications.includes(machineId);
      }
      
      // Fallback to localStorage
      const localUser = localStorageService.findUserById(userId);
      if (localUser && localUser.certifications) {
        return localUser.certifications.includes(machineId);
      }
      
      return false;
    } catch (error) {
      console.error("Error checking certification:", error);
      return false;
    }
  }
}

export const certificationService = new CertificationService();
