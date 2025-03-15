
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoConnectionService from './mongodb/connectionService';
import { MongoUser, MongoMachineStatus, MongoMachine } from './mongodb/types';
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
  
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    if (isWeb) return false;
    
    try {
      console.log(`MongoDbService: Updating booking ${bookingId} to ${status}`);
      
      // Make an API request to update the booking status
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error updating booking status: ${errorData.message || response.statusText}`);
        return false;
      }
      
      console.log('Successfully updated booking status via API');
      return true;
    } catch (error) {
      console.error('Error in MongoDbService.updateBookingStatus:', error);
      return false;
    }
  }
  
  // Get all bookings (for admin)
  async getAllBookings(): Promise<any[]> {
    if (isWeb) return [];
    
    try {
      // Make an API request to get all bookings
      const response = await fetch(`/api/bookings/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error getting all bookings: ${errorData.message || response.statusText}`);
        return [];
      }
      
      const bookings = await response.json();
      console.log('Successfully retrieved all bookings from MongoDB:', bookings.length);
      return bookings;
    } catch (error) {
      console.error('Error in MongoDbService.getAllBookings:', error);
      return [];
    }
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
  
  // New machine methods
  async getMachines(): Promise<MongoMachine[]> {
    if (isWeb) return [];
    return mongoMachineService.getMachines();
  }
  
  async getMachineById(machineId: string): Promise<MongoMachine | null> {
    if (isWeb) return null;
    return mongoMachineService.getMachineById(machineId);
  }
  
  async machineExists(machineId: string): Promise<boolean> {
    if (isWeb) return false;
    return mongoMachineService.machineExists(machineId);
  }
  
  async addMachine(machine: MongoMachine): Promise<boolean> {
    if (isWeb) return false;
    return mongoMachineService.addMachine(machine);
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
