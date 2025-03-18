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
            
            // Check if all needed machines exist
            await this.checkAndReseedMachines();
          }
        } else {
          console.error("Failed to connect to MongoDB database");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB collections:", error);
    }
  }
  
  async checkAndReseedMachines(): Promise<void> {
    try {
      if (!this.machinesCollection) {
        console.error("Machines collection not initialized");
        return;
      }
      
      // Check if all required machines (1-6) exist
      const requiredIds = ['1', '2', '3', '4', '5', '6'];
      const missingIds = [];
      
      for (const id of requiredIds) {
        const exists = await this.machineExists(id);
        if (!exists) {
          missingIds.push(id);
        }
      }
      
      if (missingIds.length > 0) {
        console.log(`Missing machines with IDs: ${missingIds.join(', ')}. Reseeding machines...`);
        await this.seedDefaultMachines();
      } else {
        console.log("All required machines exist in database");
      }
    } catch (error) {
      console.error("Error checking for required machines:", error);
    }
  }
  
  async getMachineStatuses(): Promise<MongoMachineStatus[]> {
    await this.initCollections();
    if (!this.machineStatusesCollection) {
      console.error("Machine statuses collection not initialized");
      return [];
    }
    
    try {
      const statuses = await this.machineStatusesCollection.find().toArray();
      console.log(`Retrieved ${statuses.length} machine statuses from MongoDB`);
      return statuses;
    } catch (error) {
      console.error("Error getting machine statuses from MongoDB:", error);
      return [];
    }
  }
  
  async getMachineStatus(machineId: string): Promise<MongoMachineStatus | null> {
    await this.initCollections();
    if (!this.machineStatusesCollection) {
      console.error("Machine statuses collection not initialized");
      return null;
    }
    
    try {
      const status = await this.machineStatusesCollection.findOne({ machineId });
      console.log(`Machine status for ${machineId}: ${status ? status.status : 'not found'}`);
      return status;
    } catch (error) {
      console.error("Error getting machine status from MongoDB:", error);
      return null;
    }
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    await this.initCollections();
    if (!this.machineStatusesCollection) {
      console.error("Machine statuses collection not initialized");
      return false;
    }
    
    try {
      // Convert "out of order" to "in-use" for the database
      let normalizedStatus = status;
      if (status.toLowerCase() === 'out of order') {
        normalizedStatus = 'in-use';
      }
      
      console.log(`Updating status for machine ${machineId} to ${normalizedStatus}`);
      const result = await this.machineStatusesCollection.updateOne(
        { machineId },
        { $set: { machineId, status: normalizedStatus, note, updatedAt: new Date() } },
        { upsert: true }
      );
      
      console.log(`Machine status update result: ${JSON.stringify({
        acknowledged: result.acknowledged,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      })}`);
      
      // Also update the machine document if it exists
      if (this.machinesCollection) {
        // Convert to proper case for Machine collection
        let dbStatus = 'Available';
        if (normalizedStatus.toLowerCase() === 'maintenance') {
          dbStatus = 'Maintenance';
        } else if (normalizedStatus.toLowerCase() === 'in-use' || 
                   normalizedStatus.toLowerCase() === 'in use' || 
                   normalizedStatus.toLowerCase() === 'out of order') {
          dbStatus = 'In Use';
        }
        
        await this.machinesCollection.updateOne(
          { _id: machineId },
          { $set: { status: dbStatus, maintenanceNote: note } }
        );
      }
      
      return result.acknowledged;
    } catch (error) {
      console.error("Error updating machine status in MongoDB:", error);
      return false;
    }
  }
  
  async getMachines(): Promise<MongoMachine[]> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return [];
    }
    
    try {
      const machines = await this.machinesCollection.find().toArray();
      console.log(`Retrieved ${machines.length} machines from MongoDB`);
      
      // Filter out machines 5 and 6
      const filteredMachines = machines.filter(machine => 
        machine._id !== '5' && machine._id !== '6'
      );
      
      return filteredMachines;
    } catch (error) {
      console.error("Error getting machines from MongoDB:", error);
      return [];
    }
  }
  
  async getMachineById(machineId: string): Promise<MongoMachine | null> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return null;
    }
    
    try {
      const machine = await this.machinesCollection.findOne({ _id: machineId });
      console.log(`Machine lookup for ID ${machineId}: ${machine ? machine.name : 'not found'}`);
      return machine;
    } catch (error) {
      console.error("Error getting machine by ID from MongoDB:", error);
      return null;
    }
  }
  
  async getMachineByName(machineName: string): Promise<MongoMachine | null> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return null;
    }
    
    try {
      const machine = await this.machinesCollection.findOne({ name: machineName });
      console.log(`Machine lookup by name ${machineName}: ${machine ? 'found' : 'not found'}`);
      return machine;
    } catch (error) {
      console.error("Error getting machine by name from MongoDB:", error);
      return null;
    }
  }
  
  async machineExists(machineId: string): Promise<boolean> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return false;
    }
    
    try {
      const count = await this.machinesCollection.countDocuments({ _id: machineId });
      console.log(`Machine existence check for ID ${machineId}: ${count > 0 ? 'exists' : 'not found'}`);
      return count > 0;
    } catch (error) {
      console.error("Error checking if machine exists in MongoDB:", error);
      return false;
    }
  }
  
  async addMachine(machine: MongoMachine): Promise<boolean> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return false;
    }
    
    try {
      // Check if the machine already exists
      const exists = await this.machineExists(machine._id);
      if (exists) {
        console.log(`Machine with ID ${machine._id} already exists in MongoDB - updating`);
        // Update the machine to ensure it has all properties
        const result = await this.machinesCollection.updateOne(
          { _id: machine._id },
          { $set: { ...machine, updatedAt: new Date() } }
        );
        return result.acknowledged;
      }
      
      // Add the machine to the collection
      console.log(`Adding new machine to MongoDB: ${machine.name} (ID: ${machine._id})`);
      const newMachine = { ...machine, createdAt: new Date(), updatedAt: new Date() };
      const result = await this.machinesCollection.insertOne(newMachine);
      
      if (result.acknowledged) {
        // Also set initial status
        await this.updateMachineStatus(
          machine._id,
          machine.status || 'available',
          machine.maintenanceNote
        );
      }
      
      return result.acknowledged;
    } catch (error) {
      console.error("Error adding machine to MongoDB:", error);
      return false;
    }
  }
  
  async seedDefaultMachines(): Promise<void> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return;
    }
    
    try {
      console.log("Seeding default machines...");
      
      const defaultMachines: MongoMachine[] = [
        { 
          _id: '1', 
          name: 'Laser Cutter', 
          type: 'Laser Cutter', 
          status: 'Available', 
          description: 'Precision laser cutting machine for detailed work on various materials.', 
          requiresCertification: true,
          difficulty: 'Advanced',
          imageUrl: '/machines/laser-cutter.jpg'
        },
        { 
          _id: '2', 
          name: 'Ultimaker', 
          type: '3D Printer', 
          status: 'Available', 
          description: 'FDM 3D printing for rapid prototyping and model creation.', 
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/3d-printer.jpg'
        },
        { 
          _id: '3', 
          name: 'X1 E Carbon 3D Printer', 
          type: '3D Printer', 
          status: 'Available', 
          description: 'Carbon fiber 3D printer for high-strength parts.', 
          requiresCertification: true,
          difficulty: 'Advanced',
          imageUrl: '/machines/carbon-3d.jpg'
        },
        { 
          _id: '4', 
          name: 'Bambu Lab X1 E', 
          type: '3D Printer', 
          status: 'Available', 
          description: 'Fast and accurate multi-material 3D printer.', 
          requiresCertification: true,
          difficulty: 'Intermediate',
          imageUrl: '/machines/bambu-lab.jpg'
        },
        {
          _id: '5',
          name: 'Safety Cabinet',
          type: 'Safety Equipment',
          status: 'Available',
          description: 'Safety equipment and protective gear storage.',
          requiresCertification: false,
          difficulty: 'Beginner',
          imageUrl: '/machines/safety-cabinet.jpg'
        },
        {
          _id: '6',
          name: 'Machine Safety Course',
          type: 'Certification',
          status: 'Available',
          description: 'Required safety course for machine certification.',
          requiresCertification: false,
          difficulty: 'Beginner',
          imageUrl: '/machines/safety-course.jpg'
        }
      ];
      
      // Create machine entries
      for (const machine of defaultMachines) {
        // Check if this specific machine exists
        const exists = await this.machineExists(machine._id);
        
        if (!exists) {
          // Only add the machine if it doesn't exist
          console.log(`Adding machine: ${machine.name} (ID: ${machine._id})`);
          await this.addMachine(machine);
        } else {
          console.log(`Machine ID ${machine._id} already exists, skipping`);
        }
      }
      
      console.log("Successfully seeded default machines to MongoDB");
    } catch (error) {
      console.error("Error seeding default machines to MongoDB:", error);
    }
  }
}

// Create a singleton instance
const mongoMachineService = new MongoMachineService();
export default mongoMachineService;
