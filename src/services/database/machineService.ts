
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import mongoMachineService from '../mongodb/machineService';

export interface MachineData {
  name: string;
  type: string;
  description: string;
  status: string;
  requiresCertification?: boolean;
  difficulty?: string;
  imageUrl?: string;
  details?: string;
  specifications?: string;
  certificationInstructions?: string;
  linkedCourseId?: string;
  linkedQuizId?: string;
}

/**
 * Service that handles all machine-related database operations.
 */
export class MachineDatabaseService extends BaseService {
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      console.log(`Getting machine status for ID: ${machineId}`);
      const response = await apiService.request(`machines/${machineId}`, 'GET');
      if (response.data) {
        return response.data.status;
      }
    } catch (error) {
      console.error("API error, attempting fallback to MongoDB:", error);
      
      try {
        const machine = await mongoMachineService.getMachineById(machineId);
        if (machine && machine.status) {
          console.log(`Retrieved machine status from MongoDB: ${machine.status}`);
          return machine.status;
        }
      } catch (mongoError) {
        console.error("MongoDB fallback failed:", mongoError);
      }
      
      console.error("All fallbacks failed, using default machine status");
    }
    
    // Default to available if API fails
    return 'Available';
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      console.log(`Updating machine status: ID=${machineId}, status=${status}`);
      const response = await apiService.request(`machines/${machineId}/status`, 'PUT', { status, note }, true);
      if (!response.error) {
        return true;
      }
    } catch (error) {
      console.error("API error, attempting fallback to MongoDB:", error);
    }
    
    // Try MongoDB fallback
    try {
      const result = await mongoMachineService.updateMachineStatus(machineId, status, note);
      return result;
    } catch (mongoError) {
      console.error("MongoDB fallback failed:", mongoError);
      return false;
    }
  }

  async createMachine(machineData: MachineData): Promise<any> {
    console.log("Creating new machine with data:", machineData);
    
    try {
      const response = await apiService.request('machines', 'POST', machineData, true);
      console.log("Machine creation API response:", response);
      
      if (!response.error && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || "API response with no data");
    } catch (error) {
      console.error("API error, attempting fallback to MongoDB:", error);
      
      try {
        // Format the machine data for MongoDB
        const mongoMachine = {
          _id: Date.now().toString(), // Generate a unique ID
          name: machineData.name,
          type: machineData.type,
          description: machineData.description,
          status: machineData.status || 'Available',
          requiresCertification: machineData.requiresCertification !== undefined ? machineData.requiresCertification : true,
          difficulty: machineData.difficulty || 'Intermediate',
          imageUrl: machineData.imageUrl || '/placeholder.svg',
          details: machineData.details,
          specifications: machineData.specifications,
          certificationInstructions: machineData.certificationInstructions,
          linkedCourseId: machineData.linkedCourseId,
          linkedQuizId: machineData.linkedQuizId,
          maintenanceNote: ''
        };
        
        const success = await mongoMachineService.addMachine(mongoMachine);
        if (success) {
          console.log("Successfully added machine to MongoDB:", mongoMachine);
          return mongoMachine;
        }
      } catch (mongoError) {
        console.error("MongoDB fallback failed:", mongoError);
      }
      
      throw new Error("Failed to create machine: All fallbacks failed");
    }
  }

  async updateMachine(machineId: string, machineData: Partial<MachineData>): Promise<any> {
    try {
      console.log(`Updating machine ${machineId} with data:`, machineData);
      const response = await apiService.request(`machines/${machineId}`, 'PUT', machineData, true);
      if (!response.error && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error(`API error, attempting fallback to MongoDB:`, error);
      
      try {
        // For MongoDB update, we need to retrieve the machine first
        const machine = await mongoMachineService.getMachineById(machineId);
        if (machine) {
          // Update the fields
          Object.assign(machine, machineData);
          const success = await mongoMachineService.addMachine(machine);
          if (success) {
            return machine;
          }
        }
      } catch (mongoError) {
        console.error("MongoDB fallback failed:", mongoError);
      }
    }
    throw new Error("Failed to update machine: All fallbacks failed");
  }

  async deleteMachine(machineId: string): Promise<boolean> {
    try {
      console.log(`Deleting machine: ${machineId}`);
      const response = await apiService.request(`machines/${machineId}`, 'DELETE', undefined, true);
      if (!response.error) {
        return true;
      }
    } catch (error) {
      console.error(`API error, could not delete machine ${machineId}:`, error);
    }
    
    // No MongoDB fallback for deletion yet
    return false;
  }

  async getAllMachines(): Promise<any[]> {
    try {
      console.log("Fetching all machines");
      const response = await apiService.request('machines', 'GET');
      
      if (!response.error && response.data) {
        console.log(`Fetched ${response.data.length || 0} machines from API`);
        return response.data || [];
      }
      
      throw new Error(response.error || "API response with no data");
    } catch (error) {
      console.error("API error, attempting fallback to MongoDB:", error);
      
      try {
        const machines = await mongoMachineService.getMachines();
        console.log(`Fetched ${machines.length} machines from MongoDB`);
        return machines;
      } catch (mongoError) {
        console.error("MongoDB fallback failed:", mongoError);
      }
      
      console.log("All fallbacks failed, returning empty array");
      return [];
    }
  }

  async getMachineById(machineId: string): Promise<any> {
    try {
      console.log(`Fetching machine details for ID: ${machineId}`);
      const response = await apiService.request(`machines/${machineId}`, 'GET');
      
      if (!response.error && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error(`API error, attempting fallback to MongoDB:`, error);
      
      try {
        const machine = await mongoMachineService.getMachineById(machineId);
        if (machine) {
          return machine;
        }
      } catch (mongoError) {
        console.error("MongoDB fallback failed:", mongoError);
      }
    }
    
    return null;
  }
  
  // Make sure MongoDB is initialized
  async initializeMongoDB(): Promise<void> {
    try {
      await mongoMachineService.initCollections();
      await mongoMachineService.seedDefaultMachines();
      console.log("MongoDB initialized for machines");
    } catch (error) {
      console.error("Failed to initialize MongoDB for machines:", error);
    }
  }
}

// Create a singleton instance
export const machineDatabaseService = new MachineDatabaseService();

// Initialize MongoDB on startup
machineDatabaseService.initializeMongoDB().catch(error => {
  console.error("Error during MongoDB initialization:", error);
});
