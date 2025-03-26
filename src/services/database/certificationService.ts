
import { apiService } from '../apiService';

class CertificationDatabaseService {
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      console.log(`Calling API to get certifications for user ${userId}`);
      const response = await apiService.getUserCertifications(userId);
      
      if (response.error) {
        console.error('Error fetching certifications:', response.error);
        return [];
      }
      
      console.log('Received certifications from service:', response.data);
      return response.data || [];
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
      
      console.log(`Calling API to add certification: userId=${stringUserId}, machineId=${stringMachineId}`);
      
      // First attempt - direct API call
      try {
        console.log('Attempt 1: Direct API call');
        const directResponse = await fetch(`${import.meta.env.VITE_API_URL}/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: stringUserId, machineId: stringMachineId })
        });
        
        const responseData = await directResponse.json();
        console.log("Direct fetch API response:", responseData);
        
        if (directResponse.ok || responseData.success) {
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
        const alternativeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: stringUserId, machineId: stringMachineId })
        });
        
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
      console.log(`Clearing all certifications for user ${userId}`);
      const response = await apiService.delete(`certifications/user/${userId}/clear`);
      
      if (response.error) {
        console.error('Error clearing certifications:', response.error);
        return false;
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error clearing certifications:', error);
      return false;
    }
  }
}

export const certificationDatabaseService = new CertificationDatabaseService();
