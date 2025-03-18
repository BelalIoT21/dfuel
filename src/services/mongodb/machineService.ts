
import mongoConnectionService from './connectionService';

export class MongoMachineService {
  /**
   * Get all machines from MongoDB
   */
  async getAllMachines(): Promise<Machine[]> {
    try {
      const db = await mongoConnectionService.getDb();
      if (!db) return [];
      
      const machinesCollection = db.collection('machines');
      const machines = await machinesCollection.find({}).toArray();
      
      // Transform MongoDB data to match our app's schema
      return machines.map(machine => ({
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
      const db = await mongoConnectionService.getDb();
      if (!db) return null;
      
      const machinesCollection = db.collection('machines');
      const machine = await machinesCollection.findOne({ _id: machineId });
      
      if (!machine) return null;
      
      return {
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
      const db = await mongoConnectionService.getDb();
      if (!db) return null;
      
      const machinesCollection = db.collection('machines');
      const result = await machinesCollection.insertOne(machine);
      
      if (!result.acknowledged) return null;
      
      const newMachine = await machinesCollection.findOne({ _id: result.insertedId });
      if (!newMachine) return null;
      
      return {
        id: newMachine._id || newMachine.id,
        name: newMachine.name,
        type: newMachine.type || 'Generic',
        description: newMachine.description || '',
        status: this.normalizeStatus(newMachine.status),
        difficulty: newMachine.difficulty || 'Intermediate',
        requiresCertification: Boolean(newMachine.requiresCertification),
        imageUrl: newMachine.imageUrl || '',
        specifications: newMachine.specifications || '',
        maintenanceNote: newMachine.maintenanceNote || ''
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
      const db = await mongoConnectionService.getDb();
      if (!db) return null;
      
      const machinesCollection = db.collection('machines');
      const result = await machinesCollection.updateOne(
        { _id: machineId },
        { $set: updates }
      );
      
      if (!result.matchedCount) return null;
      
      const updatedMachine = await machinesCollection.findOne({ _id: machineId });
      if (!updatedMachine) return null;
      
      return {
        id: updatedMachine._id || updatedMachine.id,
        name: updatedMachine.name,
        type: updatedMachine.type || 'Generic',
        description: updatedMachine.description || '',
        status: this.normalizeStatus(updatedMachine.status),
        difficulty: updatedMachine.difficulty || 'Intermediate',
        requiresCertification: Boolean(updatedMachine.requiresCertification),
        imageUrl: updatedMachine.imageUrl || '',
        specifications: updatedMachine.specifications || '',
        maintenanceNote: updatedMachine.maintenanceNote || ''
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
      const db = await mongoConnectionService.getDb();
      if (!db) return false;
      
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
      
      // Prepare the update document
      const update: any = { status: serverStatus };
      
      // Only include maintenanceNote if it's defined
      if (note !== undefined) {
        // If status is available, clear the note
        if (status.toLowerCase() === 'available') {
          update.maintenanceNote = '';
        } else {
          update.maintenanceNote = note;
        }
      }

      // Use updateOne with string _id
      const machinesCollection = db.collection('machines');
      const result = await machinesCollection.updateOne(
        { _id: machineId },
        { $set: update }
      );
      
      console.log(`Update result for machine ${machineId}:`, result);
      return result.matchedCount > 0;
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
      const db = await mongoConnectionService.getDb();
      if (!db) return false;
      
      const machinesCollection = db.collection('machines');
      const result = await machinesCollection.deleteOne({ _id: machineId });
      
      return result.deletedCount > 0;
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

  /**
   * Seed default machines into the database
   */
  async seedDefaultMachines(): Promise<void> {
    try {
      console.log('Checking for missing machines to seed...');
      
      const db = await mongoConnectionService.getDb();
      if (!db) {
        console.error('Failed to connect to database for machine seeding');
        return;
      }
      
      const machinesCollection = db.collection('machines');
      
      // Define the default machines with their IDs
      const defaultMachines = [
        {
          _id: '1',
          name: 'Laser Cutter',
          type: 'Laser Cutter',
          description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/laser-cutter.jpg',
          specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather',
        },
        {
          _id: '2',
          name: 'Ultimaker',
          type: '3D Printer',
          description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/3d-printer.jpg',
          specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU',
        },
        {
          _id: '3',
          name: 'X1 E Carbon 3D Printer',
          type: '3D Printer',
          description: 'High-speed multi-material 3D printer with exceptional print quality.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/bambu-printer.jpg',
          specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS',
        },
        {
          _id: '4',
          name: 'Bambu Lab X1 E',
          type: '3D Printer',
          description: 'Next-generation 3D printing technology with advanced features.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Advanced',
          imageUrl: '/machines/cnc-mill.jpg',
          specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 600mm/s, Materials: PLA, PETG, TPU, ABS, PC',
        },
        {
          _id: '5',
          name: 'Safety Cabinet',
          type: 'Safety Equipment',
          description: 'Store hazardous materials safely.',
          status: 'Available',
          requiresCertification: true,
          difficulty: 'Basic',
          imageUrl: '/machines/safety-cabinet.jpg',
          specifications: 'Capacity: 30 gallons, Fire resistant: 2 hours',
        },
        {
          _id: '6',
          name: 'Safety Course',
          type: 'Certification',
          description: 'Basic safety training for the makerspace.',
          status: 'Available',
          requiresCertification: false,
          difficulty: 'Basic',
          imageUrl: '/machines/safety-course.jpg',
          specifications: 'Duration: 1 hour, Required for all makerspace users',
        }
      ];
      
      // Check each machine and insert if missing
      for (const machine of defaultMachines) {
        const existingMachine = await machinesCollection.findOne({ _id: machine._id });
        
        if (!existingMachine) {
          console.log(`Seeding machine with ID ${machine._id} (${machine.name})`);
          await machinesCollection.insertOne(machine);
        } else {
          console.log(`Machine ${machine._id} (${machine.name}) already exists`);
        }
      }
      
      console.log('Machine seeding complete');
    } catch (error) {
      console.error('Error seeding default machines:', error);
    }
  }
}

const mongoMachineService = new MongoMachineService();
export default mongoMachineService;

