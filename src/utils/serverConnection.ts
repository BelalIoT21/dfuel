
/**
 * Utility functions for checking server connection and health
 */

import { apiService } from '@/services/apiService';

export interface ServerStatus {
  serverRunning: boolean;
  databaseConnected: boolean;
  message: string;
}

/**
 * Check if the server is running and if the database is connected
 */
export const checkServerHealth = async (): Promise<ServerStatus> => {
  try {
    console.log("Checking server connection...");
    
    // First check if basic server is running (just HTTP ping)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const response = await fetch('http://localhost:4000/', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log("Server ping failed with status:", response.status);
        return {
          serverRunning: false,
          databaseConnected: false,
          message: 'Server is not responding'
        };
      }
      
      console.log("Server ping successful, checking database connection...");
      
      // Basic server is running, now check database connection through the health endpoint
      try {
        const healthResponse = await apiService.checkHealth();
        console.log("Health check response:", healthResponse);
        
        // Explicitly check database connection status
        const dbConnected = 
          healthResponse?.data?.database?.connected === true || 
          (healthResponse?.data?.status === 'ok' && healthResponse?.data?.database !== false);
        
        return {
          serverRunning: true,
          databaseConnected: dbConnected,
          message: dbConnected 
            ? 'Server is running and database is connected' 
            : 'Server is running but database connection failed'
        };
      } catch (healthError) {
        console.error("Health check failed:", healthError);
        // If health endpoint failed but basic server ping worked, 
        // don't assume database is connected
        return {
          serverRunning: true,
          databaseConnected: false,
          message: 'Server is running but cannot verify database connection'
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Server ping failed:", fetchError);
      
      if (fetchError.name === 'AbortError') {
        console.log("Server ping timed out");
      }
      
      // Return a simple status that allows the UI to render
      return {
        serverRunning: false,
        databaseConnected: false,
        message: 'Cannot connect to server'
      };
    }
  } catch (error) {
    console.error("Server connection check failed:", error);
    // Return a simple status that allows the UI to render
    return {
      serverRunning: false,
      databaseConnected: false,
      message: 'Cannot connect to server'
    };
  }
};
