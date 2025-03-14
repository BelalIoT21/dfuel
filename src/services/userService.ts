
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
    
    // Update password
    const success = await databaseService.updateUserProfile(userId, { password: newPassword });
    
    // If admin, update admin password in environment system
    if (success && user.isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    return success;
  }
  
  // Request password reset
  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await databaseService.findUserByEmail(email);
    if (!user) return false;
    
    // Generate a simple 6-digit code (in a real app, this would be more secure)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Code expires in 1 hour
    
    const resetCodeObj = {
      code: resetCode,
      expiry: expiry.toISOString()
    };
    
    // Update user with reset code
    const success = await databaseService.updateUserProfile(user.id, { resetCode: resetCodeObj } as any);
    
    if (success) {
      // In a real app, this would send an email
      console.log(`
  ==== Password Reset Email ====
  To: ${email}
  Subject: Learnit Password Reset

  Dear ${user.name},

  We received a request to reset your password for your Learnit account.

  Your password reset code is: ${resetCode}

  This code will expire in 1 hour.

  If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.

  Thank you,
  The Learnit Team
  ==========================
      `);
    }
    
    return success;
  }

  // Reset password with code
  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<boolean> {
    const user = await databaseService.findUserByEmail(email);
    if (!user) return false;
    
    // Check if reset code exists and is valid
    if (!user.resetCode) return false;
    
    if (user.resetCode.code !== resetCode) return false;
    
    // Check if code is expired
    if (new Date() > new Date(user.resetCode.expiry)) return false;
    
    // Enforce password requirements
    if (newPassword.length < 6) return false;
    
    // Update password and clear reset code
    const success = await databaseService.updateUserProfile(user.id, {
      password: newPassword,
      resetCode: undefined
    } as any);
    
    // If admin, update admin password in "environment"
    if (success && user.isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    return success;
  }
}

// Create a singleton instance
export const userService = new UserService();
