
import { apiService } from '../apiService';

class CertificationDatabaseService {
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`Calling API to get certifications for user ${userId}`);
      
      // Ensure userId is a string
      const userIdStr = String(userId);
      
      // First try direct API call for most reliable results
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        // Make sure we're using the correct URL format
        const response = await fetch(`${apiUrl}/api/certifications/user/${userIdStr}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log(`Certification API request URL: ${apiUrl}/api/certifications/user/${userIdStr}`);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log(`Received ${data.length} certifications from direct API:`, data);
            return data.map(cert => String(cert));
          }
        } else {
          console.error(`Certification API responded with: ${response.status} ${response.statusText}`);
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Fallback to apiService if direct call fails
      try {
        const response = await apiService.getUserCertifications(userIdStr);
        
        if (response.error) {
          console.error('Error fetching certifications:', response.error);
          return [];
        }
        
        console.log('Received certifications from service:', response.data);
        return Array.isArray(response.data) ? response.data.map(cert => String(cert)) : [];
      } catch (error) {
        console.error('API error fetching certifications:', error);
        return [];
      }
    } catch (error) {
      console.error('Error in getUserCertifications:', error);
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
        console.log('Attempt 1: Direct API call');
        const directResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: stringUserId, machineId: stringMachineId })
        });
        
        // Log full details of the response
        console.log("Direct API call status:", directResponse.status);
        
        // Clone the response for text and json parsing
        const responseClone = directResponse.clone();
        const responseText = await responseClone.text();
        console.log("Direct API call response text:", responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.log("Response was not valid JSON");
          responseData = { error: "Not JSON" };
        }
        
        console.log("Direct fetch API response data:", responseData);
        
        if (directResponse.ok || (responseData && responseData.success)) {
          console.log("Direct API call successful");
          return true;
        }
      } catch (directError) {
        console.error("Direct API call failed:", directError);
      }
      
      // Second attempt - use apiService.addCertification
      try {
        console.log('Attempt 2: Using apiService.addCertification');
        const response = await apiService.addCertification(stringUserId, stringMachineId);
        console.log("API response for adding certification:", response);
        
        if (response.data?.success || response.status === 200 || response.status === 201) {
          console.log("Certification added successfully via apiService");
          return true;
        }
      } catch (apiError) {
        console.error("API service call failed:", apiError);
      }
      
      // Third attempt - use generic POST method
      try {
        console.log("Attempt 3: Using generic POST method");
        const fallbackResponse = await apiService.post('certifications', {
          userId: stringUserId,
          machineId: stringMachineId
        });
        
        console.log("Fallback API response:", fallbackResponse);
        if (fallbackResponse.data?.success || fallbackResponse.status === 200 || fallbackResponse.status === 201) {
          console.log("Certification added successfully using fallback method");
          return true;
        }
      } catch (fallbackError) {
        console.error("Fallback certification method failed:", fallbackError);
      }
      
      // Fourth attempt - alternative endpoint
      try {
        console.log("Attempt 4: Using alternative API endpoint");
        const alternativeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/api/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: stringUserId, machineId: stringMachineId })
        });
        
        // Try to get response text
        let responseText = "";
        try {
          responseText = await alternativeResponse.text();
          console.log("Alternative endpoint response text:", responseText);
        } catch (e) {
          console.error("Could not read alternative endpoint response text:", e);
        }
        
        if (alternativeResponse.ok) {
          console.log("Alternative API endpoint successful");
          return true;
        }
      } catch (alternativeError) {
        console.error("Alternative API endpoint failed:", alternativeError);
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
