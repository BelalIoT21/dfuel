
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoSeedService from './mongodb/seedService';
import { isWeb } from '../utils/platform';

class MongoDbService {
  async getAllUsers() {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return null;
    }
    try {
      const users = await mongoUserService.getUsers();
      console.log(`MongoDB returned ${users.length} users`);
      return users;
    } catch (error) {
      console.error("Error getting all users from MongoDB:", error);
      return null;
    }
  }

  async getUserById(userId: string) {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return null;
    }
    try {
      const user = await mongoUserService.getUserById(userId);
      console.log(`MongoDB ${user ? 'found' : 'did not find'} user ${userId}`);
      return user;
    } catch (error) {
      console.error(`Error getting user ${userId} from MongoDB:`, error);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return null;
    }
    try {
      const user = await mongoUserService.getUserByEmail(email);
      console.log(`MongoDB ${user ? 'found' : 'did not find'} user with email ${email}`);
      return user;
    } catch (error) {
      console.error(`Error getting user with email ${email} from MongoDB:`, error);
      return null;
    }
  }

  async updateUserCertifications(userId: string, certificationId: string) {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return false;
    }
    try {
      console.log(`MongoDbService: Adding certification ${certificationId} to user ${userId}`);
      const success = await mongoUserService.updateUserCertifications(userId, certificationId);
      console.log(`MongoDB add certification result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error updating certifications for user ${userId}:`, error);
      return false;
    }
  }

  async removeUserCertification(userId: string, certificationId: string): Promise<boolean> {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return false;
    }
    
    try {
      console.log(`MongoDbService: Removing certification ${certificationId} from user ${userId}`);
      const success = await mongoUserService.removeUserCertification(userId, certificationId);
      console.log(`MongoDB remove certification result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error removing certification ${certificationId} from user ${userId}:`, error);
      return false;
    }
  }

  async clearUserCertifications(userId: string) {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return false;
    }
    try {
      const success = await mongoUserService.clearUserCertifications(userId);
      console.log(`MongoDB clear certifications result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error clearing certifications for user ${userId}:`, error);
      return false;
    }
  }

  // Machine methods
  async getMachines() {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return null;
    }
    try {
      const machines = await mongoMachineService.getMachines();
      console.log(`MongoDB returned ${machines.length} machines`);
      return machines;
    } catch (error) {
      console.error("Error getting machines from MongoDB:", error);
      return null;
    }
  }

  async getMachineById(machineId: string) {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return null;
    }
    try {
      const machine = await mongoMachineService.getMachineById(machineId);
      console.log(`MongoDB ${machine ? 'found' : 'did not find'} machine ${machineId}`);
      return machine;
    } catch (error) {
      console.error(`Error getting machine ${machineId} from MongoDB:`, error);
      return null;
    }
  }

  async getMachineStatus(machineId: string) {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return null;
    }
    try {
      const status = await mongoMachineService.getMachineStatus(machineId);
      console.log(`MongoDB returned status for machine ${machineId}: ${status ? status.status : 'no status'}`);
      return status;
    } catch (error) {
      console.error(`Error getting status for machine ${machineId}:`, error);
      return null;
    }
  }

  async updateMachineStatus(machineId: string, status: string, note?: string) {
    if (isWeb) {
      console.error("MongoDB access attempted from web environment");
      return false;
    }
    try {
      console.log(`MongoDbService: Updating status for machine ${machineId} to ${status}`);
      const success = await mongoMachineService.updateMachineStatus(machineId, status, note);
      console.log(`MongoDB update machine status result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error updating status for machine ${machineId}:`, error);
      return false;
    }
  }
}

const mongoDbService = new MongoDbService();
export default mongoDbService;
