import { apiService } from '../apiService';
import { localStorageService } from '../localStorageService';
import { User, UserWithoutSensitiveInfo } from '../../types/database';
import { BaseService } from './baseService';

/**
 * Service that handles all user-related database operations.
 */
export class UserDatabaseService extends BaseService {
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    return this.apiRequest<UserWithoutSensitiveInfo[]>(
      () => apiService.getAllUsers(),
      () => localStorageService.getAllUsersWithoutSensitiveInfo(),
      "API error in getAllUsers"
    ) || [];
  }
  
  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.apiRequest<User>(
      () => apiService.getUserByEmail(email),
      () => localStorageService.findUserByEmail(email),
      "API error in findUserByEmail"
    );
  }
  
  async findUserById(id: string): Promise<User | undefined> {
    return this.apiRequest<User>(
      () => apiService.getUserById(id),
      () => localStorageService.findUserById(id),
      "API error in findUserById"
    );
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
      
      if (response.error) {
        console.error("API authentication error:", response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("API error during authentication:", error);
      throw error; // Propagate the error instead of falling back to localStorage
    }
    
    return null;
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
      
      if (response.error) {
        console.error("API registration error:", response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("API error during registration:", error);
      throw error; // Propagate the error instead of falling back to localStorage
    }
    
    return null;
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string, password?: string}): Promise<boolean> {
    try {
      const response = await apiService.updateProfile(userId, updates);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, falling back to localStorage update:", error);
      // Fallback to localStorage
      return localStorageService.updateUser(userId, updates);
    }
  }
}

// Create a singleton instance
export const userDatabaseService = new UserDatabaseService();
