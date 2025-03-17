
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoSeedService from './mongodb/seedService';
import { isWeb } from '../utils/platform';

class MongoDbService {
  async getAllUsers() {
    if (isWeb) return null;
    try {
      return await mongoUserService.getUsers();
    } catch (error) {
      console.error("Error getting all users from MongoDB:", error);
      return null;
    }
  }

  async getUserById(userId: string) {
    if (isWeb) return null;
    try {
      return await mongoUserService.getUserById(userId);
    } catch (error) {
      console.error(`Error getting user ${userId} from MongoDB:`, error);
      return null;
    }
  }

  async updateUserCertifications(userId: string, certificationId: string) {
    if (isWeb) return false;
    try {
      console.log(`MongoDbService: Adding certification ${certificationId} to user ${userId}`);
      return await mongoUserService.updateUserCertifications(userId, certificationId);
    } catch (error) {
      console.error(`Error updating certifications for user ${userId}:`, error);
      return false;
    }
  }

  async removeUserCertification(userId: string, certificationId: string): Promise<boolean> {
    if (isWeb) return false;
    
    try {
      console.log(`MongoDbService: Removing certification ${certificationId} from user ${userId}`);
      return await mongoUserService.removeUserCertification(userId, certificationId);
    } catch (error) {
      console.error(`Error removing certification ${certificationId} from user ${userId}:`, error);
      return false;
    }
  }

  async clearUserCertifications(userId: string) {
    if (isWeb) return false;
    try {
      return await mongoUserService.clearUserCertifications(userId);
    } catch (error) {
      console.error(`Error clearing certifications for user ${userId}:`, error);
      return false;
    }
  }

  // Machine methods
  async getMachines() {
    if (isWeb) return null;
    try {
      return await mongoMachineService.getMachines();
    } catch (error) {
      console.error("Error getting machines from MongoDB:", error);
      return null;
    }
  }

  async getMachineById(machineId: string) {
    if (isWeb) return null;
    try {
      return await mongoMachineService.getMachineById(machineId);
    } catch (error) {
      console.error(`Error getting machine ${machineId} from MongoDB:`, error);
      return null;
    }
  }

  async getMachineStatus(machineId: string) {
    if (isWeb) return null;
    try {
      return await mongoMachineService.getMachineStatus(machineId);
    } catch (error) {
      console.error(`Error getting status for machine ${machineId}:`, error);
      return null;
    }
  }

  async updateMachineStatus(machineId: string, status: string, note?: string) {
    if (isWeb) return false;
    try {
      return await mongoMachineService.updateMachineStatus(machineId, status, note);
    } catch (error) {
      console.error(`Error updating status for machine ${machineId}:`, error);
      return false;
    }
  }
}

const mongoDbService = new MongoDbService();
export default mongoDbService;
