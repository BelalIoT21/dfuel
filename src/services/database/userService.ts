import { User, UserWithoutSensitiveInfo } from '../../types/database';
import databaseService from '../databaseService';
import { getAdminCredentials, setAdminCredentials } from '../../utils/adminCredentials';
import { BaseService } from './baseService';
import { localStorageService } from '../localStorageService';
import { isWeb } from '../../utils/platform';
import mongoDbService from '../mongoDbService';
import { apiService } from '../apiService';

export class UserDatabaseService extends BaseService {
  private usersStorageKey = 'learnit_users';

  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    try {
      const usersData = await localStorageService.getItem(this.usersStorageKey) || '[]';
      const users: User[] = JSON.parse(usersData);
      return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        certifications: user.certifications,
        bookings: user.bookings,
        lastLogin: user.lastLogin
      }));
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      // First try API
      try {
        const response = await apiService.getUserByEmail(email);
        if (response.data) {
          return response.data;
        }
      } catch (apiError) {
        console.error("API error when finding user by email:", apiError);
      }
      
      // Fallback to localStorage
      const usersData = await localStorageService.getItem(this.usersStorageKey) || '[]';
      const users: User[] = JSON.parse(usersData);
      return users.find(user => user.email === email);
    } catch (error) {
      console.error("Error finding user by email:", error);
      return undefined;
    }
  }

  async findUserById(id: string) {
    try {
      // First try MongoDB if not in web environment
      if (!isWeb) {
        try {
          const mongoUser = await mongoDbService.getUserById(id);
          if (mongoUser) {
            return mongoUser;
          }
        } catch (mongoError) {
          console.error("MongoDB error when finding user by ID:", mongoError);
        }
      }
      
      // Try API
      try {
        const response = await apiService.getUserById(id);
        if (response.data) {
          return response.data;
        }
      } catch (apiError) {
        console.error("API error when finding user by ID:", apiError);
      }
      
      // Fallback to localStorage
      const usersData = await localStorageService.getItem(this.usersStorageKey) || '[]';
      const users = JSON.parse(usersData);
      return users.find((user: User) => user.id === id);
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async authenticate(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      const user = await this.findUserByEmail(email);
      if (user && user.password === password) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          certifications: user.certifications,
          bookings: user.bookings,
          lastLogin: user.lastLogin
        };
      }
      return null;
    } catch (error) {
      console.error("Error authenticating user:", error);
      return null;
    }
  }

  async registerUser(email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      if (await this.findUserByEmail(email)) {
        console.log("Email already in use:", email);
        return null;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
        isAdmin: false,
        certifications: [],
        bookings: [],
        lastLogin: new Date().toISOString(),
        resetCode: undefined
      };

      const usersData = await localStorageService.getItem(this.usersStorageKey) || '[]';
      const users: User[] = JSON.parse(usersData);
      users.push(newUser);

      await localStorageService.setItem(this.usersStorageKey, JSON.stringify(users));

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        certifications: newUser.certifications,
        bookings: newUser.bookings,
        lastLogin: newUser.lastLogin
      };
    } catch (error) {
      console.error("Error registering user:", error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: {name?: string, email?: string}): Promise<boolean> {
    try {
      const user = await this.findUserById(userId);
      if (!user) return false;

      const updatedUser = { ...user, ...updates };

      const usersData = await localStorageService.getItem(this.usersStorageKey) || '[]';
      const users: User[] = JSON.parse(usersData);
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex] = updatedUser;
      await localStorageService.setItem(this.usersStorageKey, JSON.stringify(users));

      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  }

  async updateUser(userId: string, updatedUser: User): Promise<boolean> {
    try {
      const usersData = await localStorageService.getItem(this.usersStorageKey) || '[]';
      const users: User[] = JSON.parse(usersData);
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) return false;

      users[userIndex] = updatedUser;
      await localStorageService.setItem(this.usersStorageKey, JSON.stringify(users));

      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  }

  // Update a user's booking status
  async updateBookingStatus(userId: string, bookingId: string, status: string): Promise<boolean> {
    try {
      // Get the user
      const user = await this.findUserById(userId);
      if (!user) {
        console.error("User not found when updating booking status");
        return false;
      }
      
      // Find the booking
      const bookingIndex = user.bookings?.findIndex((b: any) => b.id === bookingId);
      if (bookingIndex === undefined || bookingIndex === -1) {
        console.error("Booking not found when updating status");
        return false;
      }
      
      // Update the booking status
      user.bookings[bookingIndex].status = status;
      
      // Save the updated user
      const success = await this.updateUser(userId, user);
      return success;
    } catch (error) {
      console.error("Error updating booking status:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const userDatabaseService = new UserDatabaseService();
