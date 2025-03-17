
import mongoDbService from './mongoDbService';
import { machines } from '../utils/data';
import { isWeb } from '../utils/platform';
import { apiService } from './apiService';

export class MachineService {
  // Update machine status - prioritize MongoDB
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      console.log(`Updating machine status: ID=${machineId}, status=${status}`);
      
      if (!machineId || !status) {
        console.error("Invalid machineId or status passed to updateMachineStatus");
        return false;
      }
      
      // Check if it's a safety cabinet - always available, no status updates needed
      const isSafetyCabinet = machineId === "5";
      if (isSafetyCabinet) {
        console.log("Safety Cabinet is always available, not updating status");
        return true;
      }
      
      if (isWeb) {
        // Use API for web
        try {
          const response = await apiService.put(`machines/${machineId}/status`, { status, maintenanceNote: note });
          return response.data?.success || false;
        } catch (error) {
          console.error("API error updating machine status:", error);
        }
      }
      
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
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineStatus");
        return 'available';
      }
      
      // Check if it's a safety cabinet - always available
      if (machineId === "5") {
        console.log("Safety Cabinet is always available");
        return 'available';
      }

      if (isWeb) {
        // Use API for web
        try {
          const response = await apiService.get(`machines/${machineId}/status`);
          if (response.data) {
            return response.data.status;
          }
        } catch (error) {
          console.error("API error getting machine status:", error);
        }
      }
      
      // Get from MongoDB
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        console.log(`Found status for machine ${machineId}: ${status.status}`);
        return status.status;
      }
      
      console.log(`No status found for machine ${machineId}, using default 'available'`);
      return 'available'; // Default status if none found
    } catch (error) {
      console.error("Error getting machine status:", error);
      return 'available'; // Default status if error
    }
  }
  
  // Get machine maintenance note
  async getMachineMaintenanceNote(machineId: string): Promise<string | undefined> {
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineMaintenanceNote");
        return undefined;
      }
      
      // Check if it's a safety cabinet - no maintenance notes
      if (machineId === "5") {
        return undefined;
      }

      if (isWeb) {
        // Use API for web
        try {
          const response = await apiService.get(`machines/${machineId}/status`);
          if (response.data) {
            return response.data.note;
          }
        } catch (error) {
          console.error("API error getting machine maintenance note:", error);
        }
      }
      
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
      
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineById");
        return null;
      }
      
      if (isWeb) {
        // Use API for web
        try {
          const response = await apiService.get(`machines/${machineId}`);
          if (response.data) {
            // Get the latest status
            const status = await this.getMachineStatus(machineId);
            return {
              ...response.data,
              status: status || 'available'
            };
          }
        } catch (error) {
          console.error("API error getting machine by ID:", error);
        }
      }
      
      // For native, use MongoDB
      if (!isWeb) {
        const mongoMachine = await mongoDbService.getMachineById(machineId);
        if (mongoMachine) {
          console.log(`Found machine in MongoDB: ${mongoMachine.name}`);
          // Get the latest status
          const status = await this.getMachineStatus(machineId);
          return {
            id: mongoMachine._id,
            name: mongoMachine.name,
            type: mongoMachine.type || "Machine", // Default type if undefined
            description: mongoMachine.description,
            status: status || mongoMachine.status || 'available',
            requiresCertification: mongoMachine.requiresCertification,
            difficulty: mongoMachine.difficulty,
            imageUrl: mongoMachine.imageUrl
          };
        }
      }
      
      // Fallback to the static machines data
      const machine = machines.find(m => m.id === machineId);
      
      if (machine) {
        // Get the latest status
        const status = await this.getMachineStatus(machineId);
        return {
          ...machine,
          status: status || 'available',
          type: machine.type || "Machine"
        };
      }
      
      console.error(`Machine not found with ID: ${machineId}`);
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
        // Use API for web
        try {
          const response = await apiService.get('machines');
          if (response.data && Array.isArray(response.data)) {
            return response.data.map(machine => ({
              ...machine,
              type: machine.type || "Machine" // Default type if undefined
            }));
          }
        } catch (error) {
          console.error("API error getting machines:", error);
        }
      }
      
      if (!isWeb) {
        // For native, use MongoDB
        const mongoMachines = await mongoDbService.getMachines();
        if (mongoMachines && mongoMachines.length > 0) {
          console.log(`Retrieved ${mongoMachines.length} machines from MongoDB`);
          return mongoMachines.map(machine => ({
            id: machine._id?.toString(),
            name: machine.name,
            type: machine.type || "Machine", // Default type if undefined
            description: machine.description,
            status: machine.status?.toLowerCase() || 'available',
            requiresCertification: machine.requiresCertification,
            difficulty: machine.difficulty,
            imageUrl: machine.imageUrl
          }));
        }
      }
      
      // Fallback to static machines data
      return machines.map(machine => ({
        ...machine,
        type: machine.type || "Machine" // Default type if undefined
      }));
    } catch (error) {
      console.error("Error getting machines data:", error);
      return machines.map(machine => ({
        ...machine,
        type: machine.type || "Machine" // Default type if undefined
      }));
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();
