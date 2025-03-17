
import { userService } from './userService';
import databaseService from './databaseService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';

class UserDatabase {
  async getAllUsers() {
    try {
      // First try MongoDB
      const mongoUsers = await mongoDbService.getAllUsers();
      if (mongoUsers && mongoUsers.length > 0) {
        console.log(`Retrieved ${mongoUsers.length} users from MongoDB`);
        return mongoUsers;
      }
      
      // Fall back to userService
      console.log("Falling back to userService for getAllUsers");
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

  async addCertification(userId: string, certificationId: string) {
    try {
      console.log(`UserDatabase: Adding certification ${certificationId} for user ${userId}`);
      const success = await certificationService.addCertification(userId, certificationId);
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
      return success;
    } catch (error) {
      console.error('Error in removeCertification:', error);
      return false;
    }
  }
}

const userDatabase = new UserDatabase();
export default userDatabase;
