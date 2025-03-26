
import { apiService } from './apiService';

class MachineService {
  // Get all machines with filtering for display - use for regular UI
  async getMachines() {
    try {
      console.log("Getting machines with filtering");
      const response = await apiService.get('machines');
      
      if (response.error) {
        console.error("Error fetching machines:", response.error);
        return [];
      }
      
      // Apply any filtering needed for UI display
      const filteredMachines = response.data.filter(machine => {
        // No filtering for now - return all machines
        return true;
      });
      
      console.log(`Retrieved ${filteredMachines.length} machines from API (filtered)`);
      return filteredMachines;
    } catch (error) {
      console.error("Error in machineService.getMachines:", error);
      return [];
    }
  }
  
  // Get ALL machines without any filtering - important for admin functions and certification management
  async getAllMachines() {
    try {
      console.log("Getting all machines without filtering");
      const response = await apiService.get('machines');
      
      if (response.error) {
        console.error("Error fetching all machines:", response.error);
        return [];
      }
      
      // Do not filter anything
      console.log(`Retrieved ${response.data.length} machines from API (unfiltered)`);
      return response.data;
    } catch (error) {
      console.error("Error in machineService.getAllMachines:", error);
      return [];
    }
  }

  async getMachineById(id: string) {
    try {
      console.log(`Getting machine with ID: ${id}`);
      const response = await apiService.get(`machines/${id}`);
      
      if (response.error) {
        console.error(`Error fetching machine ${id}:`, response.error);
        return null;
      }
      
      console.log(`Retrieved machine ${id}:`, response.data ? response.data.name : 'undefined');
      return response.data;
    } catch (error) {
      console.error(`Error in machineService.getMachineById(${id}):`, error);
      return null;
    }
  }

  async getMachineStatus(id: string) {
    try {
      const response = await apiService.get(`machines/${id}/status`);
      
      if (response.error) {
        console.error(`Error fetching status for machine ${id}:`, response.error);
        return "unknown";
      }
      
      console.log(`Found status for machine ${id}: ${response.data.status}`);
      return response.data.status;
    } catch (error) {
      console.error(`Error in machineService.getMachineStatus(${id}):`, error);
      return "unknown";
    }
  }
  
  // Add more methods for machine operations as needed
}

export const machineService = new MachineService();
