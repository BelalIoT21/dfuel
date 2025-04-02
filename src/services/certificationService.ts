
import { apiService } from './apiService';

class CertificationService {
  async getUserCertifications(userId: string): Promise<string[]> {
    try {
      if (!userId) {
        console.error('Invalid userId passed to getUserCertifications');
        return [];
      }
      
      console.log(`Getting certifications for user ${userId}`);
      
      // Ensure userId is a string
      const userIdStr = String(userId);
      
      // First try the API endpoint
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000');
        const response = await fetch(`${apiUrl}/api/certifications/user/${userIdStr}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const certifications = await response.json();
          console.log(`Received ${certifications.length} certifications from API for user ${userId}:`, certifications);
          
          // Ensure all certifications are strings
          return Array.isArray(certifications) ? certifications.map(cert => String(cert)) : [];
        } else {
          console.error(`API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching certifications from API:', error);
      }
      
      // Fallback to apiService
      try {
        const response = await apiService.get(`certifications/user/${userIdStr}`);
        if (response.data) {
          console.log(`Received certifications from apiService:`, response.data);
          return Array.isArray(response.data) ? response.data.map(cert => String(cert)) : [];
        }
      } catch (error) {
        console.error('Error fetching certifications from apiService:', error);
      }
      
      // If all else fails, try localStorage
      try {
        const cacheKeys = Object.keys(localStorage);
        const certKeys = cacheKeys.filter(key => key.startsWith(`user_${userIdStr}_certification_`));
        
        if (certKeys.length > 0) {
          console.log(`Using cached certifications from localStorage for user ${userId}`);
          const certifications = certKeys
            .filter(key => localStorage.getItem(key) === 'true')
            .map(key => key.replace(`user_${userIdStr}_certification_`, ''));
          
          console.log(`Found ${certifications.length} cached certifications:`, certifications);
          return certifications;
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
      
      console.log(`No certifications found for user ${userId}`);
      return [];
    } catch (error) {
      console.error('Error in getUserCertifications:', error);
      return [];
    }
  }

  async checkCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to checkCertification');
        return false;
      }
      
      console.log(`Checking certification for user ${userId} and machine ${machineId}`);
      
      // Ensure IDs are strings
      const userIdStr = String(userId);
      const machineIdStr = String(machineId);
      
      // Check localStorage cache first for quick response
      const cacheKey = `user_${userIdStr}_certification_${machineIdStr}`;
      if (localStorage.getItem(cacheKey) === 'true') {
        console.log(`User ${userId} has cached certification for machine ${machineId}`);
        return true;
      }
      
      // Try direct API call first
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000');
        const response = await fetch(`${apiUrl}/api/certifications/check/${userIdStr}/${machineIdStr}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const isCertified = await response.json();
          console.log(`API check result for user ${userId} and machine ${machineId}: ${isCertified}`);
          
          if (isCertified) {
            localStorage.setItem(cacheKey, 'true');
          }
          
          return !!isCertified;
        }
      } catch (error) {
        console.error('Error checking certification via API:', error);
      }
      
      // Fallback: Get all user certifications
      try {
        const certifications = await this.getUserCertifications(userIdStr);
        const isCertified = certifications.includes(machineIdStr);
        
        console.log(`User ${userId} ${isCertified ? 'has' : 'does not have'} certification ${machineId} (from getUserCertifications)`);
        
        if (isCertified) {
          localStorage.setItem(cacheKey, 'true');
        }
        
        return isCertified;
      } catch (error) {
        console.error('Error checking certification via getUserCertifications:', error);
      }
      
      return false;
    } catch (error) {
      console.error('Error in checkCertification:', error);
      return false;
    }
  }

  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to addCertification');
        return false;
      }
      
      console.log(`Adding certification ${machineId} for user ${userId}`);
      
      // Ensure IDs are strings
      const userIdStr = String(userId);
      const machineIdStr = String(machineId);
      
      // Try direct API call first
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000');
        const response = await fetch(`${apiUrl}/api/certifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: userIdStr,
            machineId: machineIdStr
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`API result for adding certification:`, result);
          
          if (result.success) {
            // Update localStorage cache
            localStorage.setItem(`user_${userIdStr}_certification_${machineIdStr}`, 'true');
            return true;
          }
        }
      } catch (error) {
        console.error('Error adding certification via API:', error);
      }
      
      // Fallback to apiService
      try {
        const response = await apiService.post('certifications', {
          userId: userIdStr,
          machineId: machineIdStr
        });
        
        console.log(`apiService result for adding certification:`, response);
        
        if (response.data?.success) {
          localStorage.setItem(`user_${userIdStr}_certification_${machineIdStr}`, 'true');
          return true;
        }
      } catch (error) {
        console.error('Error adding certification via apiService:', error);
      }
      
      return false;
    } catch (error) {
      console.error('Error in addCertification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      if (!userId || !machineId) {
        console.error('Invalid userId or machineId passed to removeCertification');
        return false;
      }
      
      console.log(`Removing certification ${machineId} for user ${userId}`);
      
      // Ensure IDs are strings
      const userIdStr = String(userId);
      const machineIdStr = String(machineId);
      
      // Try direct API call first
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000');
        const response = await fetch(`${apiUrl}/api/certifications/${userIdStr}/${machineIdStr}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`API result for removing certification:`, result);
          
          if (result.success) {
            // Remove from localStorage cache
            localStorage.removeItem(`user_${userIdStr}_certification_${machineIdStr}`);
            return true;
          }
        }
      } catch (error) {
        console.error('Error removing certification via API:', error);
      }
      
      // Fallback to apiService
      try {
        const response = await apiService.delete(`certifications/${userIdStr}/${machineIdStr}`);
        
        console.log(`apiService result for removing certification:`, response);
        
        if (response.data?.success) {
          localStorage.removeItem(`user_${userIdStr}_certification_${machineIdStr}`);
          return true;
        }
      } catch (error) {
        console.error('Error removing certification via apiService:', error);
      }
      
      return false;
    } catch (error) {
      console.error('Error in removeCertification:', error);
      return false;
    }
  }
}

export const certificationService = new CertificationService();
