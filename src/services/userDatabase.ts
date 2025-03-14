
// Facade for all database services
import { userService } from './userService';
import { certificationService } from './certificationService';
import { bookingService } from './bookingService';
import { machineService } from './machineService';

class UserDatabase {
  // User methods
  async getAllUsers() {
    return userService.getAllUsers();
  }
  
  async findUserByEmail(email: string) {
    return userService.findUserByEmail(email);
  }
  
  async authenticate(email: string, password: string) {
    return userService.authenticate(email, password);
  }
  
  async registerUser(email: string, password: string, name: string) {
    return userService.registerUser(email, password, name);
  }
  
  async updateUserProfile(userId: string, updates: {name?: string, email?: string}) {
    return userService.updateUserProfile(userId, updates);
  }
  
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return userService.changePassword(userId, currentPassword, newPassword);
  }
  
  async requestPasswordReset(email: string) {
    return userService.requestPasswordReset(email);
  }
  
  async resetPassword(email: string, resetCode: string, newPassword: string) {
    return userService.resetPassword(email, resetCode, newPassword);
  }
  
  // Certification methods
  async addCertification(userId: string, machineId: string) {
    return certificationService.addCertification(userId, machineId);
  }
  
  // Booking methods
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return bookingService.addBooking(userId, machineId, date, time);
  }
  
  async getUserBookings(userId: string) {
    return bookingService.getUserBookings(userId);
  }
  
  // Machine methods
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return machineService.updateMachineStatus(machineId, status, note);
  }
  
  async getMachineStatus(machineId: string) {
    return machineService.getMachineStatus(machineId);
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    return machineService.getMachineMaintenanceNote(machineId);
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;

