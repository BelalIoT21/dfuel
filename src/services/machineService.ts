
import { Machine } from '../types/database';
import { machines } from '../utils/data';
import { apiService } from './apiService';
import mongoDbService from './mongoDbService';

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

  // Update machine status
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      // Try MongoDB service
      return await mongoDbService.updateMachineStatus(machineId, status, note);
    } catch (error) {
      console.error(`Error updating status for machine ${machineId}:`, error);
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
