
import { userService } from './userService';
import databaseService from './databaseService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';

class UserDatabase {
  async getAllUsers() {
    try {
      // Only use MongoDB for consistency
      const mongoUsers = await mongoDbService.getAllUsers();
      if (mongoUsers && mongoUsers.length > 0) {
        console.log(`Retrieved ${mongoUsers.length} users from MongoDB`);
        return mongoUsers;
      }
      
      console.error("MongoDB returned no users, this should not happen");
      return [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }

  async findUserByEmail(email: string) {
    try {
      // Attempt to find user in MongoDB
      const mongoUser = await mongoDbService.getUserByEmail(email);
      if (mongoUser) {
        console.log(`Found user ${email} in MongoDB`);
        return mongoUser;
      }
      
      // Only if MongoDB specifically doesn't have this user, try userService
      console.log(`User ${email} not found in MongoDB, trying userService`);
      return await userService.findUserByEmail(email);
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return null;
    }
  }

  async addCertification(userId: string, certificationId: string) {
    try {
      console.log(`UserDatabase: Adding certification ${certificationId} for user ${userId}`);
      const success = await certificationService.addCertification(userId, certificationId);
      if (!success) {
        console.error(`Failed to add certification ${certificationId} for user ${userId}`);
      }
      return success;
    } catch (error) {
      console.error('Error in addCertification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      console.log(`UserDatabase: Removing certification ${certificationId} for ${userId}`);
      const success = await certificationService.removeCertification(userId, certificationId);
      if (!success) {
        console.error(`Failed to remove certification ${certificationId} for user ${userId}`);
      }
      return success;
    } catch (error) {
      console.error('Error in removeCertification:', error);
      return false;
    }
  }
}

const userDatabase = new UserDatabase();
export default userDatabase;
