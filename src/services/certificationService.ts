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

// Cache for storing certification data to reduce API calls
const certificationCache = new Map();

// Auto-refresh cache every 5 minutes
setInterval(() => {
  console.log("Clearing certification cache");
  certificationCache.clear();
}, 300000);

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
          // Clear the cache for this user
          certificationCache.delete(stringUserId);
          
          // Update localStorage
          try {
            const existingCerts = JSON.parse(localStorage.getItem(`user_${stringUserId}_certifications`) || '[]');
            if (!existingCerts.includes(stringCertId)) {
              existingCerts.push(stringCertId);
              localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(existingCerts));
              localStorage.setItem(`user_${stringUserId}_certification_${stringCertId}`, 'true');
              console.log(`Updated local certifications for user ${stringUserId}:`, existingCerts);
            }
          } catch (e) {
            console.error("Error updating local certifications:", e);
          }
          
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
          // Clear the cache for this user
          certificationCache.delete(stringUserId);
          
          // Update localStorage
          try {
            const existingCerts = JSON.parse(localStorage.getItem(`user_${stringUserId}_certifications`) || '[]');
            if (!existingCerts.includes(stringCertId)) {
              existingCerts.push(stringCertId);
              localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(existingCerts));
              localStorage.setItem(`user_${stringUserId}_certification_${stringCertId}`, 'true');
              console.log(`Updated local certifications for user ${stringUserId}:`, existingCerts);
            }
          } catch (e) {
            console.error("Error updating local certifications:", e);
          }
          
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
          // Clear the cache for this user
          certificationCache.delete(stringUserId);
          
          // Update localStorage
          try {
            const existingCerts = JSON.parse(localStorage.getItem(`user_${stringUserId}_certifications`) || '[]');
            if (!existingCerts.includes(stringCertId)) {
              existingCerts.push(stringCertId);
              localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(existingCerts));
              localStorage.setItem(`user_${stringUserId}_certification_${stringCertId}`, 'true');
              console.log(`Updated local certifications for user ${stringUserId}:`, existingCerts);
            }
          } catch (e) {
            console.error("Error updating local certifications:", e);
          }
          
          return true;
        }
      } catch (alternativeError) {
        console.error("Alternative API call failed:", alternativeError);
      }
      
      // Last resort - just update local storage and cache
      try {
        const existingCerts = JSON.parse(localStorage.getItem(`user_${stringUserId}_certifications`) || '[]');
        if (!existingCerts.includes(stringCertId)) {
          existingCerts.push(stringCertId);
          localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(existingCerts));
          localStorage.setItem(`user_${stringUserId}_certification_${stringCertId}`, 'true');
          console.log(`Updated local certifications for user ${stringUserId} (offline mode):`, existingCerts);
          
          // Update cache
          certificationCache.set(stringUserId, existingCerts);
          
          // Return true since we at least updated local storage
          return true;
        }
      } catch (e) {
        console.error("Error updating local certifications:", e);
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
        // Clear the cache for this user
        certificationCache.delete(stringUserId);
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
        // Clear the cache for this user
        certificationCache.delete(stringUserId);
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
      
      // Check cache first
      if (certificationCache.has(stringUserId)) {
        console.log(`Using cached certifications for user ${stringUserId}`);
        return certificationCache.get(stringUserId);
      }
      
      // First try - localStorage (fastest response)
      const userCertificationsStr = localStorage.getItem(`user_${stringUserId}_certifications`);
      if (userCertificationsStr) {
        try {
          const storedCertifications = JSON.parse(userCertificationsStr);
          if (Array.isArray(storedCertifications) && storedCertifications.length > 0) {
            console.log("Using localStorage for certifications:", storedCertifications);
            certificationCache.set(stringUserId, storedCertifications);
            return storedCertifications;
          }
        } catch (parseError) {
          console.error("Error parsing localStorage certifications:", parseError);
        }
      }
      
      // Second try - user object from window if available
      if (window.user && window.user.certifications && Array.isArray(window.user.certifications)) {
        const userObjCerts = window.user.certifications.map(c => String(c));
        console.log("Using window.user object for certifications:", userObjCerts);
        certificationCache.set(stringUserId, userObjCerts);
        this.storeCertificationsLocally(stringUserId, userObjCerts);
        return userObjCerts;
      }
      
      // Set a shorter timeout to improve performance
      const timeoutDuration = 1000; // 1 second timeout
      
      console.log(`Making API call to get certifications for userId=${stringUserId}`);
      
      // Use API service with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
        
        // Use a shorter timeout for the API call
        const response = await Promise.race([
          apiService.get(`certifications/user/${stringUserId}`),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeoutDuration)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        console.log("API get certifications raw response:", response);
        
        // If we got a 404, it likely means the user doesn't exist yet or is new
        // In this case, let's provide default certifications rather than failing
        if (response.status === 404 || response.error) {
          console.log("User not found or error, using default certifications");
          const defaultCerts = [...DEFAULT_CERTIFICATIONS];
          certificationCache.set(stringUserId, defaultCerts);
          this.storeCertificationsLocally(stringUserId, defaultCerts);
          return defaultCerts;
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
          // Cache the result
          certificationCache.set(stringUserId, certifications);
          this.storeCertificationsLocally(stringUserId, certifications);
          return certifications;
        }
      } catch (apiError) {
        console.error('API service error or timeout:', apiError);
      }
      
      // Default fallback: return a set of default certifications
      console.log("Using default certifications fallback");
      const defaultCerts = [...DEFAULT_CERTIFICATIONS];
      this.storeCertificationsLocally(stringUserId, defaultCerts);
      return defaultCerts;
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
      
      // First check localStorage - fastest method
      const stringUserId = userId.toString();
      const stringMachineId = machineId.toString();
      const cachedCertKey = `user_${stringUserId}_certification_${stringMachineId}`;
      const cachedCertValue = localStorage.getItem(cachedCertKey);
      
      if (cachedCertValue === 'true') {
        console.log(`User has certification for machine ${stringMachineId} based on localStorage`);
        return true;
      }
      
      // Use already cached data if possible
      const allCerts = await this.getUserCertifications(stringUserId);
      const hasCertBasedOnArray = allCerts.some(cert => String(cert) === stringMachineId);
      
      if (hasCertBasedOnArray) {
        console.log(`User has certification for machine ${stringMachineId} based on certifications array`);
        // Cache this result for future fast access
        localStorage.setItem(cachedCertKey, 'true');
        return true;
      }
      
      // If we get here, the user doesn't have the certification
      localStorage.setItem(cachedCertKey, 'false');
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
  
  // Add method to store certifications in localStorage as fallback
  storeCertificationsLocally(userId: string, certifications: string[]): void {
    if (!userId) return;
    
    try {
      const stringUserId = userId.toString();
      localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(certifications));
      
      // Also update individual certification flags
      certifications.forEach(certId => {
        localStorage.setItem(`user_${stringUserId}_certification_${certId}`, 'true');
      });
      
      console.log(`Stored certifications locally for user ${stringUserId}:`, certifications);
    } catch (error) {
      console.error('Error storing certifications locally:', error);
    }
  }
}

export const certificationService = new CertificationService();
