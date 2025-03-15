
import { Collection } from 'mongodb';
import { MongoMachineStatus, MongoMachine } from './types';
import mongoConnectionService from './connectionService';

class MongoMachineService {
  private machineStatusesCollection: Collection<MongoMachineStatus> | null = null;
  private machinesCollection: Collection<MongoMachine> | null = null;
  
  async initCollections(): Promise<void> {
    try {
      if (!this.machineStatusesCollection || !this.machinesCollection) {
        console.log("Attempting to connect to MongoDB...");
        const db = await mongoConnectionService.connect();
        if (db) {
          console.log(`Connected to MongoDB database: ${db.databaseName}`);
          this.machineStatusesCollection = db.collection<MongoMachineStatus>('machineStatuses');
          this.machinesCollection = db.collection<MongoMachine>('machines');
          console.log(`Using collections: machineStatuses, machines in database ${db.databaseName}`);
          console.log(`MongoDB connection string: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/learnit'}`);
          
          // Log the count of machines to verify data exists
          const machineCount = await this.machinesCollection.countDocuments();
          console.log(`Found ${machineCount} machines in MongoDB collection`);
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
      
      // Log each machine to troubleshoot
      if (machines.length === 0) {
        console.log("No machines found in MongoDB. Database might be empty or not properly seeded.");
      } else {
        console.log("Machine data sample:", JSON.stringify(machines[0], null, 2));
      }
      
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
      // Check if the machine already exists
      const exists = await this.machineExists(machine._id);
      if (exists) {
        console.log(`Machine with ID ${machine._id} already exists in MongoDB`);
        // Update the machine to ensure it has all properties
        const result = await this.machinesCollection.updateOne(
          { _id: machine._id },
          { $set: machine }
        );
        return result.acknowledged;
      }
      
      // Add the machine to the collection
      const result = await this.machinesCollection.insertOne(machine);
      console.log(`Machine with ID ${machine._id} added to MongoDB: ${machine.name}`);
      return result.acknowledged;
    } catch (error) {
      console.error("Error adding machine to MongoDB:", error);
      return false;
    }
  }
  
  // Add a method to seed machines if collection is empty
  async seedMachinesIfEmpty(): Promise<void> {
    await this.initCollections();
    if (!this.machinesCollection) return;
    
    try {
      const count = await this.machinesCollection.countDocuments();
      
      if (count === 0) {
        console.log("No machines found in MongoDB. Attempting to seed initial data...");
        
        // Import sample machine data from the Mongoose model
        try {
          const { Machine } = await import('../../../server/src/models/Machine');
          console.log("Successfully imported Machine model for seeding");
          
          // Check if we can access the model data
          if (Machine) {
            console.log("Machine model imported, ready to seed data");
            
            // Create some sample machines
            const sampleMachines = [
              {
                _id: "1",
                name: "3D Printer - Prusa i3",
                type: "3D Printer",
                description: "A high-quality 3D printer for detailed models.",
                status: "Available",
                requiresCertification: true,
                difficulty: "Intermediate",
                imageUrl: "/machines/3d-printer.jpg"
              },
              {
                _id: "2",
                name: "Laser Cutter - Glowforge",
                type: "Laser Cutter",
                description: "Precision laser cutter for various materials.",
                status: "Available",
                requiresCertification: true,
                difficulty: "Advanced",
                imageUrl: "/machines/laser-cutter.jpg"
              }
            ];
            
            // Insert the sample machines
            const result = await this.machinesCollection.insertMany(sampleMachines);
            console.log(`Successfully seeded ${result.insertedCount} machines to MongoDB`);
          }
        } catch (importError) {
          console.error("Error importing Machine model for seeding:", importError);
        }
      } else {
        console.log(`Found ${count} existing machines in MongoDB. No seeding needed.`);
      }
    } catch (error) {
      console.error("Error checking/seeding machines collection:", error);
    }
  }
}

// Create a singleton instance
const mongoMachineService = new MongoMachineService();
export default mongoMachineService;
