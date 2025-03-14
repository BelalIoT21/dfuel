
import { User, UserWithoutSensitiveInfo } from '../types/database';
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { getAdminCredentials, setAdminCredentials } from '../utils/adminCredentials';

export class UserService {
  // Get all users (for admin)
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    try {
      // Try to get users from MongoDB first
      const mongoUsers = await mongoDbService.getUsers();
      if (mongoUsers.length > 0) {
        return mongoUsers.map(({ password, resetCode, ...user }) => user) as any[];
      }
    } catch (error) {
      console.error("Error getting users from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.getUsers().map(({ password, resetCode, ...user }) => user);
  }
  
  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Try to get user from MongoDB first
      const mongoUser = await mongoDbService.getUserByEmail(email);
      if (mongoUser) {
        return mongoUser as unknown as User;
      }
    } catch (error) {
      console.error("Error finding user by email in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.findUserByEmail(email);
  }
  
  // Authenticate user
  async authenticate(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      const user = await this.findUserByEmail(email);
      if (user && user.password === password) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        
        // Update in MongoDB
        try {
          await mongoDbService.updateUser(user.id, { lastLogin: user.lastLogin });
        } catch (error) {
          console.error("Error updating user lastLogin in MongoDB:", error);
          // Fall back to localStorage
          localStorageService.updateUser(user.id, { lastLogin: user.lastLogin });
        }
        
        const { password, resetCode, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    } catch (error) {
      console.error("Error authenticating user:", error);
    }
    return null;
  }
  
  // Register new user
  async registerUser(email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      return null;
    }
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      isAdmin: false,
      certifications: [],
      bookings: [],
      lastLogin: new Date().toISOString(),
    };
    
    try {
      // Add user to MongoDB
      const createdUser = await mongoDbService.createUser(newUser as any);
      if (!createdUser) {
        // MongoDB failed, use localStorage
        localStorageService.addUser(newUser);
      }
    } catch (error) {
      console.error("Error registering user in MongoDB:", error);
      // MongoDB failed, use localStorage
      localStorageService.addUser(newUser);
    }
    
    const { password: _, resetCode: __, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  
  // Update user profile
  async updateUserProfile(userId: string, updates: {name?: string, email?: string}): Promise<boolean> {
    try {
      // Check if user is admin
      const user = localStorageService.findUserById(userId);
      if (user?.isAdmin && updates.email) {
        const { adminPassword } = getAdminCredentials();
        setAdminCredentials(updates.email, adminPassword);
      }
      
      // Try to update in MongoDB first
      const success = await mongoDbService.updateUser(userId, updates);
      if (success) return true;
    } catch (error) {
      console.error("Error updating user profile in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.updateUser(userId, updates);
  }

  // Change user password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = localStorageService.findUserById(userId);
    if (!user) return false;
    
    // Verify current password
    if (user.password !== currentPassword) return false;
    
    // Enforce password requirements
    if (newPassword.length < 6) return false;
    
    // Update password in MongoDB
    try {
      const success = await mongoDbService.updateUser(userId, { password: newPassword });
      if (!success) {
        // MongoDB failed, update localStorage
        localStorageService.updateUser(userId, { password: newPassword });
      }
    } catch (error) {
      console.error("Error changing password in MongoDB:", error);
      // MongoDB failed, update localStorage
      localStorageService.updateUser(userId, { password: newPassword });
    }
    
    // If admin, update admin password in "environment"
    if (user.isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    return true;
  }
  
  // Request password reset
  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    if (!user) return false;
    
    // Generate a simple 6-digit code (in a real app, this would be more secure)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Code expires in 1 hour
    
    const resetCodeObj = {
      code: resetCode,
      expiry: expiry.toISOString()
    };
    
    try {
      // Update in MongoDB
      const success = await mongoDbService.updateUser(user.id, { resetCode: resetCodeObj });
      if (!success) {
        // MongoDB failed, update localStorage
        localStorageService.updateUser(user.id, { resetCode: resetCodeObj });
      }
    } catch (error) {
      console.error("Error requesting password reset in MongoDB:", error);
      // MongoDB failed, update localStorage
      localStorageService.updateUser(user.id, { resetCode: resetCodeObj });
    }
    
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
    
    return true;
  }

  // Reset password with code
  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    if (!user) return false;
    
    // Check if reset code exists and is valid
    if (!user.resetCode) return false;
    
    if (user.resetCode.code !== resetCode) return false;
    
    // Check if code is expired
    if (new Date() > new Date(user.resetCode.expiry)) return false;
    
    // Enforce password requirements
    if (newPassword.length < 6) return false;
    
    // Update password and clear reset code
    try {
      // Update in MongoDB
      const success = await mongoDbService.updateUser(user.id, { 
        password: newPassword,
        resetCode: undefined 
      });
      
      if (!success) {
        // MongoDB failed, update localStorage
        localStorageService.updateUser(user.id, {
          password: newPassword,
          resetCode: undefined
        });
      }
    } catch (error) {
      console.error("Error resetting password in MongoDB:", error);
      // MongoDB failed, update localStorage
      localStorageService.updateUser(user.id, {
        password: newPassword,
        resetCode: undefined
      });
    }
    
    // If admin, update admin password in "environment"
    if (user.isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    return true;
  }
}

// Create a singleton instance
export const userService = new UserService();

