
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
  
  // Method 4: Emergency fallback using additional endpoint paths
  if (!success) {
    console.log('Method 4: Trying alternative endpoints');
    
    const endpointsToTry = [
      `${import.meta.env.VITE_API_URL}/api/certifications`,
      `${import.meta.env.VITE_API_URL}/certifications/add`,
      `${import.meta.env.VITE_API_URL}/api/certifications/add`
    ];
    
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const emergencyResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: userIdStr, machineId: machineIdStr })
        });
        
        let emergencyResult;
        try {
          const responseText = await emergencyResponse.text();
          console.log(`${endpoint} response text:`, responseText);
          
          if (responseText) {
            emergencyResult = JSON.parse(responseText);
          } else {
            emergencyResult = { success: emergencyResponse.ok };
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          emergencyResult = { success: emergencyResponse.ok };
        }
        
        certificationAttempts.push({method: `emergency API (${endpoint})`, response: emergencyResult});
        
        if (emergencyResponse.ok || (emergencyResult && emergencyResult.success)) {
          success = true;
          console.log(`Emergency API call to ${endpoint} successful`);
          break;
        }
      } catch (emergencyError) {
        console.error(`Emergency API call to ${endpoint} failed:`, emergencyError);
        certificationAttempts.push({method: `emergency API (${endpoint})`, error: String(emergencyError)});
      }
    }
  }
  
  // Log all attempts for debugging
  console.log("All certification attempts:", JSON.stringify(certificationAttempts, null, 2));
  
  return success;
}
