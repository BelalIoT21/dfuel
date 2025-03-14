
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';

export class MachineService {
  // Update machine status
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    // Special case for safety cabinet, which is not a machine
    if (machineId === 'safety-cabinet') {
      console.log('Safety cabinet status update requested - not a machine, always available');
      return true;
    }
    
    try {
      // Try to update in MongoDB first
      const success = await mongoDbService.updateMachineStatus(machineId, status, note);
      if (success) return true;
    } catch (error) {
      console.error("Error updating machine status in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.updateMachineStatus(machineId, status, note);
  }

  // Get machine status
  async getMachineStatus(machineId: string): Promise<string> {
    // Special case for safety cabinet, which is not a machine
    if (machineId === 'safety-cabinet') {
      console.log('Safety cabinet status requested - always available');
      return 'available';
    }
    
    try {
      // Try to get from MongoDB first
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        return status.status;
      }
    } catch (error) {
      console.error("Error getting machine status from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.getMachineStatus(machineId);
  }
  
  // Get machine maintenance note
  async getMachineMaintenanceNote(machineId: string): Promise<string | undefined> {
    // Special case for safety cabinet, which is not a machine
    if (machineId === 'safety-cabinet') {
      return undefined; // No maintenance notes for safety cabinet
    }
    
    try {
      // Try to get from MongoDB first
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        return status.note;
      }
    } catch (error) {
      console.error("Error getting machine maintenance note from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.getMachineMaintenanceNote(machineId);
  }
}

// Create a singleton instance
export const machineService = new MachineService();
