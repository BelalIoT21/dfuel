
// Facade for all database services
import { userService } from './userService';
import databaseService from './databaseService';

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
    return databaseService.addCertification(userId, machineId);
  }
  
  // Safety course methods
  async addSafetyCourse(userId: string, courseId: string) {
    return databaseService.addSafetyCourse(userId, courseId);
  }
  
  // Booking methods
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return databaseService.addBooking(userId, machineId, date, time);
  }
  
  async getUserBookings(userId: string) {
    const user = await databaseService.findUserById(userId);
    return user?.bookings || [];
  }
  
  // Machine methods
  async updateMachineStatus(machineId: string, status: string, note?: string) {
    return databaseService.updateMachineStatus(machineId, status, note);
  }
  
  async getMachineStatus(machineId: string) {
    return databaseService.getMachineStatus(machineId);
  }
  
  async getMachineMaintenanceNote(machineId: string) {
    // This functionality would be in the API
    return null;
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
