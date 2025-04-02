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

// Default certifications to use as fallback when everything else fails
const DEFAULT_CERTIFICATIONS = ["6"]; // Safety course as default

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
      
      console.log(`Making API call to add certification with userId=${stringUserId}, machineId=${stringCertId}`);

      // First attempt - direct API call with correct endpoint
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const directResponse = await fetch(`${apiUrl}/api/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: stringUserId, machineId: stringCertId })
        });
        
        if (directResponse.ok) {
          console.log("Direct API call successful");
          return true;
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Second attempt - apiService method
      try {
        const response = await apiService.addCertification(stringUserId, stringCertId);
        console.log("API certification response:", response);
        
        // Handle both formats of success response
        if (response.data?.success || response.status === 200 || response.status === 201) {
          console.log(`API add certification succeeded for user ${userId}, cert ${certificationId}`);
          return true;
        }
      } catch (apiError) {
        console.error("API service call failed:", apiError);
      }
      
      // Third attempt - alternative endpoint 
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const alternativeResponse = await fetch(`${apiUrl}/api/api/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: stringUserId, machineId: stringCertId })
        });
        
        if (alternativeResponse.ok) {
          console.log("Alternative API call successful");
          return true;
        }
      } catch (alternativeError) {
        console.error("Alternative API call failed:", alternativeError);
      }
      
      console.log("All certification attempts failed");
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
      
      console.log(`Making API call to remove certification with userId=${stringUserId}, machineId=${stringCertId}`);

      // Use the removeCertification method from apiService with the correct parameter order
      const response = await apiService.removeCertification(stringUserId, stringCertId);
      
      console.log("API remove certification response:", response);
      
      // Handle both formats of success response
      if (response.data?.success || response.status === 200) {
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
      
      console.log(`Making API call to clear certifications for userId=${stringUserId}`);

      // Use the updated route format
      const response = await apiService.delete(`certifications/user/${stringUserId}/clear`);
      
      console.log("API clear certifications response:", response);
      
      // Handle both formats of success response
      if (response.data?.success || response.status === 200) {
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
        return DEFAULT_CERTIFICATIONS;
      }
      
      // Ensure ID is string
      const stringUserId = userId.toString();
      
      // Check if user object has certifications
      if (window.user && window.user.certifications && Array.isArray(window.user.certifications)) {
        const userObjCerts = window.user.certifications.map(c => String(c));
        console.log("Using window.user object for certifications:", userObjCerts);
        return userObjCerts;
      }
      
      // Set a shorter timeout to improve performance
      const timeoutDuration = 3000; // 3 second timeout
      
      console.log(`Making API call to get certifications for userId=${stringUserId}`);
      
      // Try different API endpoints to get certifications
      try {
        // Try endpoint without /api prefix first
        const directResponse = await fetch(`${import.meta.env.VITE_API_URL}/certifications/user/${stringUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (directResponse.ok) {
          const certData = await directResponse.json();
          console.log("Direct API call successful:", certData);
          if (Array.isArray(certData)) {
            return certData.map(cert => String(cert));
          }
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Try to get certifications from the API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
        
        // Use API service with timeout
        const response = await Promise.race([
          apiService.get(`certifications/user/${stringUserId}`),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeoutDuration)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        console.log("API get certifications raw response:", response);
        
        // If we got a 404, it likely means the user doesn't exist yet or is new
        if (response.status === 404 || response.error) {
          console.log("User not found or error, using default certifications");
          return [...DEFAULT_CERTIFICATIONS];
        }
        
        if (response.data && Array.isArray(response.data)) {
          // Make sure all certification IDs are strings and handle objects properly
          const certifications = response.data.map(cert => {
            if (typeof cert === 'object' && cert !== null) {
              // If it's an object, extract the ID
              return cert._id ? cert._id.toString() : 
                    cert.id ? cert.id.toString() : 
                    String(cert);
            }
            return cert.toString ? cert.toString() : String(cert);
          });
          console.log("Processed certifications:", certifications);
          return certifications;
        }
      } catch (apiError) {
        console.error('API service error or timeout:', apiError);
      }
      
      // Try with /api prefix as a fallback
      try {
        const apiPrefixResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/certifications/user/${stringUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (apiPrefixResponse.ok) {
          const certData = await apiPrefixResponse.json();
          console.log("API prefix call successful:", certData);
          if (Array.isArray(certData)) {
            return certData.map(cert => String(cert));
          }
        }
      } catch (apiPrefixError) {
        console.error("API prefix call failed:", apiPrefixError);
      }
      
      // Default fallback: return a set of default certifications
      console.log("Using default certifications fallback");
      return [...DEFAULT_CERTIFICATIONS];
    } catch (error) {
      console.error('Error getting certifications:', error);
      return DEFAULT_CERTIFICATIONS;
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
      
      // Always get fresh certifications from the API
      const allCerts = await this.getUserCertifications(stringUserId);
      console.log(`User certifications for ${userId}:`, allCerts);
      
      const hasCertBasedOnArray = allCerts.some(cert => String(cert) === stringMachineId);
      
      if (hasCertBasedOnArray) {
        console.log(`User has certification for machine ${stringMachineId} based on certifications array`);
        return true;
      }
      
      // If we get here, the user doesn't have the certification
      console.log(`User does not have certification for machine ${stringMachineId}`);
      return false;
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
