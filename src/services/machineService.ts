
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
      
      // Always use API to update machine status, no fallbacks
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        apiService.setToken(token);
        
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

  // Get machine status - always from MongoDB/API
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

      // Always attempt to get fresh status from API first
      try {
        console.log(`Fetching fresh status for machine ${machineId} via API`);
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data && response.data.status) {
          const status = response.data.status.toLowerCase();
          console.log(`Found fresh status for machine ${machineId}: ${status}`);
          return status;
        }
      } catch (error) {
        console.error("API error getting machine status:", error);
      }
      
      // If API fails, try mongoDbService directly as a fallback
      try {
        console.log(`API failed, trying MongoDB directly for machine ${machineId} status`);
        const statusData = await mongoDbService.getMachineStatus(machineId);
        if (statusData && statusData.status) {
          console.log(`Got status from MongoDB directly: ${statusData.status}`);
          return statusData.status.toLowerCase();
        }
      } catch (mongoError) {
        console.error("MongoDB error getting machine status:", mongoError);
      }
      
      console.log(`No status found for machine ${machineId}, using default 'available'`);
      return 'available'; // Default status if none found
    } catch (error) {
      console.error("Error getting machine status:", error);
      return 'available'; // Default status if error
    }
  }
  
  // Get machine maintenance note - directly from API/MongoDB
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

      // Always try API first for fresh data
      try {
        console.log(`Fetching fresh maintenance note for machine ${machineId} via API`);
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data) {
          console.log(`Got maintenance note from API: ${response.data.maintenanceNote}`);
          return response.data.maintenanceNote;
        }
      } catch (error) {
        console.error("API error getting machine maintenance note:", error);
      }
      
      // Try mongoDbService directly as fallback
      try {
        console.log(`Trying MongoDB directly for machine ${machineId} maintenance note`);
        const machine = await mongoDbService.getMachineById(machineId);
        if (machine && machine.maintenanceNote) {
          console.log(`Got maintenance note from MongoDB: ${machine.maintenanceNote}`);
          return machine.maintenanceNote;
        }
      } catch (mongoError) {
        console.error("MongoDB error getting machine maintenance note:", mongoError);
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting machine maintenance note:", error);
      return undefined;
    }
  }
  
  // Get machine by ID - always from MongoDB/API
  async getMachineById(machineId: string): Promise<any | null> {
    try {
      console.log(`Getting machine by ID: ${machineId} - using MongoDB first`);
      
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineById");
        return null;
      }
      
      // Filter out machines 5 and 6 early
      if (machineId === "5" || machineId === "6") {
        console.log(`Machine ${machineId} is filtered out`);
        return null;
      }
      
      // Always try API first for fresh data
      try {
        console.log(`Fetching fresh machine data for machine ${machineId} via API`);
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data) {
          console.log(`Got machine data from API for ${machineId}`);
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
      
      // Try mongoDbService directly as fallback
      try {
        console.log(`API failed, trying MongoDB directly for machine ${machineId}`);
        const machine = await mongoDbService.getMachineById(machineId);
        if (machine) {
          console.log(`Got machine data from MongoDB for ${machineId}`);
          return {
            ...machine,
            id: machine._id || machine.id,
            status: machine.status?.toLowerCase() || 'available',
            type: machine.type || "Machine"
          };
        }
      } catch (mongoError) {
        console.error("MongoDB error getting machine by ID:", mongoError);
      }
      
      // Final fallback to static data, but only if all else fails
      console.log(`All DB methods failed, falling back to static data for machine ${machineId}`);
      const machine = machines.find(m => m.id === machineId);
      
      if (machine) {
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
  
  // Helper method to get machines - always from MongoDB/API
  async getMachines(timestamp?: number): Promise<any[]> {
    try {
      console.log("Getting machines with timestamp:", timestamp || "none", "- using MongoDB first");
      
      // Always try API first for fresh data
      try {
        const endpoint = timestamp ? `machines?t=${timestamp}` : 'machines';
        console.log(`Fetching fresh machine list via API: ${endpoint}`);
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
      
      // Try mongoDbService directly as fallback
      try {
        console.log("API failed, trying MongoDB directly for machine list");
        const machines = await mongoDbService.getMachines();
        if (machines && Array.isArray(machines)) {
          console.log(`Retrieved ${machines.length} machines from MongoDB directly`);
          
          return machines.map(machine => ({
            ...machine,
            id: machine.id || machine._id,
            type: machine.type || "Machine",
            status: machine.status?.toLowerCase() || 'available'
          }));
        }
      } catch (mongoError) {
        console.error("MongoDB error getting machines:", mongoError);
      }
      
      // Final fallback to static data, but only if all else fails
      console.log("All DB methods failed, falling back to static machines data");
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
