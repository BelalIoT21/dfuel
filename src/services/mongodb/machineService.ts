
import { Collection } from 'mongodb';
import { MongoMachineStatus } from './types';
import mongoConnectionService from './connectionService';

class MongoMachineService {
  private machineStatusesCollection: Collection<MongoMachineStatus> | null = null;
  
  async initCollection(): Promise<void> {
    if (!this.machineStatusesCollection) {
      const db = await mongoConnectionService.connect();
      if (db) {
        this.machineStatusesCollection = db.collection<MongoMachineStatus>('machineStatuses');
      }
    }
  }
  
  async getMachineStatuses(): Promise<MongoMachineStatus[]> {
    await this.initCollection();
    if (!this.machineStatusesCollection) return [];
    
    try {
      return await this.machineStatusesCollection.find().toArray();
    } catch (error) {
      console.error("Error getting machine statuses from MongoDB:", error);
      return [];
    }
  }
  
  async getMachineStatus(machineId: string): Promise<MongoMachineStatus | null> {
    await this.initCollection();
    if (!this.machineStatusesCollection) return null;
    
    try {
      return await this.machineStatusesCollection.findOne({ machineId });
    } catch (error) {
      console.error("Error getting machine status from MongoDB:", error);
      return null;
    }
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    await this.initCollection();
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
}

// Create a singleton instance
const mongoMachineService = new MongoMachineService();
export default mongoMachineService;
