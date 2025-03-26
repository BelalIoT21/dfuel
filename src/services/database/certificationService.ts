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
      const stringUserId = userId.toString();
      const stringMachineId = machineId.toString();
      
      console.log(`Calling API to add certification: userId=${stringUserId}, machineId=${stringMachineId}`);
      const response = await apiService.addCertification(stringUserId, stringMachineId);
      
      console.log("API response for adding certification:", response);
      
      if (response.error) {
        console.error('Error adding certification:', response.error);
        return false;
      }
      
      // Also try with direct API call as fallback
      if (!response.data?.success) {
        console.log("Trying fallback method for adding certification...");
        try {
          const fallbackResponse = await apiService.post('certifications', {
            userId: stringUserId,
            machineId: stringMachineId
          });
          
          console.log("Fallback API response:", fallbackResponse);
          if (fallbackResponse.data?.success) {
            console.log("Certification added successfully using fallback method");
            return true;
          }
        } catch (fallbackError) {
          console.error("Fallback certification method also failed:", fallbackError);
        }
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error adding certification:', error);
      
      // Try one more time with direct API call
      try {
        console.log("Trying emergency fallback for adding certification...");
        const emergencyResponse = await apiService.post('certifications', {
          userId: userId.toString(),
          machineId: machineId.toString()
        });
        
        return emergencyResponse.data?.success || false;
      } catch (emergencyError) {
        console.error("Emergency fallback also failed:", emergencyError);
        return false;
      }
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
