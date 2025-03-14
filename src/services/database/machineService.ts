
import { apiService } from '../apiService';
import { BaseService } from './baseService';

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  async getMachineStatus(machineId: string): Promise<string> {
    // Special case - safety cabinet is not a real machine in the database
    if (machineId === 'safety-cabinet') {
      console.log('Safety cabinet requested - returning hardcoded available status');
      return 'available'; // Always return available for safety cabinet
    }
    
    if (machineId === 'safety-course') {
      console.log('Safety course requested - returning hardcoded available status');
      return 'available'; // Always return available for safety course
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
  
  async getMachineMaintenanceNote(machineId: string): Promise<string | undefined> {
    // Special case for safety machines
    if (machineId === 'safety-cabinet' || machineId === 'safety-course') {
      return undefined;
    }
    
    try {
      const response = await apiService.getMachineStatus(machineId);
      if (response.data) {
        return response.data.note;
      }
    } catch (error) {
      console.error(`Error getting maintenance note for machine ${machineId}:`, error);
    }
    
    return undefined;
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    // Special case - safety cabinet is not a real machine in the database
    if (machineId === 'safety-cabinet' || machineId === 'safety-course') {
      console.log('Safety machine status update requested - returning mock success');
      return true; // Always return success for safety machines
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
