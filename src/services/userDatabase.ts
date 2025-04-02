
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
      
      console.log('No users found in API or MongoDB');
      return [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
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
          password: user.password,
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
      
      console.log(`User ${email} not found in API or MongoDB`);
      return null;
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return null;
    }
  }

  async findUserById(userId: string) {
    try {
      console.log(`UserDatabase: Finding user by id: ${userId}`);
      if (!userId) {
        console.error("Invalid userId passed to findUserById");
        return null;
      }
      
      // Try API first
      try {
        const response = await apiService.getUserById(userId);
        if (response.data) {
          console.log(`Found user ${userId} in API`);
          
          // Convert MongoDB format to client format
          const user = response.data;
          return {
            id: user._id?.toString() || user.id?.toString() || '',
            name: user.name || '',
            email: user.email || '',
            password: user.password,
            isAdmin: user.isAdmin || false,
            certifications: user.certifications || [],
            bookings: user.bookings || [],
            lastLogin: user.lastLogin || user.updatedAt || new Date().toISOString()
          };
        }
      } catch (apiError) {
        console.error("API error in findUserById:", apiError);
      }
      
      // Try MongoDB next
      try {
        const mongoUser = await mongoDbService.getUserById(userId);
        if (mongoUser) {
          console.log(`Found user ${userId} in MongoDB`);
          return mongoUser;
        }
      } catch (mongoError) {
        console.error("MongoDB error in findUserById:", mongoError);
      }
      
      console.warn(`User ${userId} not found anywhere, returning null`);
      return null;
    } catch (error) {
      console.error('Error in findUserById:', error);
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
  
  async updateUserProfile(userId: string, updates: {name?: string; email?: string; password?: string; currentPassword?: string}): Promise<boolean> {
    try {
      console.log(`UserDatabase: Updating profile for user ${userId}`, updates);
      
      // Try API first with proper auth token
      try {
        console.log("Attempting to update profile via API...");
        
        // For password change
        if (updates.password && updates.currentPassword) {
          const response = await apiService.changePassword(updates.currentPassword, updates.password);
          if (response.data && response.data.success) {
            console.log("Successfully changed password via API");
            return true;
          } else {
            console.error("API error when changing password:", response.error);
            if (response.error?.includes('Current password is incorrect')) {
              throw new Error('Current password is incorrect');
            }
            return false;
          }
        }
        
        // For profile update
        else {
          const profileUpdates = {
            name: updates.name,
            email: updates.email
          };
          
          // Filter out undefined values
          const filteredUpdates = Object.fromEntries(
            Object.entries(profileUpdates).filter(([_, v]) => v !== undefined)
          );
          
          // Make the API request to update the profile
          const response = await apiService.updateProfile(userId, filteredUpdates);
          if (response.data && response.data.success) {
            console.log("Successfully updated user profile via API");
            return true;
          } else if (response.error) {
            console.error("API error when updating profile:", response.error);
            throw new Error(response.error);
          } else {
            return false;
          }
        }
      } catch (apiError) {
        console.error("API error when updating profile:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }
  
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      console.log(`UserDatabase: Changing password for user ${userId}`);
      
      // Use API service
      try {
        console.log("Attempting to change password via API...");
        
        // Ensure token is set
        const token = localStorage.getItem('token');
        if (token) {
          apiService.setToken(token);
        }
        
        const response = await apiService.changePassword(currentPassword, newPassword);
        if (response.data && response.data.success) {
          console.log("Successfully changed password via API");
          return true;
        } else {
          console.error("API error when changing password:", response.error);
          if (response.error?.includes('Current password is incorrect')) {
            throw new Error('Current password is incorrect');
          }
          return false;
        }
      } catch (apiError) {
        console.error("API error when changing password:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  }

  static Instance = new UserDatabase();
}

export default UserDatabase.Instance;
