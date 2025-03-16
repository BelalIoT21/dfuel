
import { apiService } from '../apiService';
import { User, UserWithoutSensitiveInfo } from '../../types/database';
import { BaseService } from './baseService';

/**
 * Service that handles all user-related database operations.
 */
export class UserDatabaseService extends BaseService {
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    try {
      const response = await apiService.getAllUsers();
      if (response.data) {
        return response.data;
      }
      console.error("API returned no data for getAllUsers");
      return [];
    } catch (error) {
      console.error("API error in getAllUsers:", error);
      return [];
    }
  }
  
  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      const response = await apiService.getUserByEmail(email);
      return response.data;
    } catch (error) {
      console.error("API error in findUserByEmail:", error);
      return undefined;
    }
  }
  
  async findUserById(id: string): Promise<User | undefined> {
    try {
      const response = await apiService.getUserById(id);
      return response.data;
    } catch (error) {
      console.error("API error in findUserById:", error);
      return undefined;
    }
  }
  
  async authenticate(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      console.log("Authenticating via API:", email);
      const response = await apiService.login(email, password);
      if (response.data && response.data.user) {
        console.log("API authentication successful");
        // Store the token for future API requests
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error("API authentication error:", error);
      return null;
    }
  }
  
  async registerUser(email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      console.log("Registering via API:", email);
      const response = await apiService.register({ email, password, name });
      if (response.data && response.data.user) {
        console.log("API registration successful");
        // Store the token for future API requests
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error("API registration error:", error);
      return null;
    }
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string, password?: string}): Promise<boolean> {
    try {
      const response = await apiService.updateProfile(userId, updates);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error updating profile:", error);
      return false;
    }
  }
  
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await apiService.requestPasswordReset(email);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error requesting password reset:", error);
      return false;
    }
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<boolean> {
    try {
      const response = await apiService.resetPassword(email, resetCode, newPassword);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error resetting password:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const userDatabaseService = new UserDatabaseService();
