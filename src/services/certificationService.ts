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
      
      return serverSyncSuccess;
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
          certificationCache.delete(stringUserId);
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
            certificationCache.delete(stringUserId);
            serverSyncSuccess = true;
          }
        } catch (error) {
          console.error('Certification removal failed:', error);
        }
      }
      
      return serverSyncSuccess;
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
          certificationCache.delete(stringUserId);
          serverSyncSuccess = true;
        }
      } catch (error) {
        console.error("API clear certifications error:", error);
      }
      
      return serverSyncSuccess;
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
      
      // Track all attempts for debugging
      const fetchAttempts = [];
      let certifications: string[] = [];
      
      // First try - Direct fetch with correct endpoint
      try {
        console.log(`Making API call to get certifications for userId=${stringUserId}`);
        
        // Set a reasonable timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
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
            
            // Update certification cache
            certificationCache.set(stringUserId, certifications);
            
            fetchAttempts.push({ method: 'direct API', success: true, count: certifications.length });
            
            console.log('Returning certifications:', certifications);
            return certifications;
          }
        }
        
        fetchAttempts.push({ method: 'direct API', success: false });
      } catch (apiError) {
        console.error("API call for certifications failed:", apiError);
        fetchAttempts.push({ method: 'direct API', error: String(apiError) });
      }
      
      // Check cache and other fallbacks
      if (certificationCache.has(stringUserId)) {
        console.log(`Using cached certifications for user ${stringUserId}`);
        certifications = certificationCache.get(stringUserId);
        fetchAttempts.push({ method: 'cache', success: true, count: certifications.length });
        return certifications;
      }
      
      // Third try - user object from window if available
      if (window.user && window.user.certifications && Array.isArray(window.user.certifications)) {
        const userObjCerts = window.user.certifications.map(c => String(c));
        console.log("Using window.user object for certifications:", userObjCerts);
        certifications = userObjCerts;
        certificationCache.set(stringUserId, certifications);
        fetchAttempts.push({ method: 'window.user', success: true, count: certifications.length });
        return userObjCerts;
      }
      
      // Final fallback - use default certifications (safety course)
      console.log("Using default certifications:", DEFAULT_CERTIFICATIONS);
      fetchAttempts.push({ method: 'default', success: true, count: DEFAULT_CERTIFICATIONS.length });
      return DEFAULT_CERTIFICATIONS;
    } catch (error) {
      console.error('Error getting user certifications:', error);
      return [];
    }
  }
  
  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Checking certification for user ${userId} and machine ${machineId}`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId');
        return false;
      }
      
      // Ensure IDs are strings
      const stringUserId = userId.toString();
      const stringMachineId = machineId.toString();
      
      // Try direct API first
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/certifications/check/${stringUserId}/${stringMachineId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`Direct API certification check result:`, result);
          return !!result; // Convert to boolean
        } else {
          console.log(`API check certification returned status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error checking certification via direct API:', error);
      }
      
      // Fallback: Get all certifications and check
      const certifications = await this.getUserCertifications(stringUserId);
      console.log('Retrieved certifications for check:', certifications, 'Looking for:', stringMachineId);
      
      const hasCertification = certifications.includes(stringMachineId);
      console.log(`User ${stringUserId} ${hasCertification ? 'has' : 'does not have'} certification ${stringMachineId}`);
      return hasCertification;
    } catch (error) {
      console.error('Error checking certification:', error);
      return false;
    }
  }
}

export const certificationService = new CertificationService();
