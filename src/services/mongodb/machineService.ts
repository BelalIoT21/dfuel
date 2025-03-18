
import { connectionService } from './connectionService';
import { Machine, MachineInput } from './types';

export class MongoDbMachineService {
  /**
   * Get all machines from MongoDB
   */
  async getAllMachines(): Promise<Machine[]> {
    try {
      const connection = await connectionService.getConnection();
      const { data } = await connection.get('/machines');
      
      if (Array.isArray(data)) {
        // Transform MongoDB data to match our app's schema
        return data.map(machine => ({
          id: machine._id || machine.id,
          name: machine.name,
          type: machine.type || 'Generic',
          description: machine.description || '',
          status: this.normalizeStatus(machine.status),
          difficulty: machine.difficulty || 'Intermediate',
          requiresCertification: Boolean(machine.requiresCertification),
          imageUrl: machine.imageUrl || '',
          specifications: machine.specifications || '',
          maintenanceNote: machine.maintenanceNote || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching machines from MongoDB:', error);
      return [];
    }
  }

  /**
   * Get a machine by ID from MongoDB
   */
  async getMachineById(machineId: string): Promise<Machine | null> {
    try {
      const connection = await connectionService.getConnection();
      const { data } = await connection.get(`/machines/${machineId}`);
      
      if (!data) return null;
      
      return {
        id: data._id || data.id,
        name: data.name,
        type: data.type || 'Generic',
        description: data.description || '',
        status: this.normalizeStatus(data.status),
        difficulty: data.difficulty || 'Intermediate',
        requiresCertification: Boolean(data.requiresCertification),
        imageUrl: data.imageUrl || '',
        specifications: data.specifications || '',
        maintenanceNote: data.maintenanceNote || ''
      };
    } catch (error) {
      console.error(`Error fetching machine ${machineId} from MongoDB:`, error);
      return null;
    }
  }

  /**
   * Create a new machine in MongoDB
   */
  async createMachine(machine: MachineInput): Promise<Machine | null> {
    try {
      const connection = await connectionService.getConnection();
      const { data } = await connection.post('/machines', machine);
      
      if (!data) return null;
      
      return {
        id: data._id || data.id,
        name: data.name,
        type: data.type || 'Generic',
        description: data.description || '',
        status: this.normalizeStatus(data.status),
        difficulty: data.difficulty || 'Intermediate',
        requiresCertification: Boolean(data.requiresCertification),
        imageUrl: data.imageUrl || '',
        specifications: data.specifications || '',
        maintenanceNote: data.maintenanceNote || ''
      };
    } catch (error) {
      console.error('Error creating machine in MongoDB:', error);
      return null;
    }
  }

  /**
   * Update a machine in MongoDB
   */
  async updateMachine(machineId: string, updates: Partial<MachineInput>): Promise<Machine | null> {
    try {
      const connection = await connectionService.getConnection();
      const { data } = await connection.put(`/machines/${machineId}`, updates);
      
      if (!data || !data.machine) return null;
      
      return {
        id: data.machine._id || data.machine.id,
        name: data.machine.name,
        type: data.machine.type || 'Generic',
        description: data.machine.description || '',
        status: this.normalizeStatus(data.machine.status),
        difficulty: data.machine.difficulty || 'Intermediate',
        requiresCertification: Boolean(data.machine.requiresCertification),
        imageUrl: data.machine.imageUrl || '',
        specifications: data.machine.specifications || '',
        maintenanceNote: data.machine.maintenanceNote || ''
      };
    } catch (error) {
      console.error(`Error updating machine ${machineId} in MongoDB:`, error);
      return null;
    }
  }

  /**
   * Update a machine's status in MongoDB
   */
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      const connection = await connectionService.getConnection();
      
      console.log(`MongoDB: Updating machine ${machineId} status to ${status} with note: ${note}`);
      
      // Convert client-side status to server-side format
      let serverStatus: string;
      switch(status.toLowerCase()) {
        case 'in-use':
          serverStatus = 'In Use';
          break;
        case 'maintenance':
          serverStatus = 'Maintenance';
          break;
        case 'available':
          serverStatus = 'Available';
          break;
        default:
          serverStatus = 'Available';
      }
      
      // Prepare the request body
      const requestBody: any = { status: serverStatus };
      
      // Only include maintenanceNote if it's defined
      if (note !== undefined) {
        // If status is available, clear the note
        if (status.toLowerCase() === 'available') {
          requestBody.maintenanceNote = '';
        } else {
          requestBody.maintenanceNote = note;
        }
      }
      
      const { data } = await connection.put(`/machines/${machineId}/status`, requestBody);
      
      return data && data.success === true;
    } catch (error) {
      console.error(`Error updating machine ${machineId} status in MongoDB:`, error);
      return false;
    }
  }

  /**
   * Delete a machine from MongoDB
   */
  async deleteMachine(machineId: string): Promise<boolean> {
    try {
      const connection = await connectionService.getConnection();
      const { data } = await connection.delete(`/machines/${machineId}`);
      
      return data && data.message === 'Machine deleted successfully';
    } catch (error) {
      console.error(`Error deleting machine ${machineId} from MongoDB:`, error);
      return false;
    }
  }

  /**
   * Helper method to normalize status from server to client format
   */
  private normalizeStatus(status?: string): string {
    if (!status) return 'available';
    
    const lowercaseStatus = status.toLowerCase();
    
    if (lowercaseStatus === 'in use') {
      return 'in-use';
    }
    
    return lowercaseStatus;
  }
  
  /**
   * Check and ensure all required machines (1-6) exist in the database
   */
  async checkAllMachinesExist(): Promise<boolean> {
    try {
      console.log('MongoDB: Checking if all required machines exist...');
      
      const machines = await this.getAllMachines();
      const machineIds = machines.map(m => m.id);
      
      const requiredIds = ['1', '2', '3', '4', '5', '6'];
      const missingIds = requiredIds.filter(id => !machineIds.includes(id));
      
      if (missingIds.length > 0) {
        console.log(`MongoDB: Missing machines with IDs: ${missingIds.join(', ')}`);
        return false;
      }
      
      console.log('MongoDB: All required machines exist');
      return true;
    } catch (error) {
      console.error('Error checking if all machines exist in MongoDB:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const mongoDbMachineService = new MongoDbMachineService();
