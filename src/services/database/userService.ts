
import { apiService } from '../apiService';
import { User, UserWithoutSensitiveInfo } from '../../types/database';
import { BaseService } from './baseService';

/**
 * Service that handles all user-related database operations.
 */
export class UserDatabaseService extends BaseService {
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    return this.apiRequest<UserWithoutSensitiveInfo[]>(
      () => apiService.getAllUsers(),
      "API error in getAllUsers"
    ) || [];
  }
  
  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.apiRequest<User>(
      () => apiService.getUserByEmail(email),
      "API error in findUserByEmail"
    );
  }
  
  async findUserById(id: string): Promise<User | undefined> {
    return this.apiRequest<User>(
      () => apiService.getUserById(id),
      "API error in findUserById"
    );
  }
  
  async authenticate(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      console.log("Authenticating via API:", email);
      const response = await apiService.login(email, password);
      
      if (response.data?.data?.user) {
        console.log("API authentication successful");
        
        // Store the token for future API requests
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          apiService.setToken(response.data.data.token);
        }
        
        return response.data.data.user;
      }
      
      console.log("API authentication failed - invalid response format");
      return null;
    } catch (error) {
      console.error("API error in authentication:", error);
      return null;
    }
  }
  
  async registerUser(email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      console.log("Registering via API:", email);
      const response = await apiService.register({ email, password, name });
      
      if (response.data?.data?.user) {
        console.log("API registration successful");
        
        // Store the token for future API requests
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          apiService.setToken(response.data.data.token);
        }
        
        return response.data.data.user;
      }
      
      console.log("API registration failed - invalid response format");
      return null;
    } catch (error) {
      console.error("API error in registration:", error);
      return null;
    }
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string, password?: string, currentPassword?: string}): Promise<boolean> {
    try {
      const response = await apiService.updateProfile(userId, updates);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error in updateUserProfile:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const userDatabaseService = new UserDatabaseService();
