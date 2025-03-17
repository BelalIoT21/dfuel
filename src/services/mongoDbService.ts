
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import { isWeb } from '../utils/platform';
import { apiService } from './apiService';

class MongoDbService {
  async getUsers() {
    if (isWeb) {
      console.log('MongoDB access attempted from web environment, using API fallback');
      try {
        const response = await apiService.get('users');
        if (response.data) {
          console.log('API returned', response.data.length, 'users');
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching users from API:", error);
      }
      return [];
    }
    
    const users = await mongoUserService.getUsers();
    console.log('Retrieved', users.length, 'users from MongoDB');
    return users;
  }

  async getUserByEmail(email: string) {
    if (isWeb) {
      try {
        const response = await apiService.get(`users/email/${email}`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching user by email from API:", error);
      }
      return null;
    }
    
    return await mongoUserService.getUserByEmail(email);
  }

  async getUserById(userId: string) {
    if (isWeb) {
      try {
        const response = await apiService.get(`users/${userId}`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching user by ID from API:", error);
      }
      return null;
    }
    
    return await mongoUserService.getUserById(userId);
  }

  async updateUserCertifications(userId: string, machineId: string) {
    console.log(`MongoDbService: updateUserCertifications for user ${userId}, machine ${machineId}`);
    
    if (isWeb) {
      try {
        const response = await apiService.post('certifications', { userId, machineId });
        return response.data && response.data.success;
      } catch (error) {
        console.error("Error updating user certifications via API:", error);
        return false;
      }
    }
    
    return await mongoUserService.addCertification(userId, machineId);
  }

  async removeUserCertification(userId: string, machineId: string) {
    console.log(`MongoDbService: removeUserCertification for user ${userId}, machine ${machineId}`);
    
    if (isWeb) {
      try {
        const response = await apiService.delete(`certifications/${userId}/${machineId}`);
        return response.data && response.data.success;
      } catch (error) {
        console.error("Error removing user certification via API:", error);
        return false;
      }
    }
    
    return await mongoUserService.removeCertification(userId, machineId);
  }

  async clearUserCertifications(userId: string) {
    if (isWeb) {
      try {
        const response = await apiService.delete(`certifications/clear/${userId}`);
        return response.data && response.data.success;
      } catch (error) {
        console.error("Error clearing user certifications via API:", error);
        return false;
      }
    }
    
    return await mongoUserService.clearCertifications(userId);
  }

  async getMachines() {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const response = await apiService.get('machines');
        if (response.data && Array.isArray(response.data)) {
          console.log(`API returned ${response.data.length} machines`);
          return response.data;
        }
      } catch (error) {
        console.error("Error getting machines from API:", error);
      }
      return [];
    }
    
    try {
      const machines = await mongoMachineService.getMachines();
      console.log(`MongoDB returned ${machines?.length || 0} machines`);
      return machines || [];
    } catch (error) {
      console.error("Error getting machines from MongoDB:", error);
      return [];
    }
  }

  async getMachineById(machineId: string) {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const response = await apiService.get(`machines/${machineId}`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error(`Error getting machine ${machineId} from API:`, error);
      }
      return null;
    }
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineById");
        return null;
      }
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
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const response = await apiService.get(`machines/${machineId}/status`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error(`Error getting status for machine ${machineId} from API:`, error);
      }
      return null;
    }
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineStatus");
        return null;
      }
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
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const response = await apiService.put(`machines/${machineId}/status`, { status, maintenanceNote: note });
        return response.data?.success || false;
      } catch (error) {
        console.error(`Error updating status for machine ${machineId} via API:`, error);
        return false;
      }
    }
    try {
      if (!machineId || !status) {
        console.error("Invalid machineId or status passed to updateMachineStatus");
        return false;
      }
      console.log(`MongoDbService: Updating status for machine ${machineId} to ${status}`);
      const success = await mongoMachineService.updateMachineStatus(machineId, status, note);
      console.log(`MongoDB update machine status result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error updating status for machine ${machineId}:`, error);
      return false;
    }
  }

  async deleteUser(userId: string) {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const response = await apiService.delete(`users/${userId}`);
        return response.status === 200;
      } catch (error) {
        console.error(`Error deleting user ${userId} via API:`, error);
        return false;
      }
    }
    try {
      if (!userId) {
        console.error("Invalid userId passed to deleteUser");
        return false;
      }
      const success = await mongoUserService.deleteUser(userId);
      console.log(`MongoDB delete user result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }
}

const mongoDbService = new MongoDbService();
export default mongoDbService;
