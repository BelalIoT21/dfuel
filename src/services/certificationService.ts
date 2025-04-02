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
        const directResponse = await fetch(`${import.meta.env.VITE_API_URL}/certifications`, {
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
        const alternativeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/certifications`, {
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
        return [];
      }
      
      // Ensure ID is string
      const stringUserId = userId.toString();
      
      console.log(`Making API call to get certifications for userId=${stringUserId}`);
      
      // Try direct fetch first (most reliable)
      try {
        // Try both API URL formats
        const apiUrls = [
          import.meta.env.VITE_API_URL || 'http://localhost:5000',
          (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(':5000', ':4000')
        ];
        
        for (const apiUrl of apiUrls) {
          try {
            console.log(`Attempting to fetch certifications from: ${apiUrl}/api/certifications/user/${stringUserId}`);
            const response = await fetch(`${apiUrl}/api/certifications/user/${stringUserId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (response.ok) {
              const certifications = await response.json();
              console.log('Direct fetch certifications:', certifications);
              
              if (Array.isArray(certifications)) {
                // Make sure all certification IDs are strings
                const normalizedCerts = certifications.map(cert => {
                  if (typeof cert === 'object' && cert !== null) {
                    return cert._id ? cert._id.toString() : 
                          cert.id ? cert.id.toString() : 
                          String(cert);
                  }
                  return cert.toString ? cert.toString() : String(cert);
                });
                
                console.log('Normalized certifications:', normalizedCerts);
                return normalizedCerts;
              }
            }
          } catch (urlError) {
            console.log(`Error fetching from ${apiUrl}:`, urlError);
          }
        }
      } catch (directFetchError) {
        console.error('Direct fetch error:', directFetchError);
      }
      
      // Fallback to apiService
      try {
        console.log('Falling back to apiService.getUserCertifications');
        const response = await apiService.getUserCertifications(stringUserId);
        console.log("API get certifications raw response:", response);
        
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
        console.error('API service error:', apiError);
      }
      
      // Fallback to generic get with different paths
      try {
        console.log('Trying generic GET with different paths');
        const endpoints = [
          `certifications/user/${stringUserId}`,
          `api/certifications/user/${stringUserId}`
        ];
        
        for (const endpoint of endpoints) {
          try {
            const response = await apiService.get(endpoint);
            console.log(`Response from ${endpoint}:`, response);
            
            if (response.data && Array.isArray(response.data)) {
              const certifications = response.data.map((cert: any) => 
                typeof cert === 'object' ? (cert._id || cert.id || cert).toString() : cert.toString()
              );
              console.log("Generic call certifications:", certifications);
              return certifications;
            }
          } catch (endpointError) {
            console.log(`Error with endpoint ${endpoint}:`, endpointError);
          }
        }
      } catch (genericError) {
        console.error('Generic GET error:', genericError);
      }
      
      console.log("All getUserCertifications attempts failed, returning empty array");
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
      
      // First get all certifications and check if this machine ID is included
      // This is more reliable than individual endpoint checks
      const allCerts = await this.getUserCertifications(stringUserId);
      const hasCertBasedOnArray = allCerts.some(cert => String(cert) === stringMachineId);
      
      console.log(`User has certification for machine ${stringMachineId}?: ${hasCertBasedOnArray} based on certifications array`);
      return hasCertBasedOnArray;
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
