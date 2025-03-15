
import { User, UserWithoutSensitiveInfo } from '../types/database';
import databaseService from './databaseService';
import { getAdminCredentials, setAdminCredentials } from '../utils/adminCredentials';

export class UserService {
  // Get all users (for admin)
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    return databaseService.getAllUsers();
  }
  
  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    return databaseService.findUserByEmail(email);
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
  async updateUserProfile(userId: string, updates: {name?: string, email?: string}): Promise<boolean> {
    // Check if user is admin
    const user = await databaseService.findUserById(userId);
    if (user?.isAdmin && updates.email) {
      const { adminPassword } = getAdminCredentials();
      // Update the admin email in our environment system
      setAdminCredentials(updates.email, adminPassword);
    }
    
    return databaseService.updateUserProfile(userId, updates);
  }

  // Change user password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await databaseService.findUserById(userId);
    if (!user) return false;
    
    // Verify current password
    if (user.password !== currentPassword) return false;
    
    // Enforce password requirements
    if (newPassword.length < 6) return false;
    
    // Update password - need to pass it as an object with password property
    const updates = { password: newPassword };
    const success = await databaseService.updateUserProfile(userId, updates);
    
    // If admin, update admin password in environment system
    if (success && user.isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    return success;
  }
}

// Create a singleton instance
export const userService = new UserService();
