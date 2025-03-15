// Facade for all database services
import { userService } from './userService';
import databaseService from './databaseService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';

class UserDatabase {
  // User methods
  async getAllUsers() {
    try {
      return await userService.getAllUsers();
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }
  
  async findUserByEmail(email: string) {
    try {
      return await userService.findUserByEmail(email);
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return null;
    }
  }
  
  async authenticate(email: string, password: string) {
    try {
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
      
      // Try to delete via API first
      try {
        console.log('Deleting via API...');
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log(`User ${userId} deleted successfully via API`);
            return true;
          }
          
          console.error(`API deletion error: ${response.status} ${response.statusText}`);
          // Don't try to parse JSON if there's no content
          if (response.headers.get('content-length') !== '0') {
            try {
              const errorData = await response.json();
              console.error(`API deletion error details: ${errorData.message}`);
            } catch (jsonError) {
              console.error('Could not parse error response');
            }
          }
        }
      } catch (apiError) {
        console.error('API deletion error:', apiError);
      }
      
      // Fallback to MongoDB service if API fails
      console.log('Fallback: Deleting via MongoDB service...');
      const success = await mongoDbService.deleteUser(userId);
      console.log(`MongoDB deletion result for ${userId}: ${success}`);
      
      if (success) {
        return true;
      }
      
      // Last resort: LocalStorage
      const user = localStorageService.findUserById(userId);
      if (user) {
        const localSuccess = localStorageService.deleteUser(userId);
        console.log(`LocalStorage deletion result for ${userId}: ${localSuccess}`);
        return localSuccess;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }

  // Helper to find user by ID
  async findUserById(userId: string) {
    try {
      const user = await mongoDbService.getUserById(userId);
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
