import { Collection } from 'mongodb';
import { MongoMachineStatus, MongoMachine } from './types';
import mongoConnectionService from './connectionService';

class MongoMachineService {
  private machineStatusesCollection: Collection<MongoMachineStatus> | null = null;
  private machinesCollection: Collection<MongoMachine> | null = null;
  
  async initCollections(): Promise<void> {
    try {
      if (!this.machineStatusesCollection || !this.machinesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.machineStatusesCollection = db.collection<MongoMachineStatus>('machineStatuses');
          this.machinesCollection = db.collection<MongoMachine>('machines');
          
          // Log collection details for debugging
          console.log(`MongoDB Collections initialized: 
            - machineStatuses: ${this.machineStatusesCollection ? 'OK' : 'Failed'}
            - machines: ${this.machinesCollection ? 'OK' : 'Failed'}`);
          
          // Check if machines collection is empty and log it
          if (this.machinesCollection) {
            const count = await this.machinesCollection.countDocuments();
            console.log(`Machines collection has ${count} documents`);
          }
        } else {
          console.error("Failed to connect to MongoDB database");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB collections:", error);
    }
  }
  
  async getMachineStatuses(): Promise<MongoMachineStatus[]> {
    await this.initCollections();
    if (!this.machineStatusesCollection) return [];
    
    try {
      return await this.machineStatusesCollection.find().toArray();
    } catch (error) {
      console.error("Error getting machine statuses from MongoDB:", error);
      return [];
    }
  }
  
  async getMachineStatus(machineId: string): Promise<MongoMachineStatus | null> {
    await this.initCollections();
    if (!this.machineStatusesCollection) return null;
    
    try {
      return await this.machineStatusesCollection.findOne({ machineId });
    } catch (error) {
      console.error("Error getting machine status from MongoDB:", error);
      return null;
    }
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    await this.initCollections();
    if (!this.machineStatusesCollection) return false;
    
    try {
      const result = await this.machineStatusesCollection.updateOne(
        { machineId },
        { $set: { machineId, status, note } },
        { upsert: true }
      );
      
      return result.acknowledged;
    } catch (error) {
      console.error("Error updating machine status in MongoDB:", error);
      return false;
    }
  }
  
  async getMachines(): Promise<MongoMachine[]> {
    await this.initCollections();
    if (!this.machinesCollection) return [];
    
    try {
      const machines = await this.machinesCollection.find().toArray();
      console.log(`Retrieved ${machines.length} machines from MongoDB`);
      return machines;
    } catch (error) {
      console.error("Error getting machines from MongoDB:", error);
      return [];
    }
  }
  
  async getMachineById(machineId: string): Promise<MongoMachine | null> {
    await this.initCollections();
    if (!this.machinesCollection) return null;
    
    try {
      let machine = await this.machinesCollection.findOne({ _id: machineId });
      
      if (!machine) {
        machine = await this.machinesCollection.findOne({ id: machineId });
      }
      
      console.log(`Retrieved machine from MongoDB: ${machine?.name || 'not found'}`);
      return machine;
    } catch (error) {
      console.error("Error getting machine by ID from MongoDB:", error);
      return null;
    }
  }
  
  async getMachineByName(machineName: string): Promise<MongoMachine | null> {
    await this.initCollections();
    if (!this.machinesCollection) return null;
    
    try {
      return await this.machinesCollection.findOne({ name: machineName });
    } catch (error) {
      console.error("Error getting machine by name from MongoDB:", error);
      return null;
    }
  }
  
  async machineExists(machineId: string): Promise<boolean> {
    await this.initCollections();
    if (!this.machinesCollection) return false;
    
    try {
      const count = await this.machinesCollection.countDocuments({ _id: machineId });
      return count > 0;
    } catch (error) {
      console.error("Error checking if machine exists in MongoDB:", error);
      return false;
    }
  }
  
  async addMachine(machine: MongoMachine): Promise<boolean> {
    await this.initCollections();
    if (!this.machinesCollection) return false;
    
    try {
      const exists = await this.machineExists(machine._id);
      if (exists) {
        console.log(`Machine with ID ${machine._id} already exists in MongoDB`);
        const result = await this.machinesCollection.updateOne(
          { _id: machine._id },
          { $set: machine }
        );
        return result.acknowledged;
      }
      
      const result = await this.machinesCollection.insertOne(machine);
      console.log(`Machine with ID ${machine._id} added to MongoDB: ${machine.name}`);
      return result.acknowledged;
    } catch (error) {
      console.error("Error adding machine to MongoDB:", error);
      return false;
    }
  }
  
  async seedDefaultMachines(): Promise<void> {
    await this.initCollections();
    if (!this.machinesCollection) return;
    
    try {
      const count = await this.machinesCollection.countDocuments();
      if (count === 0) {
        console.log("No machines found in MongoDB, seeding default machines...");
        
        const defaultMachines: MongoMachine[] = [
          { 
            _id: '1', 
            name: 'Epilog Laser Cutter', 
            type: 'Laser Cutter', 
            status: 'Available', 
            description: 'Professional grade 120W CO2 laser cutter for precision cutting and engraving.', 
            requiresCertification: true,
            difficulty: 'Intermediate',
            imageUrl: '/machines/laser-cutter.jpg',
            specifications: 'Working area: 32" x 20", Power: 120W, Materials: Wood, Acrylic, Paper, Leather'
          },
          { 
            _id: '2', 
            name: 'Ultimaker S5', 
            type: '3D Printer', 
            status: 'Available', 
            description: 'Dual-extrusion 3D printer for high-quality prototypes and functional models.', 
            requiresCertification: true,
            difficulty: 'Intermediate',
            imageUrl: '/machines/3d-printer.jpg',
            specifications: 'Build volume: 330 x 240 x 300 mm, Nozzle diameter: 0.4mm, Materials: PLA, ABS, Nylon, TPU'
          },
          { 
            _id: '3', 
            name: 'Machine Safety Course', 
            type: 'Safety Course', 
            status: 'Available', 
            description: 'Required safety training for all makerspace users.', 
            requiresCertification: false,
            difficulty: 'Beginner',
            imageUrl: '/machines/safety.jpg'
          },
          { 
            _id: '4', 
            name: 'HAAS CNC Mill', 
            type: 'CNC Machine', 
            status: 'Available', 
            description: 'Industrial CNC milling machine for precision metalworking.', 
            requiresCertification: true,
            difficulty: 'Advanced',
            imageUrl: '/machines/cnc-mill.jpg',
            specifications: 'Work area: 40" x 20" x 25", Materials: Aluminum, Steel, Plastics'
          },
          { 
            _id: '5', 
            name: 'Bambu Lab X1 Carbon', 
            type: '3D Printer', 
            status: 'Available', 
            description: 'High-speed multi-material 3D printer with exceptional print quality.', 
            requiresCertification: true,
            difficulty: 'Intermediate',
            imageUrl: '/machines/bambu-printer.jpg',
            specifications: 'Build volume: 256 x 256 x 256 mm, Max Speed: 500mm/s, Materials: PLA, PETG, TPU, ABS'
          },
          { 
            _id: '6', 
            name: 'Soldering Station', 
            type: 'Electronics', 
            status: 'Available', 
            description: 'Professional soldering station for electronics work.', 
            requiresCertification: true,
            difficulty: 'Intermediate',
            imageUrl: '/machines/soldering-station.jpg',
            specifications: 'Temperature range: 200°C-450°C, Digital control, ESD safe'
          },
          { 
            _id: '7', 
            name: 'Vinyl Cutter', 
            type: 'Cutting', 
            status: 'Maintenance', 
            description: 'Precision vinyl cutter for signs, stickers, and heat transfers.', 
            requiresCertification: false,
            difficulty: 'Beginner',
            imageUrl: '/machines/vinyl-cutter.jpg',
            maintenanceNote: 'Replacing cutting blade, available next week.',
            specifications: 'Cutting width: 24", Materials: Vinyl, Paper, Heat Transfer Vinyl'
          },
          { 
            _id: '8', 
            name: 'Woodworking Tools', 
            type: 'Workshop', 
            status: 'Available', 
            description: 'Full suite of woodworking hand tools and power tools.', 
            requiresCertification: true,
            difficulty: 'Intermediate',
            imageUrl: '/machines/woodworking.jpg'
          }
        ];
        
        for (const machine of defaultMachines) {
          await this.machinesCollection.insertOne(machine);
          
          if (this.machineStatusesCollection) {
            await this.machineStatusesCollection.updateOne(
              { machineId: machine._id },
              { $set: { 
                machineId: machine._id, 
                status: machine.status, 
                note: machine.maintenanceNote 
              }},
              { upsert: true }
            );
          }
        }
        
        console.log("Successfully seeded default machines to MongoDB");
      } else {
        console.log(`Found ${count} existing machines in MongoDB, skipping seed`);
      }
    } catch (error) {
      console.error("Error seeding default machines to MongoDB:", error);
    }
  }
}

const mongoMachineService = new MongoMachineService();
export default mongoMachineService;
