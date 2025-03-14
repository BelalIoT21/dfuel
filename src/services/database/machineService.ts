
import { apiService } from '../apiService';
import { BaseService } from './baseService';

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  async getMachineStatus(machineId: string): Promise<string> {
    // Safety cabinet is always available and not a machine
    if (machineId === 'safety-cabinet') {
      return 'available';
    }
    
    try {
      console.log(`Getting machine status for: ${machineId}`);
      
      const response = await apiService.getMachineStatus(machineId);
      if (response.data) {
        return response.data.status;
      }
    } catch (error) {
      console.error(`Error getting status for machine ${machineId}:`, error);
    }
    
    // Default to available if API fails
    return 'available';
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    // Cannot update safety cabinet status as it's not a machine
    if (machineId === 'safety-cabinet') {
      return true; // Pretend success
    }
    
    try {
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
