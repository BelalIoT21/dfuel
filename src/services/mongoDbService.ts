
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoConnectionService from './mongodb/connectionService';
import { MongoUser, MongoMachineStatus } from './mongodb/types';
import { isWeb } from '../utils/platform';

// Maintains the same API as the original monolithic service
class MongoDbService {
  // User methods
  async getUsers(): Promise<MongoUser[]> {
    // Skip MongoDB in browser environment
    if (isWeb) return [];
    return mongoUserService.getUsers();
  }
  
  async getUserByEmail(email: string): Promise<MongoUser | null> {
    if (isWeb) return null;
    return mongoUserService.getUserByEmail(email);
  }
  
  async getUserById(id: string): Promise<MongoUser | null> {
    if (isWeb) return null;
    return mongoUserService.getUserById(id);
  }
  
  async createUser(user: MongoUser): Promise<MongoUser | null> {
    if (isWeb) return null;
    return mongoUserService.createUser(user);
  }
  
  async updateUser(id: string, updates: Partial<MongoUser>): Promise<boolean> {
    if (isWeb) return false;
    return mongoUserService.updateUser(id, updates);
  }
  
  async updateUserCertifications(userId: string, machineId: string): Promise<boolean> {
    if (isWeb) return false;
    return mongoUserService.updateUserCertifications(userId, machineId);
  }
  
  async addUserBooking(userId: string, booking: any): Promise<boolean> {
    if (isWeb) return false;
    return mongoUserService.addUserBooking(userId, booking);
  }
  
  // Machine methods
  async getMachineStatuses(): Promise<MongoMachineStatus[]> {
    if (isWeb) return [];
    return mongoMachineService.getMachineStatuses();
  }
  
  async getMachineStatus(machineId: string): Promise<MongoMachineStatus | null> {
    if (isWeb) return null;
    return mongoMachineService.getMachineStatus(machineId);
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    if (isWeb) return false;
    return mongoMachineService.updateMachineStatus(machineId, status, note);
  }
  
  // Connection method
  async connect(): Promise<void> {
    if (!isWeb) {
      await mongoConnectionService.connect();
    }
  }
  
  // Close connection method
  async close(): Promise<void> {
    if (!isWeb) {
      await mongoConnectionService.close();
    }
  }
}

// Create a singleton instance
const mongoDbService = new MongoDbService();
export default mongoDbService;
