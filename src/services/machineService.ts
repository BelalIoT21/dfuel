
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';

export class MachineService {
  // Update machine status
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      // Check if it's a safety cabinet - always available, no status updates needed
      const machines = await this.getMachines();
      const isSafetyCabinet = machines.find(m => m.id === machineId && m.type === 'Safety Cabinet');
      if (isSafetyCabinet) return true;
      
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
    try {
      // Check if it's a safety cabinet - always available
      const machines = await this.getMachines();
      const isSafetyCabinet = machines.find(m => m.id === machineId && m.type === 'Safety Cabinet');
      if (isSafetyCabinet) return 'available';
      
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
    try {
      // Check if it's a safety cabinet - no maintenance notes
      const machines = await this.getMachines();
      const isSafetyCabinet = machines.find(m => m.id === machineId && m.type === 'Safety Cabinet');
      if (isSafetyCabinet) return undefined;
      
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
  
  // Helper method to get machines
  async getMachines(): Promise<any[]> {
    try {
      return require('../utils/data').machines;
    } catch (error) {
      console.error("Error getting machines data:", error);
      return [];
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();
