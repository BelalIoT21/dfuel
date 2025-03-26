
import { certificationService } from '@/services/certificationService';
import { certificationDatabaseService } from '@/services/database/certificationService';

export async function addUserCertification(userId: string, machineId: string): Promise<boolean> {
  console.log(`Adding certification for user ${userId} and machine ${machineId}`);
  
  // Ensure IDs are strings
  const userIdStr = String(userId);
  const machineIdStr = String(machineId);
  
  console.log(`Using string IDs: userID=${userIdStr}, machineID=${machineIdStr}`);
  
  // Track all attempts for debugging
  const certificationAttempts = [];
  let success = false;

  // Method 1: Direct API call - most reliable method first
  try {
    console.log('Method 1: Attempting direct API call to add certification');
    const directResponse = await fetch(`${import.meta.env.VITE_API_URL}/certifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId: userIdStr, machineId: machineIdStr })
    });
    
    const directResult = await directResponse.json();
    certificationAttempts.push({method: "direct API", response: directResult});
    console.log('Direct API call response:', directResult);
    
    if (directResponse.ok || directResult.success) {
      success = true;
      console.log('Direct API call successful');
    }
  } catch (directError) {
    console.error('Direct API call failed:', directError);
    certificationAttempts.push({method: "direct API", error: String(directError)});
  }
  
  // Method 2: Use certificationDatabaseService if Method 1 fails
  if (!success) {
    console.log('Method 2: Trying certificationDatabaseService');
    try {
      success = await certificationDatabaseService.addCertification(userIdStr, machineIdStr);
      certificationAttempts.push({method: "certificationDatabaseService", success});
      console.log(`Database service attempt result: ${success ? 'success' : 'failed'}`);
    } catch (err) {
      console.error("Error with certificationDatabaseService:", err);
      certificationAttempts.push({method: "certificationDatabaseService", error: String(err)});
    }
  }
  
  // Method 3: Use certificationService if Method 1 and 2 fail
  if (!success) {
    console.log('Method 3: Trying certificationService');
    try {
      success = await certificationService.addCertification(userIdStr, machineIdStr);
      certificationAttempts.push({method: "certificationService", success});
      console.log(`certificationService attempt result: ${success ? 'success' : 'failed'}`);
    } catch (err) {
      console.error("Error with certificationService:", err);
      certificationAttempts.push({method: "certificationService", error: String(err)});
    }
  }
  
  // Method 4: Emergency fallback - extreme case last resort
  if (!success) {
    console.log('Method 4: Trying emergency endpoint');
    try {
      const emergencyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/certifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: userIdStr, machineId: machineIdStr })
      });
      
      const emergencyResult = await emergencyResponse.json();
      certificationAttempts.push({method: "emergency API", response: emergencyResult});
      console.log('Emergency API call response:', emergencyResult);
      
      if (emergencyResponse.ok || emergencyResult.success) {
        success = true;
      }
    } catch (emergencyError) {
      console.error('Emergency API call failed:', emergencyError);
      certificationAttempts.push({method: "emergency API", error: String(emergencyError)});
    }
  }
  
  // Log all attempts for debugging
  console.log("All certification attempts:", JSON.stringify(certificationAttempts, null, 2));
  
  return success;
}
