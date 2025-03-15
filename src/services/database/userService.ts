
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
    } catch (error) {
      console.error("API error, falling back to localStorage auth:", error);
    }
    
    // Fallback to localStorage
    console.log("Falling back to localStorage authentication");
    const user = localStorageService.findUserByEmail(email);
    if (user && user.password === password) {
      console.log("LocalStorage authentication successful");
      // Update last login time
      user.lastLogin = new Date().toISOString();
      localStorageService.updateUser(user.id, { lastLogin: user.lastLogin });
      
      const { password: _, resetCode: __, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } else {
      console.log("LocalStorage authentication failed");
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
    } catch (error) {
      console.error("API error, falling back to localStorage registration:", error);
    }
    
    // Fallback to localStorage
    console.log("Falling back to localStorage registration");
    // Check if user already exists
    const existingUser = localStorageService.findUserByEmail(email);
    if (existingUser) {
      console.log("User already exists in localStorage");
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
    
    localStorageService.addUser(newUser);
    console.log("User added to localStorage");
    
    const { password: _, resetCode: __, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
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
