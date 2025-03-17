
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
      
      // Try API first
      const response = await apiService.addCertification(userId, certificationId);
      if (response.data && response.data.success) {
        console.log(`Successfully added certification ${certificationId} for user ${userId} via API`);
        return true;
      }
      
      // Fall back to MongoDB
      const success = await mongoDbService.updateUserCertifications(userId, certificationId);
      if (success) {
        console.log(`Successfully added certification ${certificationId} for user ${userId} via MongoDB`);
        return true;
      }
      
      // Last resort: try certificationService
      const fallbackSuccess = await certificationService.addCertification(userId, certificationId);
      console.log(`certificationService add result: ${fallbackSuccess}`);
      return fallbackSuccess;
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
      
      // Try API first
      const response = await apiService.removeCertification(userId, certificationId);
      if (response.data && response.data.success) {
        console.log(`Successfully removed certification ${certificationId} for user ${userId} via API`);
        return true;
      }
      
      // Fall back to MongoDB
      const success = await mongoDbService.removeUserCertification(userId, certificationId);
      if (success) {
        console.log(`Successfully removed certification ${certificationId} for user ${userId} via MongoDB`);
        return true;
      }
      
      // Last resort: try certificationService
      const fallbackSuccess = await certificationService.removeCertification(userId, certificationId);
      console.log(`certificationService remove result: ${fallbackSuccess}`);
      return fallbackSuccess;
    } catch (error) {
      console.error('Error in removeCertification:', error);
      return false;
    }
  }
}

const userDatabase = new UserDatabase();
export default userDatabase;
