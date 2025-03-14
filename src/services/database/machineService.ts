
import { apiService } from '../api';
import { BaseService } from './baseService';

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      const response = await apiService.machine.getMachineStatus(machineId);
      if (response.data) {
        return response.data.status;
      }
    } catch (error) {
      console.error("API error, using default machine status:", error);
    }
    
    // Default to available if API fails
    return 'available';
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      const response = await apiService.machine.updateMachineStatus(machineId, status, note);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, could not update machine status:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const machineDatabaseService = new MachineDatabaseService();
