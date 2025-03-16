
import mongoDbService from './mongoDbService';
import { machines } from '../utils/data';
import { isWeb } from '../utils/platform';

export class MachineService {
  // Update machine status
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      console.log(`Updating machine status: ID=${machineId}, status=${status}`);
      
      // Check if it's a safety cabinet - always available, no status updates needed
      const machines = await this.getMachines();
      const isSafetyCabinet = machines.find(m => m.id === machineId && m.type === 'Safety Cabinet');
      if (isSafetyCabinet) return true;
      
      // Update in MongoDB
      const success = await mongoDbService.updateMachineStatus(machineId, status, note);
      console.log(`Machine status update result: ${success}`);
      return success;
    } catch (error) {
      console.error("Error updating machine status:", error);
      return false;
    }
  }

  // Get machine status
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      // Check if it's a safety cabinet - always available
      const machines = await this.getMachines();
      const isSafetyCabinet = machines.find(m => m.id === machineId && m.type === 'Safety Cabinet');
      if (isSafetyCabinet) return 'available';
      
      // Get from MongoDB
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        return status.status;
      }
      return 'available'; // Default status
    } catch (error) {
      console.error("Error getting machine status:", error);
      return 'available'; // Default status
    }
  }
  
  // Get machine maintenance note
  async getMachineMaintenanceNote(machineId: string): Promise<string | undefined> {
    try {
      // Check if it's a safety cabinet - no maintenance notes
      const machines = await this.getMachines();
      const isSafetyCabinet = machines.find(m => m.id === machineId && m.type === 'Safety Cabinet');
      if (isSafetyCabinet) return undefined;
      
      // Get from MongoDB
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        return status.note;
      }
      return undefined;
    } catch (error) {
      console.error("Error getting machine maintenance note:", error);
      return undefined;
    }
  }
  
  // Get machine by ID
  async getMachineById(machineId: string): Promise<any | null> {
    try {
      console.log(`Getting machine by ID: ${machineId}`);
      
      if (isWeb) {
        // For web, use the static machines data
        const allMachines = machines;
        const machine = allMachines.find(m => m.id === machineId);
        
        if (machine) {
          // Get the latest status from API
          const status = await this.getMachineStatus(machineId);
          return {
            ...machine,
            status: status || 'available',
            type: machine.type
          };
        }
        return null;
      }
      
      // For native, use MongoDB
      const mongoMachine = await mongoDbService.getMachineById(machineId);
      if (mongoMachine) {
        console.log(`Found machine in MongoDB: ${mongoMachine.name}`);
        // Get the latest status
        const status = await this.getMachineStatus(machineId);
        return {
          id: mongoMachine._id,
          name: mongoMachine.name,
          type: mongoMachine.type,
          description: mongoMachine.description,
          status: status || mongoMachine.status || 'available',
          requiresCertification: mongoMachine.requiresCertification,
          difficulty: mongoMachine.difficulty,
          imageUrl: mongoMachine.imageUrl
        };
      }
      
      console.log(`Machine not found with ID: ${machineId}`);
      return null;
    } catch (error) {
      console.error(`Error getting machine with ID ${machineId}:`, error);
      return null;
    }
  }
  
  // Helper method to get machines
  async getMachines(): Promise<any[]> {
    try {
      if (isWeb) {
        // For web, use the static machines data
        return machines.map(machine => ({
          ...machine,
          type: machine.type
        }));
      }
      
      // For native, use MongoDB
      const mongoMachines = await mongoDbService.getMachines();
      if (mongoMachines && mongoMachines.length > 0) {
        console.log(`Retrieved ${mongoMachines.length} machines from MongoDB`);
        return mongoMachines.map(machine => ({
          id: machine._id.toString(),
          name: machine.name,
          type: machine.type,
          description: machine.description,
          status: machine.status.toLowerCase(),
          requiresCertification: machine.requiresCertification,
          difficulty: machine.difficulty,
          imageUrl: machine.imageUrl
        }));
      }
      
      // Fallback to static data if MongoDB is empty
      return machines.map(machine => ({
        ...machine,
        type: machine.type
      }));
    } catch (error) {
      console.error("Error getting machines data:", error);
      
      // Fallback to static data on error
      return machines.map(machine => ({
        ...machine,
        type: machine.type
      }));
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
            imageUrl: machine.imageUrl || '/placeholder.svg',
            bookedTimeSlots: []
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
