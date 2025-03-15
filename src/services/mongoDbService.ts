
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoConnectionService from './mongodb/connectionService';
import { MongoUser, MongoMachineStatus, MongoMachine } from './mongodb/types';
import { isWeb } from '../utils/platform';

// Maintains the same API as the original monolithic service
class MongoDbService {
  constructor() {
    // Initialize and seed MongoDB when the service is created
    if (!isWeb) {
      this.initialize();
    }
  }
  
  async initialize() {
    try {
      console.log("Initializing MongoDB service...");
      await mongoConnectionService.connect();
      await mongoMachineService.seedDefaultMachines();
    } catch (error) {
      console.error("Error initializing MongoDB service:", error);
    }
  }
  
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
      
      // First, try to update through the user collection
      const allUsers = await mongoUserService.getUsers();
      for (const user of allUsers) {
        if (user.bookings && user.bookings.length > 0) {
          const bookingIndex = user.bookings.findIndex(b => 
            (b._id?.toString() === bookingId) || (b.id === bookingId)
          );
          
          if (bookingIndex >= 0) {
            // Found the booking, update its status
            user.bookings[bookingIndex].status = status;
            const success = await mongoUserService.updateUser(user._id, user);
            if (success) {
              console.log(`Successfully updated booking ${bookingId} to ${status} in MongoDB`);
              return true;
            }
          }
        }
      }
      
      // If we reach here, we couldn't find the booking in any user
      console.error(`Could not find booking ${bookingId} in any user's bookings`);
      
      // Make an API request to update the booking status as a fallback
      try {
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
        console.error('Error in API fallback for updateBookingStatus:', error);
        return false;
      }
    } catch (error) {
      console.error('Error in MongoDbService.updateBookingStatus:', error);
      return false;
    }
  }
  
  // Get all bookings (for admin)
  async getAllBookings(): Promise<any[]> {
    if (isWeb) return [];
    
    try {
      console.log("Getting all bookings from MongoDB");
      const allUsers = await mongoUserService.getUsers();
      const allBookings = [];
      
      for (const user of allUsers) {
        if (user.bookings && user.bookings.length > 0) {
          for (const booking of user.bookings) {
            // Get machine name
            let machineName = "Unknown Machine";
            try {
              const machine = await mongoMachineService.getMachineById(booking.machineId);
              machineName = machine?.name || this.getMachineName(booking.machineId);
            } catch (err) {
              console.error("Error getting machine name:", err);
            }
            
            allBookings.push({
              ...booking,
              _id: booking._id || booking.id,
              id: booking.id || booking._id,
              userId: user._id,
              userName: user.name,
              userEmail: user.email,
              machineName
            });
          }
        }
      }
      
      console.log(`Retrieved ${allBookings.length} bookings from MongoDB`);
      return allBookings;
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
  
  // Helper method to get machine name from ID
  private getMachineName(machineId: string): string {
    const machineMap = {
      '1': 'Laser Cutter',
      '2': '3D Printer',
      '3': 'CNC Router',
      '4': 'Vinyl Cutter',
      '5': 'Soldering Station'
    };
    
    return machineMap[machineId] || `Machine ${machineId}`;
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
