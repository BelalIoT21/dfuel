
import { userDatabaseService } from './database/userService';
import { certificationDatabaseService } from './database/certificationService';
import { bookingDatabaseService } from './database/bookingService';
import { machineDatabaseService } from './database/machineService';
import { User, UserWithoutSensitiveInfo } from '../types/database';

/**
 * This service handles all database operations, delegating to specialized services.
 * It maintains the same API as the original monolithic service for backward compatibility.
 */
class DatabaseService {
  // User methods
  async getAllUsers(): Promise<UserWithoutSensitiveInfo[]> {
    return userDatabaseService.getAllUsers();
  }
  
  async findUserByEmail(email: string): Promise<User | undefined> {
    return userDatabaseService.findUserByEmail(email);
  }
  
  async findUserById(id: string): Promise<User | undefined> {
    return userDatabaseService.findUserById(id);
  }
  
  async authenticate(email: string, password: string): Promise<UserWithoutSensitiveInfo | null> {
    return userDatabaseService.authenticate(email, password);
  }
  
  async registerUser(email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> {
    return userDatabaseService.registerUser(email, password, name);
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string, password?: string}): Promise<boolean> {
    return userDatabaseService.updateUserProfile(userId, updates);
  }
  
  // Certification methods
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    return certificationDatabaseService.addCertification(userId, machineId);
  }
  
  // Booking methods
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    return bookingDatabaseService.addBooking(userId, machineId, date, time);
  }
  
  async getUserBookings(userId: string) {
    return bookingDatabaseService.getUserBookings(userId);
  }
  
  // Machine methods
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    return machineDatabaseService.updateMachineStatus(machineId, status, note);
  }
  
  async getMachineStatus(machineId: string): Promise<string> {
    return machineDatabaseService.getMachineStatus(machineId);
  }
}

// Create a singleton instance
const databaseService = new DatabaseService();
export default databaseService;
