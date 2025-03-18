
import { User, UserWithoutSensitiveInfo } from '../types/database';
import databaseService from './databaseService';

export class UserService {
  // Get all users (for admin)
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    return databaseService.getAllUsers();
  }
  
  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      if (!email) {
        console.error('Invalid email provided to findUserByEmail');
        return undefined;
      }
      
      const user = await databaseService.findUserByEmail(email);
      return user || undefined;
    } catch (error) {
      console.error('Error in userService.findUserByEmail:', error);
      return undefined;
    }
  }
  
  // Find user by ID
  async findUserById(id: string): Promise<User | undefined> {
    try {
      if (!id) {
        console.error('Invalid id provided to findUserById');
        return undefined;
      }
      
      // Check databaseService
      const user = await databaseService.findUserById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error in userService.findUserById:', error);
      return undefined;
    }
  }
  
  // Authenticate user
  async authenticate(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
    return databaseService.authenticate(email, password);
  }
  
  // Register new user
  async registerUser(email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> {
    return databaseService.registerUser(email, password, name);
  }
  
  // Update user profile
  async updateProfile(userId: string, updates: {name?: string, email?: string, password?: string}): Promise<boolean> {
    try {
      console.log(`Attempting to update user profile in userService: ${userId}`, updates);
      
      if (!userId) {
        console.error("Invalid userId provided to updateProfile");
        return false;
      }
      
      // Call the database update method
      const success = await databaseService.updateUserProfile(userId, updates);
      return success;
    } catch (error) {
      console.error('Error in userService.updateProfile:', error);
      return false;
    }
  }

  // Change user password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      console.log(`Attempting to change password in userService: ${userId}`);
      
      if (!userId || !currentPassword || !newPassword) {
        console.error("Invalid parameters for changePassword");
        throw new Error("Invalid parameters for password change");
      }
      
      // Enforce password requirements
      if (newPassword.length < 6) {
        console.error("Password must be at least 6 characters");
        throw new Error("Password must be at least 6 characters");
      }
      
      // Update password in database with current password verification
      return await databaseService.updateUserProfile(userId, { 
        password: newPassword,
        currentPassword: currentPassword
      });
    } catch (error) {
      console.error('Error in userService.changePassword:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const userService = new UserService();
