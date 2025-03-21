
import { machines } from '../utils/data';
import { apiService } from './apiService';
import { getApiEndpoints } from '../utils/env';

export class MachineService {
  // Update machine status - always use API
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
      
      // Always use API to update machine status
      try {
        // Get auth token
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

  // Get machine status from API with fallback to default
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

      // Get status from API
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
      
      console.log(`No status found for machine ${machineId}, using default 'available'`);
      return 'available'; // Default status if none found
    } catch (error) {
      console.error("Error getting machine status:", error);
      return 'available'; // Default status if error
    }
  }
  
  // Get machine maintenance note from API
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

      // Get maintenance note from API
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
      
      return undefined;
    } catch (error) {
      console.error("Error getting machine maintenance note:", error);
      return undefined;
    }
  }
  
  // Get machine by ID from API with static data fallback
  async getMachineById(machineId: string): Promise<any | null> {
    try {
      console.log(`Getting machine by ID: ${machineId} via API`);
      
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineById");
        return null;
      }

      // Try all possible endpoints to get machine data
      const endpoints = getApiEndpoints();
      let machineData = null;
      
      for (const baseUrl of endpoints) {
        if (machineData) break;
        try {
          console.log(`Trying to fetch machine ${machineId} from endpoint: ${baseUrl}`);
          const result = await fetch(`${baseUrl}/machines/${machineId}`);
          if (result.ok) {
            machineData = await result.json();
            console.log(`Found machine data at ${baseUrl}:`, machineData);
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch from ${baseUrl}:`, err);
        }
      }
      
      // If we found machine data via direct fetch, return it
      if (machineData) {
        return {
          ...machineData,
          id: machineData._id || machineData.id,
          status: machineData.status?.toLowerCase() || 'available',
          type: machineData.type || "Machine"
        };
      }
      
      // Try using the API service as a fallback
      try {
        console.log(`Fetching machine data for machine ${machineId} via apiService`);
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
      
      // Final fallback to static data
      console.log(`API failed, falling back to static data for machine ${machineId}`);
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
  
  // Get all machines from API with static data fallback
  async getMachines(timestamp?: number): Promise<any[]> {
    try {
      console.log("Getting machines with timestamp:", timestamp || "none");
      
      // Try all possible endpoints to get machines data
      const endpoints = getApiEndpoints();
      let machinesData = null;
      
      for (const baseUrl of endpoints) {
        if (machinesData) break;
        try {
          const url = timestamp 
            ? `${baseUrl}/machines?t=${timestamp}`
            : `${baseUrl}/machines`;
          console.log(`Trying to fetch machines from: ${url}`);
          const result = await fetch(url);
          if (result.ok) {
            machinesData = await result.json();
            console.log(`Found ${machinesData.length} machines at ${baseUrl}`);
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch from ${baseUrl}:`, err);
        }
      }
      
      // If we found machines data via direct fetch, return it
      if (machinesData && Array.isArray(machinesData)) {
        return machinesData.map(machine => ({
          ...machine,
          id: machine.id || machine._id,
          type: machine.type || "Machine",
          status: machine.status?.toLowerCase() || 'available'
        }));
      }
      
      // Try using the API service as a fallback
      try {
        const endpoint = timestamp ? `machines?t=${timestamp}` : 'machines';
        console.log(`Fetching machine list via apiService: ${endpoint}`);
        const response = await apiService.get(endpoint);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Retrieved ${response.data.length} machines from API`);
          
          return response.data.map(machine => ({
            ...machine,
            id: machine.id || machine._id,
            type: machine.type || "Machine",
            status: machine.status?.toLowerCase() || 'available'
          }));
        }
      } catch (error) {
        console.error("API error getting machines:", error);
      }
      
      // Final fallback to static data
      console.log("API failed, falling back to static machines data");
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

// Log initialization
console.log("Machine service initialized.");
