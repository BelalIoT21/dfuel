import { apiService } from './apiService';

class MongoDbService {
  // Cache for data in case of API failures
  private cache: {
    machines: any[] | null;
    users: any[] | null;
    bookings: any[] | null;
    timestamps: Record<string, number>;
  } = {
    machines: null,
    users: null,
    bookings: null,
    timestamps: {}
  };
  
  // Cache expiration time (5 minutes)
  private CACHE_EXPIRATION = 5 * 60 * 1000;

  // Check if cache is valid
  private isCacheValid(key: string): boolean {
    const timestamp = this.cache.timestamps[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_EXPIRATION;
  }

  // Set cache
  private setCache(key: string, data: any): void {
    this.cache[key] = data;
    this.cache.timestamps[key] = Date.now();
  }

  // Machine methods
  async getAllMachines() {
    try {
      // Return from cache if valid
      if (this.cache.machines && this.isCacheValid('machines')) {
        console.log('Using cached machines data');
        return this.cache.machines;
      }

      console.log('Getting all machines from MongoDB via API');
      const response = await apiService.request('GET', '/machines');
      if (response.data && Array.isArray(response.data)) {
        console.log(`Got ${response.data.length} machines from MongoDB`);
        const normalizedData = response.data.map(machine => ({
          ...machine,
          id: machine._id?.toString() || machine.id || '',
          name: machine.name || '',
          type: machine.type || '',
          status: machine.status || 'Available'
        }));
        
        // Cache the results
        this.setCache('machines', normalizedData);
        return normalizedData;
      }
      return [];
    } catch (error) {
      console.error('Error getting all machines from MongoDB:', error);
      // Return cached data even if expired as a fallback
      if (this.cache.machines) {
        console.log('Using expired cached machines data as fallback');
        return this.cache.machines;
      }
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
  
  // Special method for MongoDB ObjectIds
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
      // Return from cache if valid
      if (this.cache.users && this.isCacheValid('users')) {
        console.log('Using cached users data');
        return this.cache.users;
      }

      console.log('Getting all users from MongoDB via API');
      const response = await apiService.getAllUsers();
      if (response.data && Array.isArray(response.data)) {
        console.log(`Got ${response.data.length} users from MongoDB`);
        const normalizedData = response.data.map(user => ({
          ...user,
          id: user._id?.toString() || user.id || ''
        }));
        
        // Cache the results
        this.setCache('users', normalizedData);
        return normalizedData;
      }
      return [];
    } catch (error) {
      console.error('Error getting all users from MongoDB:', error);
      // Return cached data even if expired as a fallback
      if (this.cache.users) {
        console.log('Using expired cached users data as fallback');
        return this.cache.users;
      }
      return [];
    }
  }
  
  // Get user count - useful for dashboard stats
  async getUserCount(): Promise<number> {
    try {
      const users = await this.getAllUsers();
      return users.length;
    } catch (error) {
      console.error('Error getting user count:', error);
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
      
      // Invalidate users cache on successful update
      if (response.success) {
        this.cache.users = null;
      }
      
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
      
      // Invalidate users cache on successful delete
      if (response.success) {
        this.cache.users = null;
      }
      
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting user ${id} from MongoDB:`, error);
      return false;
    }
  }
  
  // Booking methods - adding the missing method that was causing errors
  async getAllBookings() {
    try {
      // Return from cache if valid
      if (this.cache.bookings && this.isCacheValid('bookings')) {
        console.log('Using cached bookings data');
        return this.cache.bookings;
      }

      console.log('Getting all bookings from MongoDB via API');
      const response = await apiService.request('GET', '/bookings/all');
      if (response.data && Array.isArray(response.data)) {
        console.log(`Got ${response.data.length} bookings from MongoDB`);
        // Cache the results
        this.setCache('bookings', response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error getting all bookings from MongoDB:', error);
      // Return cached data even if expired as a fallback
      if (this.cache.bookings) {
        console.log('Using expired cached bookings data as fallback');
        return this.cache.bookings;
      }
      return [];
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
      
      // Invalidate users cache on successful update
      if (response.success) {
        this.cache.users = null;
      }
      
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
      
      // Invalidate machines cache on successful update
      if (response.success) {
        this.cache.machines = null;
      }
      
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
      
      // Invalidate bookings cache on successful delete
      if (response.success) {
        this.cache.bookings = null;
      }
      
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
      
      // Invalidate bookings cache on successful clear
      if (response.count > 0) {
        this.cache.bookings = null;
      }
      
      return response.count || 0;
    } catch (error) {
      console.error('Error clearing all bookings from MongoDB:', error);
      return 0;
    }
  }
  
  // Clear all caches
  clearCaches() {
    console.log('Clearing all MongoDB service caches');
    this.cache = {
      machines: null,
      users: null,
      bookings: null,
      timestamps: {}
    };
  }
}

// Create a singleton instance
const mongoDbService = new MongoDbService();
export default mongoDbService;
