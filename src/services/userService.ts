
import { User, UserWithoutSensitiveInfo } from '../types/database';
import databaseService from './databaseService';
import { getAdminCredentials, setAdminCredentials } from '../utils/adminCredentials';
import { localStorageService } from './localStorageService';

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
      // Fallback to localStorage
      return localStorageService.findUserByEmail(email);
    }
  }
  
  // Find user by ID
  async findUserById(id: string): Promise<User | undefined> {
    try {
      if (!id) {
        console.error('Invalid id provided to findUserById');
        return undefined;
      }
      
      // First check databaseService
      const user = await databaseService.findUserById(id);
      if (user) return user;
      
      // If not found, check localStorage
      const localUser = localStorageService.findUserById(id);
      return localUser || undefined;
    } catch (error) {
      console.error('Error in userService.findUserById:', error);
      // Fallback to localStorage
      return localStorageService.findUserById(id);
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
      
      // First update the localStorage as a fallback mechanism
      let localStorageUpdated = false;
      try {
        localStorageUpdated = localStorageService.updateUser(userId, updates);
        console.log(`LocalStorage user update result: ${localStorageUpdated ? 'success' : 'failed'}`);
      } catch (localError) {
        console.error("Error updating localStorage user:", localError);
      }
      
      // Check if user is admin
      let isAdmin = false;
      try {
        // Try to get user to check if admin
        const user = await this.findUserById(userId);
        isAdmin = user?.isAdmin || false;
        
        if (isAdmin && updates.email) {
          console.log("Updating admin email in environment system");
          const { adminPassword } = getAdminCredentials();
          // Update the admin email in our environment system
          setAdminCredentials(updates.email, adminPassword);
        }
      } catch (adminError) {
        console.error("Error checking for admin status:", adminError);
      }
      
      // Call the database update method
      const success = await databaseService.updateUserProfile(userId, updates);
      
      // If database update failed but localStorage update worked,
      // still consider it a success for the user experience
      return success || localStorageUpdated;
    } catch (error) {
      console.error('Error in userService.updateProfile:', error);
      // Return true if localStorage update was successful as a fallback
      try {
        return localStorageService.updateUser(userId, updates);
      } catch (localError) {
        console.error("Error in localStorage fallback:", localError);
        return false;
      }
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
      
      // Find the user first - try localStorage for simplicity
      let user = localStorageService.findUserById(userId);
      
      // If not found in localStorage, try database
      if (!user) {
        console.log(`User ${userId} not found in localStorage, checking database`);
        user = await databaseService.findUserById(userId);
      }
      
      if (!user) {
        console.error(`User ${userId} not found`);
        throw new Error("User not found");
      }
      
      // Verify current password
      if (user.password !== currentPassword) {
        console.error("Current password is incorrect");
        throw new Error("Current password is incorrect");
      }
      
      // Enforce password requirements
      if (newPassword.length < 6) {
        console.error("Password must be at least 6 characters");
        throw new Error("Password must be at least 6 characters");
      }
      
      // Update password in localStorage as fallback
      let localStorageUpdated = false;
      try {
        localStorageUpdated = localStorageService.updateUser(userId, { password: newPassword });
        console.log(`LocalStorage password update result: ${localStorageUpdated ? 'success' : 'failed'}`);
      } catch (localError) {
        console.error("Error updating password in localStorage:", localError);
      }
      
      // Update password in database - need to pass it as an object with password property
      const updates = { password: newPassword };
      let success = await databaseService.updateUserProfile(userId, updates);
      
      // If admin, update admin password in environment system
      if ((success || localStorageUpdated) && user.isAdmin) {
        try {
          const { adminEmail } = getAdminCredentials();
          setAdminCredentials(adminEmail, newPassword);
          console.log(`Updated admin password for ${adminEmail} in environment system`);
        } catch (adminError) {
          console.error("Error updating admin credentials:", adminError);
        }
      }
      
      return success || localStorageUpdated;
    } catch (error) {
      console.error('Error in userService.changePassword:', error);
      throw error;
    }
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
    const updates = {
      password: newPassword,
      resetCode: undefined
    } as any;
    
    const success = await databaseService.updateUserProfile(user.id, updates);
    
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
