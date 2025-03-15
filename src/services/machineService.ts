
import { machines } from '../utils/data';
import mongoDbService from './mongoDbService';
import { apiService } from './apiService';

export class MachineService {
  async getMachines() {
    try {
      // Try to get machines from MongoDB first
      try {
        const mongoMachines = await mongoDbService.getAllMachines();
        if (mongoMachines && mongoMachines.length > 0) {
          console.log('Using MongoDB machines:', mongoMachines.length);
          return mongoMachines;
        }
      } catch (mongoError) {
        console.error('Error getting machines from MongoDB:', mongoError);
      }
      
      // Try the API next
      try {
        const response = await apiService.getMachines();
        if (response.data && response.data.length > 0) {
          console.log('Using API machines:', response.data.length);
          return response.data;
        }
      } catch (apiError) {
        console.error('Error getting machines from API:', apiError);
      }
      
      // Fall back to local data
      console.log('Using local machine data:', machines.length);
      return machines;
    } catch (error) {
      console.error('Error in getMachines:', error);
      return machines;
    }
  }
  
  async getMachineById(id: string) {
    if (!id) return null;
    
    try {
      // Check if it's a MongoDB ID
      if (id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
        try {
          const mongoMachine = await mongoDbService.getMachineByMongoId(id);
          if (mongoMachine) {
            console.log('Found machine by MongoDB ID:', id);
            return mongoMachine;
          }
        } catch (mongoError) {
          console.error('Error getting machine by MongoDB ID:', mongoError);
        }
      }
      
      // Try direct MongoDB lookup by any ID
      try {
        const mongoMachine = await mongoDbService.getMachineById(id);
        if (mongoMachine) {
          console.log('Found machine by ID in MongoDB:', id);
          return mongoMachine;
        }
      } catch (mongoError) {
        console.error('Error getting machine by ID from MongoDB:', mongoError);
      }
      
      // Try API
      try {
        const response = await apiService.getMachineById(id);
        if (response.data) {
          console.log('Found machine by ID in API:', id);
          return response.data;
        }
      } catch (apiError) {
        console.error('Error getting machine by ID from API:', apiError);
      }
      
      // Fall back to local data
      const machine = machines.find(m => m.id === id);
      return machine || null;
    } catch (error) {
      console.error('Error in getMachineById:', error);
      return null;
    }
  }
  
  // Special method for MongoDB IDs
  async getMachineByMongoId(mongoId: string) {
    if (!mongoId) return null;
    
    try {
      return await mongoDbService.getMachineByMongoId(mongoId);
    } catch (error) {
      console.error('Error in getMachineByMongoId:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();
