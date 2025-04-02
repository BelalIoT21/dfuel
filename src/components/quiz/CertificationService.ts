
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

  // Try multiple methods to ensure certification is added both to database and locally
  
  // Method 1: Use the certification service (primary method)
  try {
    console.log('Attempting to add certification using certificationService');
    success = await certificationService.addCertification(userIdStr, machineIdStr);
    certificationAttempts.push({method: "certificationService", success});
    
    if (success) {
      console.log('Certification successfully added via certificationService');
      
      // Also try to sync with database service as backup
      try {
        await certificationDatabaseService.addCertification(userIdStr, machineIdStr);
      } catch (dbErr) {
        console.error("Error with database service after successful certification:", dbErr);
      }
      
      return true;
    }
  } catch (err) {
    console.error("Error with certificationService:", err);
    certificationAttempts.push({method: "certificationService", error: String(err)});
  }
  
  // Method 2: Direct API call if Method 1 fails
  if (!success) {
    try {
      console.log('Method 2: Attempting direct API call to add certification');
      const directResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/certifications`, {
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
  }
  
  // Method 3: Use certificationDatabaseService if Method 1 and 2 fail
  if (!success) {
    console.log('Method 3: Trying certificationDatabaseService');
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
  
  // Log all attempts for debugging
  console.log("All certification attempts:", JSON.stringify(certificationAttempts, null, 2));
  
  return success;
}
