
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
    // First check if basic server is running (just HTTP ping)
    const response = await fetch('http://localhost:4000/');
    
    if (!response.ok) {
      return {
        serverRunning: false,
        databaseConnected: false,
        message: 'Server is not responding'
      };
    }
    
    // Basic server is running, now check database connection through the health endpoint
    try {
      const healthResponse = await apiService.checkHealth();
      console.log("Health check response:", healthResponse);
      
      // Check if we have a proper database status in the response
      if (healthResponse.data && healthResponse.data.database) {
        const dbConnected = healthResponse.data.database.connected;
        
        return {
          serverRunning: true,
          databaseConnected: dbConnected,
          message: dbConnected 
            ? 'Server is running and database is connected' 
            : 'Server is running but database connection failed'
        };
      } else {
        // Fallback if database status is not in the response
        console.log("Database status not found in health check response, assuming not connected");
        return {
          serverRunning: true,
          databaseConnected: false,
          message: 'Server is running but cannot verify database connection'
        };
      }
    } catch (healthError) {
      console.error("Health check failed:", healthError);
      return {
        serverRunning: true,
        databaseConnected: false,
        message: 'Server is running but health check failed'
      };
    }
  } catch (error) {
    console.error("Server connection failed:", error);
    return {
      serverRunning: false,
      databaseConnected: false,
      message: 'Cannot connect to server'
    };
  }
};
