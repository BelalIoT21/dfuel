
import { apiService } from '../apiService';

class CertificationDatabaseService {
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`Calling API to get certifications for user ${userId}`);
      
      // First, try direct fetch with full URL to avoid any path issues
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/certifications/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Direct API call status:", response.status);
        
        if (response.ok) {
          const certifications = await response.json();
          console.log("Certifications from direct API call:", certifications);
          return certifications.map(cert => cert.toString());
        } else if (response.status === 404) {
          console.log("User not found (404), returning empty certifications array");
          return [];
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Fallback to apiService
      const response = await apiService.getUserCertifications(userId);
      
      if (response.error) {
        if (response.status === 404) {
          console.log("User not found in API response, returning empty array");
          return [];
        }
        console.error('Error fetching certifications:', response.error);
        return [];
      }
      
      console.log('Received certifications from service:', response.data);
      
      // Ensure we have an array of strings
      if (Array.isArray(response.data)) {
        return response.data.map(cert => {
          if (typeof cert === 'object' && cert !== null) {
            return cert._id?.toString() || cert.id?.toString() || String(cert);
          }
          return cert.toString();
        });
      }
      
      // Check for certifications in localStorage as last resort
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && storedUser.id === userId && Array.isArray(storedUser.certifications)) {
          console.log("Using certifications from localStorage:", storedUser.certifications);
          return storedUser.certifications.map(c => c.toString());
        }
      } catch (e) {
        console.error("Failed to parse localStorage user:", e);
      }
      
      return [];
    } catch (error) {
      console.error('API error fetching certifications:', error);
      return [];
    }
  }

  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Adding certification ${machineId} for user ${userId}`);
      
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId');
        return false;
      }
      
      // Ensure IDs are strings for consistency
      const stringUserId = String(userId);
      const stringMachineId = String(machineId);
      
      console.log(`Normalized IDs for certification: userId=${stringUserId}, machineId=${stringMachineId}`);
      
      // First attempt - direct API call
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const directResponse = await fetch(`${apiUrl}/api/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: stringUserId, machineId: stringMachineId })
        });
        
        console.log("Direct API call status:", directResponse.status);
        
        if (directResponse.ok) {
          console.log("Direct API call successful");
          return true;
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Second attempt - use apiService
      try {
        const response = await apiService.post('certifications', {
          userId: stringUserId,
          machineId: stringMachineId
        });
        
        console.log("API response for adding certification:", response);
        
        if (response.data?.success || response.status === 200 || response.status === 201) {
          console.log("Certification added successfully via apiService");
          return true;
        }
      } catch (apiError) {
        console.error("API service call failed:", apiError);
      }
      
      console.log("All attempts to add certification failed");
      return false;
    } catch (error) {
      console.error('Error adding certification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      console.log(`Removing certification ${machineId} for user ${userId}`);
      const response = await apiService.removeCertification(userId, machineId);
      
      if (response.error) {
        console.error('Error removing certification:', response.error);
        return false;
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error removing certification:', error);
      return false;
    }
  }

  async clearUserCertifications(userId: string): Promise<boolean> {
    try {
      console.log(`CertificationDatabaseService: Clearing all certifications for user ${userId}`);
      
      if (!userId) {
        console.error("Invalid userId passed to clearUserCertifications");
        return false;
      }
      
      // Use the API service to send a request to clear the user's certifications
      const response = await apiService.request(`certifications/user/${userId}/clear`, 'DELETE', undefined, true);
      
      if (response.data && response.data.success) {
        console.log(`Successfully cleared all certifications for user ${userId}`);
        return true;
      } else if (response.error) {
        console.error(`Error clearing certifications: ${response.error}`);
        return false;
      }
      
      return false;
    } catch (error) {
      console.error(`Error clearing certifications: ${error}`);
      return false;
    }
  }
}

export const certificationDatabaseService = new CertificationDatabaseService();
