
import { certificationService } from '@/services/certificationService';
import { certificationDatabaseService } from '@/services/database/certificationService';
import { apiService } from '@/services/apiService';

export async function addUserCertification(userId: string, machineId: string): Promise<boolean> {
  console.log(`Adding certification for user ${userId} and machine ${machineId}`);
  
  // Ensure IDs are strings
  const userIdStr = String(userId);
  const machineIdStr = String(machineId);
  
  console.log(`Using string IDs: userID=${userIdStr}, machineID=${machineIdStr}`);
  
  // Track all attempts for debugging
  const certificationAttempts = [];
  let success = false;

  // Try direct API call to MongoDB (most reliable method)
  try {
    console.log('Attempting direct API call to add certification');
    const directResponse = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin.replace(':5000', ':4000')}/api/certifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId: userIdStr, machineId: machineIdStr })
    });
    
    let directResult;
    try {
      const responseText = await directResponse.text();
      console.log('Direct API response text:', responseText);
      
      if (responseText) {
        directResult = JSON.parse(responseText);
      } else {
        directResult = { success: directResponse.ok };
      }
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      directResult = { success: directResponse.ok };
    }
    
    certificationAttempts.push({method: "direct API", response: directResult});
    console.log('Direct API call response:', directResult);
    
    if (directResponse.ok || (directResult && directResult.success)) {
      success = true;
      console.log('Direct API call successful');
      return true;
    }
  } catch (directError) {
    console.error('Direct API call failed:', directError);
    certificationAttempts.push({method: "direct API", error: String(directError)});
  }
  
  // Fallback: Use the certification service
  if (!success) {
    try {
      console.log('Attempting to add certification using certificationService');
      success = await certificationService.addCertification(userIdStr, machineIdStr);
      certificationAttempts.push({method: "certificationService", success});
      
      if (success) {
        console.log('Certification successfully added via certificationService');
        return true;
      }
    } catch (err) {
      console.error("Error with certificationService:", err);
      certificationAttempts.push({method: "certificationService", error: String(err)});
    }
  }
  
  // Fallback: Use certificationDatabaseService
  if (!success) {
    console.log('Trying certificationDatabaseService');
    try {
      success = await certificationDatabaseService.addCertification(userIdStr, machineIdStr);
      certificationAttempts.push({method: "certificationDatabaseService", success});
      console.log(`Database service attempt result: ${success ? 'success' : 'failed'}`);
      if (success) return true;
    } catch (err) {
      console.error("Error with certificationDatabaseService:", err);
      certificationAttempts.push({method: "certificationDatabaseService", error: String(err)});
    }
  }
  
  // Last resort: Try apiService
  if (!success) {
    try {
      console.log('Trying apiService');
      const apiResult = await apiService.request(`certifications`, 'POST', {
        userId: userIdStr, 
        machineId: machineIdStr
      });
      
      console.log('apiService response:', apiResult);
      if (apiResult && (apiResult.success || apiResult.data)) {
        success = true;
        console.log('apiService call successful');
        return true;
      }
    } catch (apiErr) {
      console.error("Error with apiService:", apiErr);
      certificationAttempts.push({method: "apiService", error: String(apiErr)});
    }
  }
  
  // Log all attempts for debugging
  console.log("All certification attempts:", JSON.stringify(certificationAttempts, null, 2));
  
  return success;
}
