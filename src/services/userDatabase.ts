// Facade for all database services
import { userService } from './userService';
import databaseService from './databaseService';
import { localStorageService } from './localStorageService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';

class UserDatabase {
  // User methods
  async getAllUsers() {
    try {
      return await userService.getAllUsers();
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      // Fallback to localStorage
      return localStorageService.getAllUsersWithoutSensitiveInfo();
    }
  }
  
  async findUserByEmail(email: string) {
    try {
      return await userService.findUserByEmail(email);
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return localStorageService.findUserByEmail(email);
    }
  }
  
  async authenticate(email: string, password: string) {
    try {
      return await userService.authenticate(email, password);
    } catch (error) {
      console.error('Error in authenticate:', error);
      // For authentication errors, we should just return null rather than trying localStorage
      // as localStorage would need the plaintext password which is insecure
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
      if (!updates.password) {
        // Only try localStorage for non-password updates
        return localStorageService.updateUser(userId, updates);
      }
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
      
      // Get user details first for admin check
      const user = await this.findUserById(userId);
      
      // Check if user exists
      if (!user) {
        console.log(`User ${userId} not found`);
        return false;
      }
      
      // Check if user is admin - only protection we keep
      if (user.isAdmin) {
        console.log(`Cannot delete admin user ${userId}`);
        return false;
      }
      
      // Try MongoDB first
      let success = false;
      try {
        console.log(`Attempting to delete user ${userId} from MongoDB`);
        success = await mongoDbService.deleteUser(userId);
        if (success) {
          console.log(`Successfully deleted user ${userId} from MongoDB`);
          return true;
        } else {
          console.log(`Failed to delete user ${userId} from MongoDB`);
        }
      } catch (mongoError) {
        console.error(`MongoDB error deleting user ${userId}:`, mongoError);
      }
      
      // Try localStorage as fallback
      try {
        console.log(`Attempting to delete user ${userId} from localStorage`);
        
        // Delete user bookings from the bookings collection
        const allBookings = localStorageService.getBookings();
        const updatedBookings = allBookings.filter(booking => booking.userId !== userId);
        localStorageService.saveBookings(updatedBookings);
        
        // Delete the user
        const result = localStorageService.deleteUser(userId);
        console.log(`Delete user ${userId} from localStorage result:`, result);
        return result;
      } catch (storageError) {
        console.error(`LocalStorage error deleting user ${userId}:`, storageError);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }

  // Helper to find user by ID
  async findUserById(userId: string) {
    try {
      // Try MongoDB first
      try {
        const user = await mongoDbService.getUserById(userId);
        if (user) {
          return user;
        }
      } catch (mongoError) {
        console.error(`MongoDB error finding user ${userId}:`, mongoError);
      }
      
      // Fallback to localStorage
      return localStorageService.findUserById(userId);
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
        
        // Try MongoDB first
        try {
          const success = await mongoDbService.updateUserCertifications(userId, machineId);
          if (success) {
            console.log(`MongoDB directly added Machine Safety Course for user ${userId}`);
            return true;
          }
        } catch (error) {
          console.error("MongoDB error adding safety certification:", error);
        }
        
        // Then try through certification service
        try {
          const success = await certificationService.addMachineSafetyCertification(userId);
          console.log(`CertificationService added Machine Safety Course for user ${userId}: ${success}`);
          return success;
        } catch (error) {
          console.error("CertificationService error adding safety certification:", error);
        }
        
        // Last resort - direct localStorage
        try {
          const user = localStorageService.findUserById(userId);
          if (user) {
            if (!user.certifications) user.certifications = [];
            if (!user.certifications.includes(machineId)) {
              user.certifications.push(machineId);
              const success = localStorageService.updateUser(userId, { certifications: user.certifications });
              console.log(`Direct localStorage update for safety course: ${success}`);
              return success;
            }
            return true; // User already has certification
          }
        } catch (error) {
          console.error("localStorage error adding safety certification:", error);
        }
        
        return false;
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
      // Try MongoDB first
      try {
        const success = await mongoDbService.updateMachineStatus(machineId, status, note);
        if (success) {
          console.log(`Successfully updated machine status in MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error(`MongoDB error updating machine status:`, mongoError);
      }
      
      // Fallback to localStorage
      return databaseService.updateMachineStatus(machineId, status, note);
    } catch (error) {
      console.error('Error in updateMachineStatus:', error);
      // Try direct localStorage update as last resort
      return localStorageService.updateMachineStatus(machineId, status);
    }
  }
  
  async getMachineStatus(machineId: string) {
    try {
      console.log(`Getting machine status for: ${machineId}`);
      // Try MongoDB first
      try {
        const status = await mongoDbService.getMachineStatus(machineId);
        if (status) {
          console.log(`Got status from MongoDB: ${status}`);
          return status;
        }
      } catch (mongoError) {
        console.error(`MongoDB error getting machine status:`, mongoError);
      }
      
      // Fallback to localStorage via databaseService
      return databaseService.getMachineStatus(machineId);
    } catch (error) {
      console.error('Error in getMachineStatus:', error);
      // Try direct localStorage check as last resort
      return localStorageService.getMachineStatus(machineId) || 'available';
    }
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    try {
      // This functionality would be in the API
      return null;
    } catch (error) {
      console.error('Error in getMachineMaintenanceNote:', error);
      return null;
    }
  }
  
  // Delete booking method
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      console.log(`Attempting to delete booking ${bookingId}`);
      
      // Try MongoDB first
      try {
        const success = await mongoDbService.deleteBooking(bookingId);
        if (success) {
          console.log(`Successfully deleted booking ${bookingId} from MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error(`MongoDB error deleting booking ${bookingId}:`, mongoError);
      }
      
      // Try localStorage as fallback
      try {
        // Get all bookings
        const allBookings = localStorageService.getBookings();
        
        // Find the booking
        const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
        if (bookingIndex === -1) {
          console.log(`Booking ${bookingId} not found in localStorage`);
          return false;
        }
        
        // Get booking details before removing it
        const booking = allBookings[bookingIndex];
        
        // Remove the booking from the bookings collection
        allBookings.splice(bookingIndex, 1);
        localStorageService.saveBookings(allBookings);
        
        // If userId is available, remove the booking from the user's bookings as well
        if (booking && booking.userId) {
          const user = localStorageService.findUserById(booking.userId);
          if (user && user.bookings) {
            const updatedBookings = user.bookings.filter(b => b.id !== bookingId);
            localStorageService.updateUser(booking.userId, { bookings: updatedBookings });
          }
        }
        
        console.log(`Successfully deleted booking ${bookingId} from localStorage`);
        return true;
      } catch (storageError) {
        console.error(`LocalStorage error deleting booking ${bookingId}:`, storageError);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting booking ${bookingId}:`, error);
      return false;
    }
  }
  
  // Clear all bookings in the system (admin only)
  async clearAllBookings(): Promise<boolean> {
    try {
      console.log("Attempting to clear all bookings across the system");
      
      // Try MongoDB first
      try {
        const count = await mongoDbService.clearAllBookings();
        if (count > 0) {
          console.log(`Successfully cleared ${count} bookings from MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error("MongoDB error clearing all bookings:", mongoError);
      }
      
      // Try localStorage as fallback
      try {
        // Clear all bookings from all users
        const users = localStorageService.getAllUsers();
        let totalCleared = 0;
        
        for (const user of users) {
          if (user.bookings && user.bookings.length > 0) {
            totalCleared += user.bookings.length;
            localStorageService.updateUser(user.id, { bookings: [] });
          }
        }
        
        // Also clear the separate bookings collection
        localStorageService.saveBookings([]);
        
        console.log(`Successfully cleared ${totalCleared} bookings from localStorage`);
        return totalCleared > 0;
      } catch (storageError) {
        console.error("LocalStorage error clearing all bookings:", storageError);
        return false;
      }
    } catch (error) {
      console.error("Error clearing all bookings:", error);
      return false;
    }
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
