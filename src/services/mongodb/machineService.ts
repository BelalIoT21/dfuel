
import { Collection, ObjectId } from 'mongodb';
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
  
  // Enhanced methods for machine document management
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
      // Support both string IDs and ObjectId
      let query = {};
      try {
        if (ObjectId.isValid(machineId)) {
          query = { _id: new ObjectId(machineId) };
        } else {
          query = { _id: machineId };
        }
      } catch (e) {
        query = { _id: machineId };
      }
      
      const machine = await this.machinesCollection.findOne(query);
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
      // Support both string IDs and ObjectId
      let query = {};
      try {
        if (ObjectId.isValid(machineId)) {
          query = { _id: new ObjectId(machineId) };
        } else {
          query = { _id: machineId };
        }
      } catch (e) {
        query = { _id: machineId };
      }
      
      const count = await this.machinesCollection.countDocuments(query);
      return count > 0;
    } catch (error) {
      console.error("Error checking if machine exists in MongoDB:", error);
      return false;
    }
  }
  
  async addMachine(machine: Omit<MongoMachine, "_id">): Promise<MongoMachine | null> {
    await this.initCollections();
    if (!this.machinesCollection) return null;
    
    try {
      // Generate an ObjectId if _id is not provided
      const machineToAdd = { ...machine };
      if (!machineToAdd._id) {
        machineToAdd._id = new ObjectId().toString();
      }
      
      console.log(`Adding machine to MongoDB: ${machineToAdd.name}`);
      const result = await this.machinesCollection.insertOne(machineToAdd as any);
      
      if (result.acknowledged) {
        console.log(`Successfully added machine with ID: ${result.insertedId}`);
        return {
          ...machineToAdd,
          _id: result.insertedId.toString()
        } as MongoMachine;
      }
      return null;
    } catch (error) {
      console.error("Error adding machine to MongoDB:", error);
      return null;
    }
  }
  
  async updateMachine(machineId: string, updates: Partial<MongoMachine>): Promise<MongoMachine | null> {
    await this.initCollections();
    if (!this.machinesCollection) return null;
    
    try {
      // Support both string IDs and ObjectId
      let query = {};
      try {
        if (ObjectId.isValid(machineId)) {
          query = { _id: new ObjectId(machineId) };
        } else {
          query = { _id: machineId };
        }
      } catch (e) {
        query = { _id: machineId };
      }
      
      const result = await this.machinesCollection.findOneAndUpdate(
        query,
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error("Error updating machine in MongoDB:", error);
      return null;
    }
  }
  
  async deleteMachine(machineId: string): Promise<boolean> {
    await this.initCollections();
    if (!this.machinesCollection) return false;
    
    try {
      // Support both string IDs and ObjectId
      let query = {};
      try {
        if (ObjectId.isValid(machineId)) {
          query = { _id: new ObjectId(machineId) };
        } else {
          query = { _id: machineId };
        }
      } catch (e) {
        query = { _id: machineId };
      }
      
      const result = await this.machinesCollection.deleteOne(query);
      return result.acknowledged && result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting machine from MongoDB:", error);
      return false;
    }
  }
  
  // Helper method to seed some default machines if none exist
  async seedDefaultMachines(): Promise<void> {
    await this.initCollections();
    if (!this.machinesCollection) return;
    
    try {
      const count = await this.machinesCollection.countDocuments();
      if (count === 0) {
        console.log("No machines found in MongoDB, seeding default machines...");
        
        const defaultMachines: Omit<MongoMachine, "_id">[] = [
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
            name: 'Soldering Station', 
            type: 'Electronics', 
            status: 'Available', 
            description: 'Professional-grade soldering equipment for electronics work and repairs.', 
            requiresCertification: false,
            difficulty: 'Intermediate',
            imageUrl: '/machines/soldering-station.jpg'
          }
        ];
        
        // Add machines one by one
        for (const machine of defaultMachines) {
          await this.addMachine(machine);
          
          // Add corresponding machine status
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

// Create a singleton instance
const mongoMachineService = new MongoMachineService();
export default mongoMachineService;
