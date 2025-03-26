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
      // Updated to sort by _id numerically
      const machines = await this.machinesCollection.find().sort({ _id: 1 }).toArray();
      console.log(`Retrieved ${machines.length} machines from MongoDB in order by ID`);
      
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
  
  async updateMachine(machineId: string, updates: Partial<MongoMachine>): Promise<boolean> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return false;
    }
    
    try {
      console.log(`Updating machine ${machineId} with data:`, updates);
      
      // Create a clean update object
      const updateData: Record<string, any> = { updatedAt: new Date() };
      
      // Handle each field specifically to avoid overwriting with undefined
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      
      // Ensure requiresCertification is properly handled - explicitly setting to boolean
      if (updates.requiresCertification !== undefined) {
        // Convert to explicit boolean to ensure consistent storage
        updateData.requiresCertification = Boolean(updates.requiresCertification);
        console.log(`Setting requiresCertification to: ${updateData.requiresCertification} (${typeof updateData.requiresCertification})`);
      }
      
      if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
      if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
      if (updates.specifications !== undefined) updateData.specifications = updates.specifications;
      if (updates.details !== undefined) updateData.details = updates.details;
      if (updates.maintenanceNote !== undefined) updateData.maintenanceNote = updates.maintenanceNote;
      if (updates.certificationInstructions !== undefined) updateData.certificationInstructions = updates.certificationInstructions;
      
      // Important fix for linkedCourseId and linkedQuizId - allow null values to clear the field
      if ('linkedCourseId' in updates) {
        updateData.linkedCourseId = updates.linkedCourseId || null;
        console.log(`Setting linkedCourseId to: ${updates.linkedCourseId || 'null'}`);
      }
      
      if ('linkedQuizId' in updates) {
        updateData.linkedQuizId = updates.linkedQuizId || null;
        console.log(`Setting linkedQuizId to: ${updates.linkedQuizId || 'null'}`);
      }
      
      const result = await this.machinesCollection.updateOne(
        { _id: machineId },
        { $set: updateData }
      );
      
      console.log(`Machine update result: ${JSON.stringify({
        acknowledged: result.acknowledged,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        fields: Object.keys(updateData)
      })}`);
      
      // Also update status if provided
      if (updates.status) {
        await this.updateMachineStatus(
          machineId,
          updates.status,
          updates.maintenanceNote
        );
      }
      
      return result.acknowledged && result.matchedCount > 0;
    } catch (error) {
      console.error("Error updating machine in MongoDB:", error);
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
      const count = await this.machinesCollection.countDocuments();
      
      // Get existing machine IDs
      const existingMachines = await this.machinesCollection.find({}, { projection: { _id: 1 } }).toArray();
      const existingMachineIds = existingMachines.map(m => m._id);
      
      // Define expected machine IDs
      const expectedMachineIds = ['1', '2', '3', '4'];
      
      // Check if any expected machine IDs are missing
      const missingMachineIds = expectedMachineIds.filter(id => !existingMachineIds.includes(id));
      
      if (count === 0 || missingMachineIds.length > 0) {
        console.log("Missing machines or empty collection, seeding default machines...");
        
        // Sort machine templates by ID to ensure proper order
        const defaultMachines: MongoMachine[] = [
          { 
            _id: '1', 
            name: 'Laser Cutter', 
            type: 'Laser Cutter', 
            status: 'Available',
            description: 'Precision laser cutting machine for detailed work on various materials.', 
            requiresCertification: true,
            difficulty: 'Advanced',
            imageUrl: '/lovable-uploads/81c40f5d-e4d4-42ef-8262-0467a8fb48c3.png',
            linkedCourseId: '5', // Adding course link
            linkedQuizId: '100'  // Adding quiz link
          },
          { 
            _id: '2', 
            name: 'Ultimaker', 
            type: '3D Printer', 
            status: 'Available', 
            description: 'FDM 3D printing for rapid prototyping and model creation.', 
            requiresCertification: true,
            difficulty: 'Intermediate',
            imageUrl: '/lovable-uploads/82f38bc9-30e8-4f58-9ad4-93d158cacf88.png'
          },
          { 
            _id: '3', 
            name: 'X1 E Carbon 3D Printer', 
            type: '3D Printer', 
            status: 'Available', 
            description: 'Carbon fiber 3D printer for high-strength parts.', 
            requiresCertification: true,
            difficulty: 'Advanced',
            imageUrl: '/lovable-uploads/381a5202-3287-46e3-9eda-f836609b10ac.png'
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
          }
        ];
        
        // Create only missing machine entries in specific order
        if (missingMachineIds.length > 0) {
          // Sort missing IDs numerically
          const sortedMissingIds = [...missingMachineIds].sort((a, b) => parseInt(a) - parseInt(b));
          
          // Create machines in sorted order
          for (const id of sortedMissingIds) {
            const machine = defaultMachines.find(m => m._id === id);
            if (machine) {
              await this.addMachine(machine);
              console.log(`Added missing machine: ${machine.name} (ID: ${machine._id})`);
            }
          }
        } else {
          // Create all machine entries if collection is empty
          for (const machine of defaultMachines) {
            await this.addMachine(machine);
          }
        }
        
        console.log("Successfully seeded default machines to MongoDB");
      } else {
        console.log(`Found ${count} existing machines in MongoDB, updating images and metadata...`);
        
        // Update machine data, especially images
        const updates = [
          { 
            _id: '1', 
            name: 'Laser Cutter', 
            type: 'Laser Cutter',
            imageUrl: '/lovable-uploads/81c40f5d-e4d4-42ef-8262-0467a8fb48c3.png',
            linkedCourseId: '5', // Adding course link
            linkedQuizId: '100'  // Adding quiz link
          },
          { 
            _id: '2', 
            name: 'Ultimaker', 
            type: '3D Printer',
            imageUrl: '/lovable-uploads/82f38bc9-30e8-4f58-9ad4-93d158cacf88.png'
          },
          { 
            _id: '3', 
            name: 'X1 E Carbon 3D Printer', 
            type: '3D Printer',
            imageUrl: '/lovable-uploads/381a5202-3287-46e3-9eda-f836609b10ac.png'
          },
          { 
            _id: '4', 
            name: 'Bambu Lab X1 E', 
            type: '3D Printer'
          }
        ];
        
        for (const update of updates) {
          await this.machinesCollection.updateOne(
            { _id: update._id },
            { $set: update },
            { upsert: true }
          );
          console.log(`Updated machine: ${update.name} (ID: ${update._id})`);
        }
        
        console.log("Updated machine images and data");
      }
    } catch (error) {
      console.error("Error seeding default machines to MongoDB:", error);
    }
  }
}

// Create a singleton instance
const mongoMachineService = new MongoMachineService();
export default mongoMachineService;
