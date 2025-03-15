
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
          // Normalize MongoDB machine data to match localStorage format
          const normalizedMachines = mongoMachines.map(machine => ({
            id: machine._id?.toString() || machine.id || '',
            name: machine.name || '',
            type: machine.type || '',
            description: machine.description || '',
            image: machine.imageUrl || '/placeholder.svg',
            requiresCertification: machine.requiresCertification || false,
            certification: machine.certification || null,
            steps: machine.steps || [],
            status: machine.status || 'Available'
          }));
          return normalizedMachines;
        }
      } catch (mongoError) {
        console.error('Error getting machines from MongoDB:', mongoError);
      }
      
      // Try the API next
      try {
        const response = await apiService.getMachines();
        if (response.data && response.data.length > 0) {
          console.log('Using API machines:', response.data.length);
          // Normalize API machine data
          const normalizedMachines = response.data.map(machine => ({
            id: machine._id?.toString() || machine.id || '',
            name: machine.name || '',
            type: machine.type || '',
            description: machine.description || '',
            image: machine.imageUrl || '/placeholder.svg',
            requiresCertification: machine.requiresCertification || false,
            certification: machine.certification || null,
            steps: machine.steps || [],
            status: machine.status || 'Available'
          }));
          return normalizedMachines;
        }
      } catch (apiError) {
        console.error('Error getting machines from API:', apiError);
      }
      
      // Use static mappings for certain IDs
      const staticMachineMap = {
        "1": { id: "1", name: "Laser Cutter", type: "Laser Cutter" },
        "2": { id: "2", name: "Ultimaker", type: "3D Printer" },
        "3": { id: "3", name: "Safety Course", type: "Safety Course" },
        "5": { id: "5", name: "X1 E Carbon 3D Printer", type: "3D Printer" },
        "6": { id: "6", name: "Soldering Station", type: "Electronics" },
        "8": { id: "8", name: "Safety Cabinet", type: "Workshop" }
      };
      
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
    
    // Check for static machine mapping first for consistent names
    const staticMachineMap: Record<string, any> = {
      "1": { id: "1", name: "Laser Cutter", type: "Laser Cutter" },
      "2": { id: "2", name: "Ultimaker", type: "3D Printer" },
      "3": { id: "3", name: "Safety Course", type: "Safety Course" },
      "5": { id: "5", name: "X1 E Carbon 3D Printer", type: "3D Printer" },
      "6": { id: "6", name: "Soldering Station", type: "Electronics" },
      "8": { id: "8", name: "Safety Cabinet", type: "Workshop" }
    };
    
    if (staticMachineMap[id]) {
      console.log('Using static machine mapping for ID:', id);
      return staticMachineMap[id];
    }
    
    try {
      // Check if it's a MongoDB ID
      if (id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
        try {
          const mongoMachine = await mongoDbService.getMachineByMongoId(id);
          if (mongoMachine) {
            console.log('Found machine by MongoDB ID:', id);
            // Normalize MongoDB machine data
            return {
              id: mongoMachine._id?.toString() || mongoMachine.id || id,
              name: mongoMachine.name || '',
              type: mongoMachine.type || '',
              description: mongoMachine.description || '',
              image: mongoMachine.imageUrl || '/placeholder.svg',
              requiresCertification: mongoMachine.requiresCertification || false,
              certification: mongoMachine.certification || null,
              steps: mongoMachine.steps || [],
              status: mongoMachine.status || 'Available'
            };
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
          // Normalize MongoDB machine data
          return {
            id: mongoMachine._id?.toString() || mongoMachine.id || id,
            name: mongoMachine.name || '',
            type: mongoMachine.type || '',
            description: mongoMachine.description || '',
            image: mongoMachine.imageUrl || '/placeholder.svg',
            requiresCertification: mongoMachine.requiresCertification || false,
            certification: mongoMachine.certification || null,
            steps: mongoMachine.steps || [],
            status: mongoMachine.status || 'Available'
          };
        }
      } catch (mongoError) {
        console.error('Error getting machine by ID from MongoDB:', mongoError);
      }
      
      // Try API
      try {
        const response = await apiService.getMachineById(id);
        if (response.data) {
          console.log('Found machine by ID in API:', id);
          // Normalize API machine data
          return {
            id: response.data._id?.toString() || response.data.id || id,
            name: response.data.name || '',
            type: response.data.type || '',
            description: response.data.description || '',
            image: response.data.imageUrl || '/placeholder.svg',
            requiresCertification: response.data.requiresCertification || false,
            certification: response.data.certification || null,
            steps: response.data.steps || [],
            status: response.data.status || 'Available'
          };
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
      const mongoMachine = await mongoDbService.getMachineByMongoId(mongoId);
      if (mongoMachine) {
        // Normalize MongoDB machine data
        return {
          id: mongoMachine._id?.toString() || mongoMachine.id || mongoId,
          name: mongoMachine.name || '',
          type: mongoMachine.type || '',
          description: mongoMachine.description || '',
          image: mongoMachine.imageUrl || '/placeholder.svg',
          requiresCertification: mongoMachine.requiresCertification || false,
          certification: mongoMachine.certification || null,
          steps: mongoMachine.steps || [],
          status: mongoMachine.status || 'Available'
        };
      }
      return null;
    } catch (error) {
      console.error('Error in getMachineByMongoId:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const machineService = new MachineService();
