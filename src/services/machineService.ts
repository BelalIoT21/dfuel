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
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      apiService.setToken(token);
      
      // Use API to update machine status
      try {
        console.log("Using API to update machine status:", status);
        const response = await apiService.put(`machines/${machineId}/status`, { 
          status, 
          maintenanceNote: note 
        });
        
        console.log("API response:", response);
        return response.data?.success || false;
      } catch (error) {
        console.error("API error updating machine status:", error);
        return false;
      }
    } catch (error) {
      console.error("Error updating machine status:", error);
      return false;
    }
  }

  // Get machine status - now uses the dedicated status endpoint
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

      // Use the dedicated status endpoint
      try {
        const response = await apiService.get(`machines/${machineId}/status`);
        if (response.data && response.data.status) {
          console.log(`Found status for machine ${machineId}: ${response.data.status}`);
          return response.data.status;
        }
      } catch (error) {
        console.error("API error getting machine status:", error);
        
        // Fallback to getting the full machine and checking status
        try {
          const machineResponse = await apiService.get(`machines/${machineId}`);
          if (machineResponse.data && machineResponse.data.status) {
            return machineResponse.data.status.toLowerCase();
          }
        } catch (fallbackError) {
          console.error("Fallback error getting machine status:", fallbackError);
        }
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

      // Try status endpoint first
      try {
        const response = await apiService.get(`machines/${machineId}/status`);
        if (response.data && response.data.maintenanceNote) {
          return response.data.maintenanceNote;
        }
      } catch (error) {
        console.error("API error getting machine status for maintenance note:", error);
      }

      // Fallback to getting the full machine
      try {
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data) {
          return response.data.maintenanceNote;
        }
      } catch (error) {
        console.error("API error getting machine maintenance note:", error);
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting machine maintenance note:", error);
      return undefined;
    }
  }
  
  // Get machine by ID - unchanged
  async getMachineById(machineId: string): Promise<any | null> {
    try {
      console.log(`Getting machine by ID: ${machineId}`);
      
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineById");
        return null;
      }
      
      // Use API to get machine by ID
      try {
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data) {
          // Filter out machines 5 and 6
          if (machineId === "5" || machineId === "6") {
            console.log(`Machine ${machineId} is filtered out`);
            return null;
          }
          
          return {
            ...response.data,
            id: response.data._id || response.data.id,
            status: response.data.status?.toLowerCase() || 'available',
            type: response.data.type || "Machine"
          };
        }
      } catch (error) {
        console.error("API error getting machine by ID:", error);
      }
      
      // Fallback to the static machines data
      const machine = machines.find(m => m.id === machineId);
      
      if (machine) {
        // Filter out machines 5 and 6
        if (machineId === "5" || machineId === "6") {
          console.log(`Machine ${machineId} is filtered out`);
          return null;
        }
        
        return {
          ...machine,
          status: 'available',
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
  
  // Helper method to get machines - unchanged
  async getMachines(timestamp?: number): Promise<any[]> {
    try {
      console.log("Getting machines, timestamp:", timestamp || "none");
      
      // Use API to get machines
      try {
        const endpoint = timestamp ? `machines?t=${timestamp}` : 'machines';
        const response = await apiService.get(endpoint);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Retrieved ${response.data.length} machines from API`);
          
          // Ensure each machine has an id field (might be _id in MongoDB)
          return response.data.map(machine => ({
            ...machine,
            id: machine.id || machine._id,
            type: machine.type || "Machine",
            status: machine.status?.toLowerCase() || 'available'
          }));
        } else {
          console.error("API returned invalid data format for machines:", response.data);
        }
      } catch (error) {
        console.error("API error getting machines:", error);
      }
      
      console.log("Falling back to static machines data");
      // Fallback to static machines data
      return machines.map(machine => ({
        ...machine,
        type: machine.type || "Machine" 
      }));
    } catch (error) {
      console.error("Error getting machines data:", error);
      return machines.map(machine => ({
        ...machine,
        type: machine.type || "Machine"
      }));
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();

// Set Laser Cutter to maintenance mode when the application starts
console.log("Machine service initialized.");
