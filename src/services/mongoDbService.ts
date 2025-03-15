import { apiService } from './apiService';

class MongoDbService {
  // Machine methods
  async getAllMachines() {
    try {
      console.log('Getting all machines from MongoDB via API');
      const response = await apiService.getMachines();
      if (response.data && Array.isArray(response.data)) {
        console.log(`Got ${response.data.length} machines from MongoDB`);
        return response.data.map(machine => ({
          ...machine,
          id: machine._id?.toString() || machine.id || '',
          name: machine.name || '',
          type: machine.type || '',
          status: machine.status || 'Available'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting all machines from MongoDB:', error);
      return [];
    }
  }
  
  async getMachineById(id: string) {
    try {
      console.log(`Getting machine by ID from MongoDB: ${id}`);
      const response = await apiService.getMachineById(id);
      if (response.data) {
        // Ensure consistent format
        return {
          ...response.data,
          id: response.data._id?.toString() || response.data.id || id,
          name: response.data.name || '',
          type: response.data.type || '',
          status: response.data.status || 'Available'
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting machine by ID ${id} from MongoDB:`, error);
      return null;
    }
  }
  
  async getMachineByMongoId(mongoId: string) {
    try {
      console.log(`Getting machine by MongoDB ID: ${mongoId}`);
      const response = await apiService.getMachineById(mongoId);
      if (response.data) {
        // Ensure consistent format
        return {
          ...response.data,
          id: response.data._id?.toString() || response.data.id || mongoId,
          name: response.data.name || '',
          type: response.data.type || '',
          status: response.data.status || 'Available'
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting machine by MongoDB ID ${mongoId}:`, error);
      return null;
    }
  }
  
  // User methods
  async getAllUsers() {
    try {
      console.log('Getting all users from MongoDB via API');
      const response = await apiService.getAllUsers();
      if (response.data && Array.isArray(response.data)) {
        console.log(`Got ${response.data.length} users from MongoDB`);
        return response.data.map(user => ({
          ...user,
          id: user._id?.toString() || user.id || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting all users from MongoDB:', error);
      return [];
    }
  }
  
  async getUserCount() {
    try {
      console.log('Getting user count from MongoDB via API');
      const response = await apiService.ping();
      if (response.data && response.data.mongodb && typeof response.data.mongodb.userCount === 'number') {
        console.log(`MongoDB user count: ${response.data.mongodb.userCount}`);
        return response.data.mongodb.userCount;
      }
      
      // Fallback to counting users if ping doesn't return count
      try {
        const users = await this.getAllUsers();
        return users.length;
      } catch (innerError) {
        console.error('Error getting user count from users list:', innerError);
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting user count from MongoDB:', error);
      return 0;
    }
  }
  
  async getUserById(id: string) {
    if (!id) {
      console.error('Cannot get user: ID is undefined');
      return null;
    }
    
    try {
      console.log(`Getting user by ID from MongoDB: ${id}`);
      const response = await apiService.getUserById(id);
      if (response.data) {
        // Ensure consistent format
        return {
          ...response.data,
          id: response.data._id?.toString() || response.data.id || id
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting user by ID ${id} from MongoDB:`, error);
      return null;
    }
  }
  
  async updateUser(id: string, updates: any) {
    if (!id) {
      console.error('Cannot update user: ID is undefined');
      return false;
    }
    
    try {
      console.log(`Updating user ${id} in MongoDB:`, updates);
      const response = await apiService.updateUser(id, updates);
      return response.success || false;
    } catch (error) {
      console.error(`Error updating user ${id} in MongoDB:`, error);
      return false;
    }
  }
  
  async deleteUser(id: string) {
    if (!id) {
      console.error('Cannot delete user: ID is undefined');
      return false;
    }
    
    try {
      console.log(`Deleting user ${id} from MongoDB`);
      const response = await apiService.deleteUser(id);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting user ${id} from MongoDB:`, error);
      return false;
    }
  }
  
  // Certification methods
  async updateUserCertifications(userId: string, machineId: string) {
    if (!userId || !machineId) {
      console.error('Cannot update certifications: User ID or Machine ID is undefined');
      console.error(`userId=${userId}, machineId=${machineId}`);
      return false;
    }
    
    try {
      console.log(`Updating certifications for user ${userId} in MongoDB: adding ${machineId}`);
      const response = await apiService.addCertification(userId, machineId);
      return response.success || false;
    } catch (error) {
      console.error(`Error updating certifications for user ${userId} in MongoDB:`, error);
      return false;
    }
  }
  
  // Machine status methods
  async getMachineStatus(machineId: string) {
    try {
      console.log(`Getting status for machine ${machineId} from MongoDB`);
      const response = await apiService.getMachineStatus(machineId);
      return response.data || 'available';
    } catch (error) {
      console.error(`Error getting status for machine ${machineId} from MongoDB:`, error);
      return 'available';
    }
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    try {
      console.log(`Updating status for machine ${machineId} in MongoDB: ${status}`);
      const response = await apiService.updateMachineStatus(machineId, status, note);
      return response.success || false;
    } catch (error) {
      console.error(`Error updating status for machine ${machineId} in MongoDB:`, error);
      return false;
    }
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    try {
      console.log(`Getting maintenance note for machine ${machineId} from MongoDB`);
      const response = await apiService.getMachineMaintenanceNote(machineId);
      return response.data || null;
    } catch (error) {
      console.error(`Error getting maintenance note for machine ${machineId} from MongoDB:`, error);
      return null;
    }
  }
  
  // Booking methods
  async deleteBooking(bookingId: string) {
    try {
      console.log(`Deleting booking ${bookingId} from MongoDB`);
      const response = await apiService.deleteBooking(bookingId);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting booking ${bookingId} from MongoDB:`, error);
      return false;
    }
  }
  
  async clearAllBookings() {
    try {
      console.log('Clearing all bookings from MongoDB');
      const response = await apiService.clearAllBookings();
      return response.count || 0;
    } catch (error) {
      console.error('Error clearing all bookings from MongoDB:', error);
      return 0;
    }
  }
}

// Create a singleton instance
const mongoDbService = new MongoDbService();
export default mongoDbService;
