
import { apiService } from '../apiService';
import { BaseService } from './baseService';

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      console.log(`Getting machine status for: ${machineId}`);
      
      // For safety-cabinet, handle it differently since it might not exist in the database
      if (machineId === 'safety-cabinet') {
        try {
          const response = await apiService.getMachineStatus(machineId);
          if (response.data) {
            return response.data.status;
          }
        } catch (error) {
          console.log('Safety cabinet not found in API, using default available status');
          return 'available';
        }
      } else {
        // For other machines, proceed normally
        const response = await apiService.getMachineStatus(machineId);
        if (response.data) {
          return response.data.status;
        }
      }
    } catch (error) {
      console.error(`Error getting status for machine ${machineId}:`, error);
      // For the safety-cabinet machine which might not exist in the database yet,
      // we want to return 'available' to prevent UI issues
      if (machineId === 'safety-cabinet') {
        console.log('Using default available status for safety cabinet');
        return 'available';
      }
    }
    
    // Default to available if API fails
    return 'available';
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      // For safety-cabinet, which might not exist in the database yet
      if (machineId === 'safety-cabinet') {
        console.log('Using mock success for safety cabinet status update');
        return true;
      }
      
      const response = await apiService.updateMachineStatus(machineId, status, note);
      return response.data?.success || false;
    } catch (error) {
      console.error(`API error, could not update machine status for ${machineId}:`, error);
      return false;
    }
  }
}

// Create a singleton instance
export const machineDatabaseService = new MachineDatabaseService();
