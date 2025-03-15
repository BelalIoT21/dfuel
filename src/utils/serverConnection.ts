
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
      
      // Check directly for database connection status from the health endpoint
      let dbConnected = true;
      
      if (healthResponse.data && 
          healthResponse.data.database !== undefined) {
        // Use explicit database connection status if available
        dbConnected = healthResponse.data.database.connected === true;
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
      // If health endpoint failed but basic server ping worked, 
      // don't assume database is connected
      return {
        serverRunning: true,
        databaseConnected: false,
        message: 'Server is running but cannot verify database connection'
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
