
import { apiService } from '../apiService';
import { BaseService } from './baseService';

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  async getMachineStatus(machineId: string): Promise<string> {
    // Special cases - safety cabinet and safety course are separate entities, not real machines
    if (machineId === 'safety-cabinet' || machineId === 'safety-course') {
      console.log(`${machineId} requested - not a real machine, returning hardcoded available status`);
      return 'available'; // Always return available for special training entities
    }
    
    try {
      console.log(`Getting machine status for: ${machineId}`);
      
      // For regular machines, proceed normally
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
    // Special cases - safety cabinet and safety course are separate entities, not real machines
    if (machineId === 'safety-cabinet' || machineId === 'safety-course') {
      console.log(`${machineId} status update requested - not a real machine, returning mock success`);
      return true; // Always return success for special training entities
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
