
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoSeedService from './mongodb/seedService';
import { isWeb } from '../utils/platform';
import { toast } from '@/components/ui/use-toast';

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
  
  async getUserByEmail(email: string) {
    if (isWeb) return null;
    
    try {
      return await mongoUserService.getUserByEmail(email);
    } catch (error) {
      console.error(`Error getting user by email ${email} from MongoDB:`, error);
      return null;
    }
  }
  
  async createUser(user: any) {
    if (isWeb) return null;
    
    try {
      return await mongoUserService.createUser(user);
    } catch (error) {
      console.error("Error creating user in MongoDB:", error);
      return null;
    }
  }
  
  async updateUser(userId: string, updates: any) {
    if (isWeb) return false;
    
    try {
      const result = await mongoUserService.updateUser(userId, updates);
      return result;
    } catch (error) {
      console.error(`Error updating user ${userId} in MongoDB:`, error);
      return false;
    }
  }
  
  async updateUserCertifications(userId: string, machineId: string) {
    if (isWeb) return false;
    
    try {
      return await mongoUserService.updateUserCertifications(userId, machineId);
    } catch (error) {
      console.error(`Error updating certifications for user ${userId} in MongoDB:`, error);
      return false;
    }
  }
  
  async getAllBookings() {
    if (isWeb) return [];
    
    try {
      const users = await mongoUserService.getUsers();
      let allBookings = [];
      
      // Collect all bookings from all users
      for (const user of users) {
        if (user.bookings && Array.isArray(user.bookings)) {
          const userBookings = user.bookings.map(booking => ({
            ...booking,
            userId: user.id,
            userName: user.name
          }));
          allBookings = [...allBookings, ...userBookings];
        }
      }
      
      return allBookings;
    } catch (error) {
      console.error("Error getting all bookings from MongoDB:", error);
      return [];
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string) {
    if (isWeb) return false;
    
    try {
      return await mongoUserService.updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status in MongoDB:`, error);
      return false;
    }
  }
  
  async addUserBooking(userId: string, booking: any) {
    if (isWeb) return false;
    
    try {
      return await mongoUserService.addUserBooking(userId, booking);
    } catch (error) {
      console.error(`Error adding booking for user ${userId} in MongoDB:`, error);
      return false;
    }
  }
  
  async deleteUser(userId: string) {
    if (isWeb) return false;
    
    try {
      // Find user first
      const user = await mongoUserService.getUserById(userId);
      if (!user) {
        console.log(`User ${userId} not found in MongoDB`);
        return false;
      }
      
      // Don't allow deletion of admin users
      if (user.isAdmin) {
        console.log(`Cannot delete admin user ${userId}`);
        toast({
          title: "Operation Not Allowed",
          description: "Admin users cannot be deleted",
          variant: "destructive"
        });
        return false;
      }
      
      // Delete from users collection
      const deleteResult = await mongoUserService.deleteUser(userId);
      console.log(`User ${userId} deletion result:`, deleteResult);
      return deleteResult;
    } catch (error) {
      console.error(`Error deleting user ${userId} from MongoDB:`, error);
      return false;
    }
  }
  
  async deleteBooking(bookingId: string) {
    if (isWeb) return false;
    
    try {
      // Find user with this booking
      const users = await mongoUserService.getUsers();
      for (const user of users) {
        if (user.bookings && Array.isArray(user.bookings)) {
          const bookingIndex = user.bookings.findIndex(b => b.id === bookingId);
          if (bookingIndex >= 0) {
            // Remove booking from user
            user.bookings.splice(bookingIndex, 1);
            const updateResult = await mongoUserService.updateUser(user.id, { bookings: user.bookings });
            console.log(`Booking ${bookingId} deletion result:`, updateResult);
            return updateResult;
          }
        }
      }
      
      console.log(`Booking ${bookingId} not found in any user`);
      return false;
    } catch (error) {
      console.error(`Error deleting booking ${bookingId} from MongoDB:`, error);
      return false;
    }
  }
  
  // Clear all bookings (admin function)
  async clearAllBookings(): Promise<number> {
    if (isWeb) return 0;
    
    try {
      console.log("Attempting to clear all bookings across the system");
      const count = await mongoUserService.clearAllUserBookings();
      console.log(`Cleared ${count} bookings from all users`);
      return count;
    } catch (error) {
      console.error("Error clearing all bookings from MongoDB:", error);
      return 0;
    }
  }
  
  async getAllMachines() {
    if (isWeb) return [];
    
    try {
      return await mongoMachineService.getMachines();
    } catch (error) {
      console.error("Error getting all machines from MongoDB:", error);
      return [];
    }
  }
  
  async updateMachine(machineId: string, updates: any) {
    if (isWeb) return false;
    
    try {
      return await mongoMachineService.updateMachine(machineId, updates);
    } catch (error) {
      console.error(`Error updating machine ${machineId} in MongoDB:`, error);
      return false;
    }
  }
  
  async seedDatabase() {
    if (isWeb) return false;
    
    try {
      return await mongoSeedService.seed();
    } catch (error) {
      console.error("Error seeding MongoDB:", error);
      return false;
    }
  }
}

// Create a singleton instance
const mongoDbService = new MongoDbService();
export default mongoDbService;
