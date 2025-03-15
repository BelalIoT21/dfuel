
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { machines } from '../utils/data';
import { isWeb } from '../utils/platform';

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
  
  // Get machine by ID - fixed method to work with web and native environments
  async getMachineById(machineId: string): Promise<any | null> {
    try {
      console.log(`Getting machine by ID: ${machineId}`);
      const allMachines = await this.getMachines();
      const machine = allMachines.find(m => m.id === machineId);
      
      if (machine) {
        // Get the latest status
        const status = await this.getMachineStatus(machineId);
        return {
          ...machine,
          status: status || 'available'
        };
      }
      
      console.log(`Machine not found with ID: ${machineId}`);
      return null;
    } catch (error) {
      console.error(`Error getting machine with ID ${machineId}:`, error);
      return null;
    }
  }
  
  // Helper method to get machines - now properly handles web and native environments
  async getMachines(): Promise<any[]> {
    try {
      // First try to get machines from MongoDB (for consistency across devices)
      if (!isWeb) {
        try {
          const mongoMachines = await mongoDbService.getMachines();
          if (mongoMachines && mongoMachines.length > 0) {
            return mongoMachines.map(machine => ({
              id: machine._id.toString(),
              name: machine.name,
              type: machine.type === 'Safety Cabinet' ? 'Equipment' : 'Machine',
              description: machine.description,
              status: machine.status.toLowerCase(),
              requiresCertification: machine.requiresCertification,
              difficulty: machine.difficulty,
              imageUrl: machine.imageUrl
            }));
          }
        } catch (mongoError) {
          console.error("Failed to get machines from MongoDB:", mongoError);
        }
      }
      
      // Fallback to local data
      return machines.map(machine => ({
        ...machine,
        type: machine.type === 'Safety Cabinet' ? 'Equipment' : 'Machine'
      }));
    } catch (error) {
      console.error("Error getting machines data:", error);
      return [];
    }
  }
  
  // Method to ensure all machines are in MongoDB
  async ensureMachinesInMongoDB(): Promise<boolean> {
    if (isWeb) return false; // Skip in web environment
    
    try {
      // Get local machines data
      const localMachines = machines;
      
      // Add each machine to MongoDB if it doesn't exist
      for (const machine of localMachines) {
        const exists = await mongoDbService.machineExists(machine.id);
        if (!exists) {
          await mongoDbService.addMachine({
            _id: machine.id,
            name: machine.name,
            type: machine.type,
            description: machine.description || 'No description available',
            status: 'Available',
            requiresCertification: !!machine.requiresCertification,
            difficulty: machine.difficulty || 'Beginner',
            imageUrl: machine.imageUrl || '/placeholder.svg'
          });
        }
      }
      
      console.log("Successfully ensured all machines exist in MongoDB");
      return true;
    } catch (error) {
      console.error("Error ensuring machines in MongoDB:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();
