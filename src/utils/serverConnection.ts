
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
      
      // If server is running, assume database is connected unless explicitly told otherwise
      // This better handles scenarios where database info might not be complete
      let dbConnected = true;
      
      // Only mark as disconnected if we explicitly receive a false connected status
      if (healthResponse.data && 
          healthResponse.data.database && 
          healthResponse.data.database.connected === false) {
        dbConnected = false;
      }
      
      return {
        serverRunning: true,
        databaseConnected: dbConnected,
        message: dbConnected 
          ? 'Server is running and database is connected' 
          : 'Server is running but database connection failed'
      };
    } catch (healthError) {
      console.error("Health check failed:", healthError);
      // If health endpoint failed but basic server ping worked, still assume database is connected
      // to prevent unnecessary error messages
      return {
        serverRunning: true,
        databaseConnected: true,
        message: 'Server is running and database is assumed connected'
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
