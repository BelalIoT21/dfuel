// Facade for all database services
import { userService } from './userService';
import databaseService from './databaseService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';
import { toast } from '@/components/ui/use-toast';

class UserDatabase {
  // User methods
  async getAllUsers() {
    try {
      // Only use MongoDB
      const mongoUsers = await mongoDbService.getAllUsers();
      console.log(`Retrieved ${mongoUsers ? mongoUsers.length : 0} users from MongoDB`);
      return mongoUsers || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      toast({
        title: "Database Error",
        description: "Could not retrieve users from MongoDB",
        variant: "destructive"
      });
      return [];
    }
  }
  
  async findUserByEmail(email: string) {
    try {
      // Only use MongoDB
      const mongoUser = await mongoDbService.getUserByEmail(email);
      if (mongoUser) {
        console.log(`Found user ${email} in MongoDB`);
      } else {
        console.log(`User ${email} not found in MongoDB`);
      }
      return mongoUser;
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      toast({
        title: "Database Error",
        description: "Could not retrieve user from MongoDB",
        variant: "destructive"
      });
      return null;
    }
  }
  
  async authenticate(email: string, password: string) {
    try {
      // Only authenticate using MongoDB
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
        } else {
          console.log(`MongoDB authentication failed for ${email} - incorrect password`);
        }
      } else {
        console.log(`MongoDB authentication failed for ${email} - user not found`);
      }
      
      return null;
    } catch (error) {
      console.error('Error in authenticate:', error);
      toast({
        title: "Authentication Error",
        description: "Could not authenticate with MongoDB",
        variant: "destructive"
      });
      return null;
    }
  }
  
  async registerUser(email: string, password: string, name: string) {
    try {
      // Check if user already exists in MongoDB
      const existingUser = await mongoDbService.getUserByEmail(email);
      if (existingUser) {
        console.log(`User ${email} already exists in MongoDB`);
        return null;
      }
      
      // Create new user in MongoDB
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
        isAdmin: false,
        certifications: [],
        bookings: [],
        lastLogin: new Date().toISOString(),
      };
      
      const result = await mongoDbService.createUser(newUser);
      console.log(`User ${email} created in MongoDB:`, result ? "success" : "failed");
      
      if (result) {
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('Error in registerUser:', error);
      toast({
        title: "Registration Error",
        description: "Could not register user in MongoDB",
        variant: "destructive"
      });
      return null;
    }
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string, password?: string}) {
    try {
      // Only update in MongoDB
      const result = await mongoDbService.updateUser(userId, updates);
      console.log(`User ${userId} profile update in MongoDB:`, result ? "success" : "failed");
      return result;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      toast({
        title: "Profile Update Error",
        description: "Could not update profile in MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      // Get user from MongoDB
      const user = await mongoDbService.getUserById(userId);
      if (!user) {
        console.log(`User ${userId} not found in MongoDB`);
        return false;
      }
      
      // Verify current password
      if (user.password !== currentPassword) {
        console.log(`Current password verification failed for user ${userId}`);
        return false;
      }
      
      // Update password in MongoDB
      const result = await mongoDbService.updateUser(userId, { password: newPassword });
      console.log(`Password changed for user ${userId}:`, result ? "success" : "failed");
      return result;
    } catch (error) {
      console.error('Error in changePassword:', error);
      toast({
        title: "Password Change Error",
        description: "Could not change password in MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async requestPasswordReset(email: string) {
    try {
      // Get user from MongoDB
      const user = await mongoDbService.getUserByEmail(email);
      if (!user) {
        console.log(`User ${email} not found in MongoDB for password reset`);
        return false;
      }
      
      // Generate reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user with reset code in MongoDB
      const result = await mongoDbService.updateUser(user.id, { resetCode });
      console.log(`Password reset requested for ${email}:`, result ? "success" : "failed");
      return result;
    } catch (error) {
      console.error('Error in requestPasswordReset:', error);
      toast({
        title: "Password Reset Error",
        description: "Could not request password reset in MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    try {
      // Get user from MongoDB
      const user = await mongoDbService.getUserByEmail(email);
      if (!user) {
        console.log(`User ${email} not found in MongoDB for password reset verification`);
        return false;
      }
      
      // Verify reset code
      if (!user.resetCode || user.resetCode !== resetCode) {
        console.log(`Invalid reset code for user ${email}`);
        return false;
      }
      
      // Update password and clear reset code in MongoDB
      const result = await mongoDbService.updateUser(user.id, { 
        password: newPassword,
        resetCode: null
      });
      
      console.log(`Password reset for ${email}:`, result ? "success" : "failed");
      return result;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      toast({
        title: "Password Reset Error",
        description: "Could not reset password in MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Delete user
  async deleteUser(userId: string) {
    try {
      console.log(`Attempting to delete user ${userId}`);
      
      // Get user details first from MongoDB only
      const user = await mongoDbService.getUserById(userId);
      
      // Check if user exists
      if (!user) {
        console.log(`User ${userId} not found in MongoDB`);
        return false;
      }
      
      // Delete from MongoDB - allow deletion of any user type
      const success = await mongoDbService.deleteUser(userId);
      console.log(`User ${userId} deletion result:`, success);
      return success;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      toast({
        title: "User Deletion Error",
        description: "Could not delete user from MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }

  // Helper to find user by ID
  async findUserById(userId: string) {
    try {
      // Only use MongoDB, no fallback
      const mongoUser = await mongoDbService.getUserById(userId);
      if (mongoUser) {
        console.log(`Found user ${userId} in MongoDB`);
      } else {
        console.log(`User ${userId} not found in MongoDB`);
      }
      return mongoUser;
    } catch (error) {
      console.error(`Error finding user ${userId}:`, error);
      toast({
        title: "Database Error",
        description: "Could not retrieve user from MongoDB",
        variant: "destructive"
      });
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
      toast({
        title: "Certification Error",
        description: "Could not add certification in MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Booking methods
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    try {
      // Create booking directly in MongoDB
      console.log(`Adding booking for user ${userId}, machine ${machineId}`);
      const newBooking = {
        id: `booking-${Date.now()}`,
        userId,
        machineId,
        date,
        time,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      return await mongoDbService.addUserBooking(userId, newBooking);
    } catch (error) {
      console.error('Error in addBooking:', error);
      toast({
        title: "Booking Error",
        description: "Could not add booking in MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async getUserBookings(userId: string) {
    try {
      // Get user from MongoDB
      const user = await mongoDbService.getUserById(userId);
      return user?.bookings || [];
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      toast({
        title: "Bookings Error",
        description: "Could not retrieve bookings from MongoDB",
        variant: "destructive"
      });
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
      toast({
        title: "Machine Status Error",
        description: "Could not update machine status in MongoDB",
        variant: "destructive"
      });
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
      toast({
        title: "Machine Status Error",
        description: "Could not retrieve machine status from MongoDB",
        variant: "destructive"
      });
      return 'available'; // Default status
    }
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    try {
      return await mongoDbService.getMachineMaintenanceNote(machineId);
    } catch (error) {
      console.error('Error in getMachineMaintenanceNote:', error);
      toast({
        title: "Machine Note Error",
        description: "Could not retrieve machine note from MongoDB",
        variant: "destructive"
      });
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
      toast({
        title: "Booking Deletion Error",
        description: "Could not delete booking from MongoDB",
        variant: "destructive"
      });
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
      toast({
        title: "Booking Clear Error",
        description: "Could not clear all bookings from MongoDB",
        variant: "destructive"
      });
      return false;
    }
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
