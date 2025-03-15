
// Facade for all database services
import { userService } from './userService';
import databaseService from './databaseService';
import { localStorageService } from './localStorageService';
import mongoDbService from './mongoDbService';

class UserDatabase {
  // User methods
  async getAllUsers() {
    return userService.getAllUsers();
  }
  
  async findUserByEmail(email: string) {
    return userService.findUserByEmail(email);
  }
  
  async authenticate(email: string, password: string) {
    return userService.authenticate(email, password);
  }
  
  async registerUser(email: string, password: string, name: string) {
    return userService.registerUser(email, password, name);
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string}) {
    return userService.updateUserProfile(userId, updates);
  }
  
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return userService.changePassword(userId, currentPassword, newPassword);
  }
  
  async requestPasswordReset(email: string) {
    return userService.requestPasswordReset(email);
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    return userService.resetPassword(email, resetCode, newPassword);
  }
  
  // Delete user
  async deleteUser(userId: string) {
    try {
      // Try MongoDB first
      try {
        const success = await mongoDbService.deleteUser(userId);
        if (success) {
          console.log(`Successfully deleted user ${userId} from MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error(`MongoDB error deleting user ${userId}:`, mongoError);
      }
      
      // Try localStorage as fallback
      try {
        // Get user to check if admin (don't allow admin deletion)
        const user = localStorageService.findUserById(userId);
        if (!user) {
          console.log(`User ${userId} not found in localStorage`);
          return false;
        }
        
        if (user.isAdmin) {
          console.log(`Cannot delete admin user ${userId}`);
          return false;
        }
        
        // Delete user bookings from the bookings collection
        const allBookings = localStorageService.getBookings();
        const updatedBookings = allBookings.filter(booking => booking.userId !== userId);
        localStorageService.saveBookings(updatedBookings);
        
        // Delete the user
        localStorageService.deleteUser(userId);
        console.log(`Successfully deleted user ${userId} from localStorage`);
        return true;
      } catch (storageError) {
        console.error(`LocalStorage error deleting user ${userId}:`, storageError);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }
  
  // Certification methods
  async addCertification(userId: string, machineId: string) {
    return databaseService.addCertification(userId, machineId);
  }
  
  // Booking methods
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return databaseService.addBooking(userId, machineId, date, time);
  }
  
  async getUserBookings(userId: string) {
    const user = await databaseService.findUserById(userId);
    return user?.bookings || [];
  }
  
  // Machine methods
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return databaseService.updateMachineStatus(machineId, status, note);
  }
  
  async getMachineStatus(machineId: string) {
    return databaseService.getMachineStatus(machineId);
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    // This functionality would be in the API
    return null;
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
