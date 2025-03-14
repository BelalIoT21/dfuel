
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';

export class MachineService {
  // Update machine status
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    // Special cases - safety cabinet and safety course are separate entities, not real machines
    if (machineId === 'safety-cabinet' || machineId === 'safety-course') {
      console.log(`${machineId} status update requested - not a real machine, returning mock success`);
      return true; // Always return success for special training entities
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
    // Special cases - safety cabinet and safety course are separate entities, not real machines
    if (machineId === 'safety-cabinet' || machineId === 'safety-course') {
      console.log(`${machineId} requested - not a real machine, returning hardcoded available status`);
      return 'available'; // Always return available for special training entities
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
    // Special cases - safety cabinet and safety course are separate entities, not real machines
    if (machineId === 'safety-cabinet' || machineId === 'safety-course') {
      return undefined; // No maintenance notes for special training entities
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
