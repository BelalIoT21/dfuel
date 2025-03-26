import { apiService } from './apiService';

export class MachineService {
  // Update machine status - use API only
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      console.log(`Updating machine status: ID=${machineId}, status=${status}`);
      
      if (!machineId || !status) {
        console.error("Invalid machineId or status passed to updateMachineStatus");
        return false;
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

  // Get machine status - now uses the dedicated status endpoint only
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineStatus");
        return 'available';
      }
      
      // Special handling for Safety Cabinet and Machine Safety Course
      if (machineId === "5" || machineId === "6") {
        return 'available'; // Always available
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
  
  // Get machine maintenance note - API only
  async getMachineMaintenanceNote(machineId: string): Promise<string | undefined> {
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineMaintenanceNote");
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
  
  // Get machine by ID - API only
  async getMachineById(machineId: string): Promise<any | null> {
    try {
      console.log(`Getting machine by ID: ${machineId}`);
      
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineById");
        return null;
      }
      
      // Special handling for safety machines
      if (machineId === "5") {
        return {
          id: "5",
          _id: "5",
          name: "Safety Cabinet",
          type: "Safety Equipment",
          description: "For safely storing hazardous materials",
          status: "available",
          linkedCourseId: "5",
          linkedQuizId: "5",
          requiresCertification: true
        };
      }
      
      if (machineId === "6") {
        return {
          id: "6",
          _id: "6",
          name: "Machine Safety Course",
          type: "Safety Course",
          description: "Essential safety training for all machine users",
          status: "available",
          linkedCourseId: "6",
          linkedQuizId: "6",
          requiresCertification: true
        };
      }
      
      // Use API to get machine by ID
      try {
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data) {
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
      
      console.error(`Machine not found with ID: ${machineId}`);
      return null;
    } catch (error) {
      console.error(`Error getting machine with ID ${machineId}:`, error);
      return null;
    }
  }
  
  // Get machines - API only - Don't filter out machines 5 & 6
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
          const machines = response.data.map(machine => ({
            ...machine,
            id: machine.id || machine._id,
            type: machine.type || "Machine",
            status: machine.status?.toLowerCase() || 'available'
          }));
          
          // Add special machines if they don't exist
          const specialMachines = [
            {
              id: "5",
              name: "Safety Cabinet",
              type: "Safety Equipment",
              description: "For safely storing hazardous materials",
              status: "available",
              linkedCourseId: "5",
              linkedQuizId: "5",
              requiresCertification: true
            },
            {
              id: "6",
              name: "Machine Safety Course",
              type: "Safety Course",
              description: "Essential safety training for all machine users",
              status: "available",
              linkedCourseId: "6",
              linkedQuizId: "6",
              requiresCertification: true
            }
          ];
          
          // Check if the special machines already exist
          for (const specialMachine of specialMachines) {
            if (!machines.some(m => m.id === specialMachine.id)) {
              machines.push(specialMachine);
            }
          }
          
          return machines;
        } else {
          console.error("API returned invalid data format for machines:", response.data);
        }
      } catch (error) {
        console.error("API error getting machines:", error);
      }
      
      console.log("No machines found in API");
      return []; // Return empty array instead of falling back to static data
    } catch (error) {
      console.error("Error getting machines data:", error);
      return []; // Return empty array on error
    }
  }

  // Add a method to get all machines including special ones
  async getAllMachines(): Promise<any[]> {
    try {
      console.log("Getting all machines without filtering");
      
      // Use API to get machines
      try {
        const response = await apiService.get('machines');
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Retrieved ${response.data.length} machines from API (unfiltered)`);
          
          // Ensure each machine has an id field (might be _id in MongoDB)
          const machines = response.data.map(machine => ({
            ...machine,
            id: machine.id || machine._id,
            type: machine.type || "Machine",
            status: machine.status?.toLowerCase() || 'available'
          }));
          
          // Add special machines if they don't exist
          const specialMachines = [
            {
              id: "5",
              name: "Safety Cabinet",
              type: "Safety Equipment",
              description: "For safely storing hazardous materials",
              status: "available",
              linkedCourseId: "5",
              linkedQuizId: "5",
              requiresCertification: true
            },
            {
              id: "6",
              name: "Machine Safety Course",
              type: "Safety Course",
              description: "Essential safety training for all machine users",
              status: "available",
              linkedCourseId: "6",
              linkedQuizId: "6",
              requiresCertification: true
            }
          ];
          
          // Check if the special machines already exist
          for (const specialMachine of specialMachines) {
            if (!machines.some(m => m.id === specialMachine.id)) {
              machines.push(specialMachine);
            }
          }
          
          return machines;
        } else {
          console.error("API returned invalid data format for machines:", response.data);
        }
      } catch (error) {
        console.error("API error getting all machines:", error);
      }
      
      console.log("No machines found in API");
      return []; // Return empty array
    } catch (error) {
      console.error("Error getting machines data:", error);
      return []; // Return empty array on error
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();

console.log("Machine service initialized (localStorage removed).");
