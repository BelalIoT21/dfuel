
import { apiService } from './apiService';
import { localStorageService } from './localStorageService';
import { User, UserWithoutSensitiveInfo, MachineStatus } from '../types/database';

/**
 * This service handles all database operations, using either the API (preferred)
 * or falling back to localStorage when offline
 */
class DatabaseService {
  // User methods
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    try {
      const response = await apiService.getAllUsers();
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("API error, falling back to localStorage:", error);
    }
    
    // Fallback to localStorage
    return localStorageService.getUsers().map(({ password, resetCode, ...user }) => user);
  }
  
  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      const response = await apiService.getUserByEmail(email);
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("API error, falling back to localStorage:", error);
    }
    
    // Fallback to localStorage
    return localStorageService.findUserByEmail(email);
  }
  
  async findUserById(id: string): Promise<User | undefined> {
    try {
      const response = await apiService.getUserById(id);
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("API error, falling back to localStorage:", error);
    }
    
    // Fallback to localStorage
    return localStorageService.findUserById(id);
  }
  
  async authenticate(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      const response = await apiService.login(email, password);
      if (response.data && response.data.user) {
        return response.data.user;
      }
    } catch (error) {
      console.error("API error, falling back to localStorage auth:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserByEmail(email);
      if (user && user.password === password) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        localStorageService.updateUser(user.id, { lastLogin: user.lastLogin });
        
        const { password: _, resetCode: __, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }
    
    return null;
  }
  
  async registerUser(email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> {
    try {
      const response = await apiService.register(email, password, name);
      if (response.data && response.data.user) {
        return response.data.user;
      }
    } catch (error) {
      console.error("API error, falling back to localStorage registration:", error);
      
      // Fallback to localStorage
      // Check if user already exists
      const existingUser = localStorageService.findUserByEmail(email);
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
      
      localStorageService.addUser(newUser);
      
      const { password: _, resetCode: __, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }
    
    return null;
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string}): Promise<boolean> {
    try {
      const response = await apiService.updateProfile(userId, updates);
      return response.success || false;
    } catch (error) {
      console.error("API error, falling back to localStorage update:", error);
      // Fallback to localStorage
      return localStorageService.updateUser(userId, updates);
    }
  }
  
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      const response = await apiService.addCertification(userId, machineId);
      return response.success || false;
    } catch (error) {
      console.error("API error, falling back to localStorage certification:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      if (!user.certifications.includes(machineId)) {
        user.certifications.push(machineId);
        return localStorageService.updateUser(userId, { certifications: user.certifications });
      }
      
      return true; // Already certified
    }
  }
  
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      const response = await apiService.addBooking(userId, machineId, date, time);
      return response.success || false;
    } catch (error) {
      console.error("API error, falling back to localStorage booking:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      const booking = {
        id: `booking-${Date.now()}`,
        machineId,
        date,
        time,
        status: 'Pending' as const
      };
      
      user.bookings.push(booking);
      return localStorageService.updateUser(userId, { bookings: user.bookings });
    }
  }
  
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      const response = await apiService.getMachineStatus(machineId);
      if (response.data && response.data.status) {
        return response.data.status;
      }
    } catch (error) {
      console.error("API error, using default machine status:", error);
    }
    
    // Default to available if API fails
    return 'available';
  }
  
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      const response = await apiService.updateMachineStatus(machineId, status, note);
      return response.success || false;
    } catch (error) {
      console.error("API error, could not update machine status:", error);
      return false;
    }
  }
}

const databaseService = new DatabaseService();
export default databaseService;
