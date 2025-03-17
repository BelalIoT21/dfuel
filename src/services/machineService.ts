
import { machines } from '../utils/data';
import { apiService } from './apiService';

export class MachineService {
  // Update machine status
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      console.log(`Updating machine status: ID=${machineId}, status=${status}`);
      
      if (!machineId || !status) {
        console.error("Invalid machineId or status passed to updateMachineStatus");
        return false;
      }
      
      // Check if machine ID is outside the range we want to fetch (5 or 6)
      if (machineId === "5" || machineId === "6") {
        console.log(`Skipping update for machine ${machineId} as it's not in the target range (1-4)`);
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

  // Get machine status
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineStatus");
        return 'available';
      }
      
      // Skip machines 5 and 6
      if (machineId === "5" || machineId === "6") {
        console.log(`Skipping status fetch for machine ${machineId} as it's not in the target range (1-4)`);
        return 'available';
      }

      // Use API to get machine status
      try {
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data && response.data.status) {
          const status = response.data.status.toLowerCase();
          console.log(`Found status for machine ${machineId}: ${status}`);
          return status;
        }
      } catch (error) {
        console.error("API error getting machine status:", error);
      }
      
      console.log(`No status found for machine ${machineId}, using default 'available'`);
      return 'available'; // Default status if none found
    } catch (error) {
      console.error("Error getting machine status:", error);
      return 'available'; // Default status if error
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
      
      // Skip machines 5 and 6
      if (machineId === "5" || machineId === "6") {
        console.log(`Skipping machine fetch for machine ${machineId} as it's not in the target range (1-4)`);
        return null;
      }
      
      // Use API to get machine by ID
      try {
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data) {
          return {
            ...response.data,
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
  
  // Helper method to get machines
  async getMachines(): Promise<any[]> {
    try {
      // Use API to get machines
      try {
        const response = await apiService.get('machines');
        if (response.data && Array.isArray(response.data)) {
          // Filter to only include machines with IDs 1-4
          return response.data
            .filter(machine => {
              const machineId = machine.id || machine._id;
              const includeThisMachine = machineId === "1" || machineId === "2" || 
                                        machineId === "3" || machineId === "4";
              return includeThisMachine;
            })
            .map(machine => ({
              ...machine,
              type: machine.type || "Machine",
              status: machine.status?.toLowerCase() || 'available'
            }));
        }
      } catch (error) {
        console.error("API error getting machines:", error);
      }
      
      // Fallback to static machines data, filtered to only include machines 1-4
      return machines
        .filter(machine => ["1", "2", "3", "4"].includes(machine.id))
        .map(machine => ({
          ...machine,
          type: machine.type || "Machine" 
        }));
    } catch (error) {
      console.error("Error getting machines data:", error);
      return machines
        .filter(machine => ["1", "2", "3", "4"].includes(machine.id))
        .map(machine => ({
          ...machine,
          type: machine.type || "Machine"
        }));
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();
