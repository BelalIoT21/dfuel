import { userService } from './userService';
import databaseService from './databaseService';
import mongoDbService from './mongoDbService';
import { certificationService } from './certificationService';

class UserDatabase {
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

  async addCertification(userId: string, certificationId: string) {
    try {
      return await certificationService.addCertification(userId, certificationId);
    } catch (error) {
      console.error('Error in addCertification:', error);
      return false;
    }
  }

  async removeCertification(userId: string, certificationId: string): Promise<boolean> {
    try {
      console.log(`UserDatabase: Removing certification ${certificationId} for ${userId}`);
      return await certificationService.removeCertification(userId, certificationId);
    } catch (error) {
      console.error('Error in removeCertification:', error);
      return false;
    }
  }
}

const userDatabase = new UserDatabase();
export default userDatabase;