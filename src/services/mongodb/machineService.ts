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
      const machine = await this.machinesCollection.findOne({ _id: machineId });
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
            name: 'Laser Cutter', 
            type: 'Cutting', 
            status: 'Available', 
            description: 'Precision laser cutting machine for detailed work on various materials.', 
            requiresCertification: true,
            difficulty: 'Advanced',
            imageUrl: '/machines/laser-cutter.jpg'
          },
          { 
            _id: '2', 
            name: '3D Printer', 
            type: 'Printing', 
            status: 'Available', 
            description: 'FDM 3D printing for rapid prototyping and model creation.', 
            requiresCertification: true,
            difficulty: 'Intermediate',
            imageUrl: '/machines/3d-printer.jpg'
          },
          { 
            _id: '3', 
            name: 'CNC Router', 
            type: 'Cutting', 
            status: 'Maintenance', 
            description: 'Computer-controlled cutting machine for wood, plastic, and soft metals.', 
            requiresCertification: true,
            difficulty: 'Advanced',
            maintenanceNote: 'Undergoing monthly maintenance, available next week.',
            imageUrl: '/machines/cnc-router.jpg'
          },
          { 
            _id: '4', 
            name: 'Vinyl Cutter', 
            type: 'Cutting', 
            status: 'Available', 
            description: 'For cutting vinyl, paper, and other thin materials for signs and decorations.', 
            requiresCertification: false,
            difficulty: 'Beginner',
            imageUrl: '/machines/vinyl-cutter.jpg'
          },
          { 
            _id: '5', 
            name: 'Safety Cabinet', 
            type: 'Safety', 
            status: 'Available', 
            description: 'Safety equipment storage cabinet.', 
            requiresCertification: false,
            difficulty: 'Beginner',
            imageUrl: '/machines/safety-cabinet.jpg'
          },
          { 
            _id: '6', 
            name: 'Machine Safety Course', 
            type: 'Course', 
            status: 'Available', 
            description: 'Required safety training for using machines.', 
            requiresCertification: false,
            difficulty: 'Beginner',
            imageUrl: '/machines/safety-course.jpg'
          }
        ];
        
        for (const machine of defaultMachines) {
          await this.addMachine(machine);
          
          await this.updateMachineStatus(
            machine._id, 
            machine.status, 
            machine.maintenanceNote
          );
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
