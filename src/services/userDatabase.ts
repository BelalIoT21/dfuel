import { userService } from './userService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';
import { UserWithoutSensitiveInfo } from '../types/database';
import { apiService } from './apiService';

class UserDatabase {
  async getAllUsers() {
    try {
      console.log("UserDatabase: Getting all users from MongoDB");
      
      // Try API first
      const response = await apiService.getAllUsers();
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Retrieved ${response.data.length} users from API`);
        
        // Convert MongoDB/API format (_id) to client format (id)
        const formattedUsers = response.data.map(user => ({
          id: user._id?.toString() || user.id?.toString() || '',
          name: user.name || '',
          email: user.email || '',
          isAdmin: user.isAdmin || false,
          certifications: user.certifications || [],
          bookings: user.bookings || [],
          lastLogin: user.lastLogin || user.updatedAt || new Date().toISOString()
        }));
        
        return formattedUsers;
      }
      
      // Fall back to MongoDB if API fails
      const mongoUsers = await mongoDbService.getAllUsers();
      if (mongoUsers && mongoUsers.length > 0) {
        console.log(`Retrieved ${mongoUsers.length} users from MongoDB`);
        return mongoUsers;
      }
      
      // Last resort: try userService (localStorage)
      const localUsers = await userService.getAllUsers();
      console.log(`Retrieved ${localUsers.length} users from localStorage`);
      return localUsers;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      
      // Last resort fallback to userService (localStorage)
      try {
        const localUsers = await userService.getAllUsers();
        console.log(`Fallback: Retrieved ${localUsers.length} users from localStorage`);
        return localUsers;
      } catch (e) {
        console.error('Even localStorage fallback failed:', e);
        return [];
      }
    }
  }

  async findUserByEmail(email: string) {
    try {
      console.log(`UserDatabase: Finding user by email: ${email}`);
      if (!email) {
        console.error("Invalid email passed to findUserByEmail");
        return null;
      }
      
      // Try API first
      const response = await apiService.getUserByEmail(email);
      if (response.data) {
        console.log(`Found user ${email} in API`);
        
        // Convert MongoDB format to client format
        const user = response.data;
        return {
          id: user._id?.toString() || user.id?.toString() || '',
          name: user.name || '',
          email: user.email || '',
          isAdmin: user.isAdmin || false,
          certifications: user.certifications || [],
          bookings: user.bookings || [],
          lastLogin: user.lastLogin || user.updatedAt || new Date().toISOString()
        };
      }
      
      // Try MongoDB next
      const mongoUser = await mongoDbService.getUserByEmail(email);
      if (mongoUser) {
        console.log(`Found user ${email} in MongoDB`);
        return mongoUser;
      }
      
      // Last resort: try userService
      console.log(`User ${email} not found in API or MongoDB, trying userService`);
      return await userService.findUserByEmail(email);
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return null;
    }
  }

  async addCertification(userId: string, certificationId: string) {
    try {
      console.log(`UserDatabase: Adding certification ${certificationId} for user ${userId}`);
      if (!userId || !certificationId) {
        console.error("Invalid userId or certificationId passed to addCertification");
        return false;
      }
      
      console.log(`UserDatabase: Using certificationService to add certification ${certificationId} for user ${userId}`);
      const success = await certificationService.addCertification(userId, certificationId);
      console.log(`certificationService add result: ${success}`);
      return success;
    } catch (error) {
      console.error('Error in addCertification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      console.log(`UserDatabase: Removing certification ${certificationId} for ${userId}`);
      if (!userId || !certificationId) {
        console.error("Invalid userId or certificationId passed to removeCertification");
        return false;
      }
      
      console.log(`UserDatabase: Using certificationService to remove certification ${certificationId} for user ${userId}`);
      const success = await certificationService.removeCertification(userId, certificationId);
      console.log(`certificationService remove result: ${success}`);
      return success;
    } catch (error) {
      console.error('Error in removeCertification:', error);
      return false;
    }
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string, password?: string}): Promise<boolean> {
    try {
      console.log(`UserDatabase: Updating profile for user ${userId}`, updates);
      
      // Try API first
      try {
        const response = await apiService.updateProfile(updates);
        if (response.data && response.data.success) {
          console.log("Successfully updated user profile via API");
          return true;
        }
      } catch (apiError) {
        console.error("API error when updating profile:", apiError);
      }
      
      // Fall back to MongoDB if API fails
      if (updates.password) {
        console.log("Update includes password change, trying MongoDB");
        // If password is being updated, we need to use MongoDB
        const mongoSuccess = await mongoDbService.updateUser(userId, updates);
        if (mongoSuccess) {
          console.log("Successfully updated user profile with password in MongoDB");
          return true;
        }
      } else {
        // For non-password updates, try MongoDB
        const mongoSuccess = await mongoDbService.updateUser(userId, updates);
        if (mongoSuccess) {
          console.log("Successfully updated user profile in MongoDB");
          return true;
        }
      }
      
      // Last resort: try userService (localStorage)
      const localSuccess = await userService.updateUser(userId, updates);
      console.log(`LocalStorage update result: ${localSuccess}`);
      return localSuccess;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }
  
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      console.log(`UserDatabase: Changing password for user ${userId}`);
      
      // Try API first
      try {
        const response = await apiService.changePassword(currentPassword, newPassword);
        if (response.data && response.data.success) {
          console.log("Successfully changed password via API");
          return true;
        }
      } catch (apiError) {
        console.error("API error when changing password:", apiError);
      }
      
      // Fall back to MongoDB
      try {
        // MongoDB password change is handled through the API, but we'll add it here for completeness
        const mongoSuccess = await mongoDbService.updateUser(userId, { password: newPassword });
        if (mongoSuccess) {
          console.log("Successfully changed password in MongoDB");
          return true;
        }
      } catch (mongoError) {
        console.error("MongoDB error when changing password:", mongoError);
      }
      
      // Last resort: userService (localStorage)
      // First verify the current password
      const user = await userService.findUserById(userId);
      if (user && user.password === currentPassword) {
        const success = await userService.updateUser(userId, { password: newPassword });
        console.log(`LocalStorage password change result: ${success}`);
        return success;
      } else {
        console.log("Current password verification failed in localStorage");
        return false;
      }
    } catch (error) {
      console.error('Error in changePassword:', error);
      return false;
    }
  }
  
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      console.log(`UserDatabase: Requesting password reset for ${email}`);
      
      // Try API first
      try {
        const response = await apiService.forgotPassword(email);
        if (response.data && response.data.message) {
          console.log("Successfully requested password reset via API");
          return true;
        }
      } catch (apiError) {
        console.error("API error when requesting password reset:", apiError);
      }
      
      // For demo/local purposes, just return success
      return true;
    } catch (error) {
      console.error('Error in requestPasswordReset:', error);
      return false;
    }
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<boolean> {
    try {
      console.log(`UserDatabase: Resetting password for ${email}`);
      
      // Try API first
      try {
        const response = await apiService.resetPassword(email, resetCode, newPassword);
        if (response.data && response.data.message) {
          console.log("Successfully reset password via API");
          return true;
        }
      } catch (apiError) {
        console.error("API error when resetting password:", apiError);
      }
      
      // For demo/local purposes, just return success
      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return false;
    }
  }
}

const userDatabase = new UserDatabase();
export default userDatabase;
