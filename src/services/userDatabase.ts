// Facade for all database services
import { userService } from './userService';
import databaseService from './databaseService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';

class UserDatabase {
  // User methods
  async getAllUsers() {
    try {
      // Always try MongoDB first before using localStorage fallback
      const mongoUsers = await mongoDbService.getAllUsers();
      if (mongoUsers && mongoUsers.length > 0) {
        console.log(`Retrieved ${mongoUsers.length} users from MongoDB`);
        return mongoUsers;
      }
      
      // Fallback to userService
      console.log("Falling back to userService for getAllUsers");
      return await userService.getAllUsers();
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }
  
  async findUserByEmail(email: string) {
    try {
      // Try MongoDB first
      const mongoUser = await mongoDbService.getUserByEmail(email);
      if (mongoUser) {
        console.log(`Found user ${email} in MongoDB`);
        return mongoUser;
      }
      
      // Fallback to userService
      console.log(`Falling back to userService for findUserByEmail: ${email}`);
      return await userService.findUserByEmail(email);
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return null;
    }
  }
  
  async authenticate(email: string, password: string) {
    try {
      // First try to authenticate using MongoDB
      console.log(`Attempting to authenticate ${email} with MongoDB`);
      const mongoUser = await mongoDbService.getUserByEmail(email);
      
      if (mongoUser) {
        // Simple password comparison (in production would use bcrypt)
        if (mongoUser.password === password) {
          console.log(`MongoDB authentication successful for ${email}`);
          
          // Update last login time
          await mongoDbService.updateUser(mongoUser.id, {
            lastLogin: new Date().toISOString()
          });
          
          // Remove password before returning
          const { password, ...userWithoutPassword } = mongoUser;
          return userWithoutPassword;
        }
      }
      
      // Fallback to userService
      console.log(`Falling back to userService for authentication: ${email}`);
      return await userService.authenticate(email, password);
    } catch (error) {
      console.error('Error in authenticate:', error);
      return null;
    }
  }
  
  async registerUser(email: string, password: string, name: string) {
    try {
      return await userService.registerUser(email, password, name);
    } catch (error) {
      console.error('Error in registerUser:', error);
      return null;
    }
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string, password?: string}) {
    try {
      return await userService.updateUserProfile(userId, updates);
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }
  
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      return await userService.changePassword(userId, currentPassword, newPassword);
    } catch (error) {
      console.error('Error in changePassword:', error);
      return false;
    }
  }
  
  async requestPasswordReset(email: string) {
    try {
      return await userService.requestPasswordReset(email);
    } catch (error) {
      console.error('Error in requestPasswordReset:', error);
      return false;
    }
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    try {
      return await userService.resetPassword(email, resetCode, newPassword);
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return false;
    }
  }
  
  // Delete user
  async deleteUser(userId: string) {
    try {
      console.log(`Attempting to delete user ${userId}`);
      
      // Get user details first
      const user = await this.findUserById(userId);
      
      // Check if user exists
      if (!user) {
        console.log(`User ${userId} not found`);
        return false;
      }
      
      // Delete from MongoDB - allow deletion of any user type
      const success = await mongoDbService.deleteUser(userId);
      console.log(`User ${userId} deletion result:`, success);
      return success;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }

  // Helper to find user by ID
  async findUserById(userId: string) {
    try {
      // Try MongoDB first
      const mongoUser = await mongoDbService.getUserById(userId);
      if (mongoUser) {
        console.log(`Found user ${userId} in MongoDB`);
        return mongoUser;
      }
      
      // Fallback to local service
      console.log(`Falling back to localStorage for findUserById: ${userId}`);
      const user = await databaseService.findUserById(userId);
      return user;
    } catch (error) {
      console.error(`Error finding user ${userId}:`, error);
      return null;
    }
  }
  
  // Certification methods
  async addCertification(userId: string, machineId: string) {
    try {
      console.log(`UserDatabase.addCertification: userId=${userId}, machineId=${machineId}`);
      
      // If it's machine safety course, use the specialized method
      if (machineId === "6") {
        console.log(`Adding Machine Safety Course (ID: ${machineId}) for user ${userId}`);
        return await certificationService.addMachineSafetyCertification(userId);
      }
      
      // For other certifications, use the standard method
      console.log(`Adding certification for user ${userId}, machine ${machineId}`);
      return await certificationService.addCertification(userId, machineId);
    } catch (error) {
      console.error('Error in addCertification:', error);
      return false;
    }
  }
  
  // Booking methods
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    try {
      return await databaseService.addBooking(userId, machineId, date, time);
    } catch (error) {
      console.error('Error in addBooking:', error);
      return false;
    }
  }
  
  async getUserBookings(userId: string) {
    try {
      const user = await databaseService.findUserById(userId);
      return user?.bookings || [];
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      return [];
    }
  }
  
  // Machine methods
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    try {
      console.log(`Updating machine status: ${machineId} to ${status}`);
      return await mongoDbService.updateMachineStatus(machineId, status, note);
    } catch (error) {
      console.error('Error in updateMachineStatus:', error);
      return false;
    }
  }
  
  async getMachineStatus(machineId: string) {
    try {
      console.log(`Getting machine status for: ${machineId}`);
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        console.log(`Got status from MongoDB: ${status}`);
        return status;
      }
      return 'available'; // Default status
    } catch (error) {
      console.error('Error in getMachineStatus:', error);
      return 'available'; // Default status
    }
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    try {
      // This functionality would be in the MongoDB
      return await mongoDbService.getMachineMaintenanceNote(machineId);
    } catch (error) {
      console.error('Error in getMachineMaintenanceNote:', error);
      return null;
    }
  }
  
  // Delete booking method
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      console.log(`Attempting to delete booking ${bookingId}`);
      return await mongoDbService.deleteBooking(bookingId);
    } catch (error) {
      console.error(`Error deleting booking ${bookingId}:`, error);
      return false;
    }
  }
  
  // Clear all bookings in the system (admin only)
  async clearAllBookings(): Promise<boolean> {
    try {
      console.log("Attempting to clear all bookings across the system");
      const count = await mongoDbService.clearAllBookings();
      console.log(`Successfully cleared ${count} bookings from MongoDB`);
      return count > 0;
    } catch (error) {
      console.error("Error clearing all bookings:", error);
      return false;
    }
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
