
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
    try {
      const response = await fetch('http://localhost:4000/');
      
      if (!response.ok) {
        return {
          serverRunning: false,
          databaseConnected: false,
          message: 'Server is not responding'
        };
      }
      
      // Basic server is running, now check database connection
      try {
        const healthResponse = await apiService.checkHealth();
        
        if (healthResponse.data && 
            healthResponse.data.database && 
            healthResponse.data.database.connected) {
          return {
            serverRunning: true,
            databaseConnected: true,
            message: 'Server is running and database is connected'
          };
        } else {
          return {
            serverRunning: true,
            databaseConnected: false,
            message: 'Server is running but database connection failed'
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
  } catch (error) {
    console.error("Server health check error:", error);
    return {
      serverRunning: false,
      databaseConnected: false,
      message: 'Error checking server health'
    };
  }
};
