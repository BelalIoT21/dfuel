
import { Machine } from '../types/database';
import { machines } from '../utils/data';
import { apiService } from './apiService';
import mongoDbService from './mongoDbService';
import { toast } from '@/components/ui/use-toast';

class MachineService {
  private machineCache: Machine[] | null = null;
  private lastCacheTime: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Get all machines
  async getMachines(): Promise<Machine[]> {
    try {
      // Return from cache if valid
      if (this.machineCache && (Date.now() - this.lastCacheTime) < this.CACHE_DURATION) {
        console.log('Using cached machines data');
        return this.machineCache;
      }

      console.log('Attempting to get machines from MongoDB service...');
      // First try MongoDB service
      const mongoMachines = await mongoDbService.getAllMachines();
      
      if (mongoMachines && mongoMachines.length > 0) {
        console.log(`Got ${mongoMachines.length} machines from MongoDB service`);
        // Set cache
        this.machineCache = mongoMachines;
        this.lastCacheTime = Date.now();
        return mongoMachines;
      }
      
      // If MongoDB fails, use local data
      console.log('Using local machine data:', machines.length);
      
      // Set cache
      this.machineCache = machines;
      this.lastCacheTime = Date.now();
      
      return machines;
    } catch (error) {
      console.error('Error getting machines from API:', error);
      
      // Return from cache even if expired as a fallback
      if (this.machineCache) {
        console.log('Using expired cached machines data as fallback');
        return this.machineCache;
      }
      
      // Last resort: return local data
      console.log('Using local machine data:', machines.length);
      return machines;
    }
  }

  // Get machine by ID
  async getMachineById(id: string): Promise<Machine | undefined> {
    try {
      // First try MongoDB service
      const machine = await mongoDbService.getMachineById(id);
      if (machine) {
        return machine;
      }
      
      // If MongoDB fails, use local data
      return machines.find(machine => machine.id === id);
    } catch (error) {
      console.error(`Error getting machine ${id} from API:`, error);
      // Fallback to local data
      return machines.find(machine => machine.id === id);
    }
  }

  // Get machine status
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      // Try MongoDB service
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        return status;
      }
      return 'available'; // Default status
    } catch (error) {
      console.error(`Error getting status for machine ${machineId}:`, error);
      return 'available'; // Default status
    }
  }

  // Update machine status with improved feedback
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      console.log(`Updating status for machine ${machineId} to ${status}${note ? ` with note: ${note}` : ''}`);
      
      // First try direct API call
      const response = await apiService.updateMachineStatus(machineId, status, note);
      if (response && !response.error) {
        console.log(`Successfully updated machine status via API: ${machineId}`);
        toast({
          title: "Status Updated",
          description: `Machine status has been updated to ${status}`,
        });
        return true;
      }
      
      // Then try MongoDB service
      const mongoResult = await mongoDbService.updateMachineStatus(machineId, status, note);
      if (mongoResult) {
        console.log(`Successfully updated machine status via MongoDB: ${machineId}`);
        toast({
          title: "Status Updated",
          description: `Machine status has been updated to ${status}`,
        });
        return true;
      }
      
      // If both failed, show error
      console.error(`Failed to update machine status: ${machineId}`);
      toast({
        title: "Update Failed",
        description: "Could not update machine status. Please try again.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error(`Error updating status for machine ${machineId}:`, error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating status",
        variant: "destructive"
      });
      return false;
    }
  }

  // Clear machine cache
  clearCache() {
    this.machineCache = null;
    this.lastCacheTime = 0;
  }
}

// Singleton instance
export const machineService = new MachineService();

// Also export for direct access if needed
export default machineService;
