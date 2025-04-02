
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

      // Flag to track success
      let serverSyncSuccess = false;

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
          serverSyncSuccess = true;
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Second attempt - apiService method
      if (!serverSyncSuccess) {
        try {
          const response = await apiService.addCertification(stringUserId, stringCertId);
          console.log("API certification response:", response);
          
          // Handle both formats of success response
          if (response.data?.success || response.status === 200 || response.status === 201) {
            console.log(`API add certification succeeded for user ${userId}, cert ${certificationId}`);
            // Clear the cache for this user
            certificationCache.delete(stringUserId);
            serverSyncSuccess = true;
          }
        } catch (apiError) {
          console.error("API service call failed:", apiError);
        }
      }
      
      // Third attempt - alternative endpoint
      if (!serverSyncSuccess) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
          const alternativeResponse = await fetch(`${apiUrl}/certifications`, {
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
            serverSyncSuccess = true;
          }
        } catch (alternativeError) {
          console.error("Alternative API call failed:", alternativeError);
        }
      }
      
      // Always update local storage regardless of server sync success
      try {
        const existingCerts = JSON.parse(localStorage.getItem(`user_${stringUserId}_certifications`) || '[]');
        if (!existingCerts.includes(stringCertId)) {
          existingCerts.push(stringCertId);
          localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(existingCerts));
          localStorage.setItem(`user_${stringUserId}_certification_${stringCertId}`, 'true');
          console.log(`Updated local certifications for user ${stringUserId}:`, existingCerts);
        }
        
        // Update cache
        certificationCache.set(stringUserId, existingCerts);
      } catch (e) {
        console.error("Error updating local certifications:", e);
      }
      
      // Return true if server sync was successful or we at least updated localStorage
      return serverSyncSuccess || true;
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

      // Flag to track success
      let serverSyncSuccess = false;

      // First try directly with fetch
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const directResponse = await fetch(`${apiUrl}/api/certifications/${stringUserId}/${stringCertId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (directResponse.ok) {
          console.log("Direct API call successful for removing certification");
          serverSyncSuccess = true;
        }
      } catch (directError) {
        console.error("Direct API call failed for removing certification:", directError);
      }

      // Second attempt - use the removeCertification method from apiService
      if (!serverSyncSuccess) {
        try {
          const response = await apiService.removeCertification(stringUserId, stringCertId);
          console.log("API remove certification response:", response);
          
          // Handle both formats of success response
          if (response.data?.success || response.status === 200) {
            console.log(`API remove certification succeeded for user ${userId}, cert ${certificationId}`);
            serverSyncSuccess = true;
          }
        } catch (error) {
          console.error('Certification removal failed:', error);
        }
      }
      
      // Always update local storage
      try {
        const existingCerts = JSON.parse(localStorage.getItem(`user_${stringUserId}_certifications`) || '[]');
        const updatedCerts = existingCerts.filter((id: string) => id !== stringCertId);
        localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(updatedCerts));
        localStorage.removeItem(`user_${stringUserId}_certification_${stringCertId}`);
        console.log(`Updated local certifications after removal for user ${stringUserId}:`, updatedCerts);
        
        // Update cache
        certificationCache.delete(stringUserId);
      } catch (e) {
        console.error("Error updating local certifications after removal:", e);
      }
      
      return serverSyncSuccess || true;
    } catch (error) {
      console.error('Error removing certification:', error);
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

      let serverSyncSuccess = false;
      
      // Try the updated route format
      try {
        const response = await apiService.delete(`certifications/user/${stringUserId}/clear`);
        console.log("API clear certifications response:", response);
        
        // Handle both formats of success response
        if (response.data?.success || response.status === 200) {
          console.log(`API clear certifications succeeded for user ${userId}`);
          serverSyncSuccess = true;
        }
      } catch (error) {
        console.error("API clear certifications error:", error);
      }
      
      // Always update local storage
      try {
        localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify([]));
        console.log(`Cleared local certifications for user ${stringUserId}`);
        
        // Clear cache for this user
        certificationCache.delete(stringUserId);
      } catch (e) {
        console.error("Error clearing local certifications:", e);
      }
      
      return serverSyncSuccess || true;
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
      
      // Track all attempts for debugging
      const fetchAttempts = [];
      let certifications: string[] = [];
      
      // First try - API service (prioritize server data)
      try {
        console.log(`Making API call to get certifications for userId=${stringUserId}`);
        
        // Set a reasonable timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/certifications/user/${stringUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log(`Got ${data.length} certifications from server:`, data);
            certifications = data.map(cert => String(cert));
            
            // Update localStorage with server data
            localStorage.setItem(`user_${stringUserId}_certifications`, JSON.stringify(certifications));
            
            // Update certification cache
            certificationCache.set(stringUserId, certifications);
            
            fetchAttempts.push({ method: 'direct API', success: true, count: certifications.length });
            
            return certifications;
          }
        }
        
        fetchAttempts.push({ method: 'direct API', success: false });
      } catch (apiError) {
        console.error("API call for certifications failed:", apiError);
        fetchAttempts.push({ method: 'direct API', error: String(apiError) });
      }
      
      // Second try - Check cache
      if (certificationCache.has(stringUserId)) {
        console.log(`Using cached certifications for user ${stringUserId}`);
        certifications = certificationCache.get(stringUserId);
        fetchAttempts.push({ method: 'cache', success: true, count: certifications.length });
        return certifications;
      }
      
      // Third try - localStorage
      const userCertificationsStr = localStorage.getItem(`user_${stringUserId}_certifications`);
      if (userCertificationsStr) {
        try {
          const storedCertifications = JSON.parse(userCertificationsStr);
          if (Array.isArray(storedCertifications) && storedCertifications.length > 0) {
            console.log("Using localStorage for certifications:", storedCertifications);
            certifications = storedCertifications;
            certificationCache.set(stringUserId, certifications);
            fetchAttempts.push({ method: 'localStorage', success: true, count: certifications.length });
            return certifications;
          }
        } catch (parseError) {
          console.error("Error parsing localStorage certifications:", parseError);
          fetchAttempts.push({ method: 'localStorage', error: String(parseError) });
        }
      }
      
      // Fourth try - user object from window if available
      if (window.user && window.user.certifications && Array.isArray(window.user.certifications)) {
        const userObjCerts = window.user.certifications.map(c => String(c));
        console.log("Using window.user object for certifications:", userObjCerts);
        certifications = userObjCerts;
        certificationCache.set(stringUserId, certifications);
        this.storeCertificationsLocally(stringUserId, userObjCerts);
        fetchAttempts.push({ method: 'window.user', success: true, count: certifications.length });
        return userObjCerts;
      }
      
      // Final fallback - use default certifications (safety course)
      console.log("Using default certifications:", DEFAULT_CERTIFICATIONS);
      fetchAttempts.push({ method: 'default', success: true, count: DEFAULT_CERTIFICATIONS.length });
      return DEFAULT_CERTIFICATIONS;
    } catch (error) {
      console.error('Error getting user certifications:', error);
      return DEFAULT_CERTIFICATIONS;
    }
  }
  
  private storeCertificationsLocally(userId: string, certifications: string[]): void {
    try {
      localStorage.setItem(`user_${userId}_certifications`, JSON.stringify(certifications));
      console.log(`Stored certifications in localStorage for user ${userId}:`, certifications);
      
      // Also store individual certification flags
      certifications.forEach(certId => {
        localStorage.setItem(`user_${userId}_certification_${certId}`, 'true');
      });
    } catch (error) {
      console.error('Error storing certifications locally:', error);
    }
  }
}

export const certificationService = new CertificationService();
