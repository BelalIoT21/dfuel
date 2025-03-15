import { User, Booking, MachineStatus, UserWithoutSensitiveInfo } from '../types/database';
import { userKey, bookingsKey, machineStatusKey } from '../utils/storage';

class LocalStorageService {
  // User operations
  
  getAllUsers(): User[] {
    const storedData = localStorage.getItem(userKey);
    return storedData ? JSON.parse(storedData) : [];
  }
  
  getAllUsersWithoutSensitiveInfo(): UserWithoutSensitiveInfo[] {
    const users = this.getAllUsers();
    return users.map(({ password, resetCode, ...rest }) => rest);
  }
  
  findUserByEmail(email: string): User | undefined {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  findUserById(id: string): User | undefined {
    const users = this.getAllUsers();
    return users.find(user => user.id === id);
  }
  
  addUser(user: User): boolean {
    try {
      const users = this.getAllUsers();
      
      // Check if user with same email already exists
      if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        return false;
      }
      
      users.push(user);
      localStorage.setItem(userKey, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error adding user to localStorage:', error);
      return false;
    }
  }
  
  updateUser(id: string, updates: Partial<User>): boolean {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return false;
      }
      
      // Apply updates to user
      users[userIndex] = { ...users[userIndex], ...updates };
      
      localStorage.setItem(userKey, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
      return false;
    }
  }
  
  deleteUser(id: string): boolean {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return false;
      }
      
      // Check if user is admin, don't allow deletion
      if (users[userIndex].isAdmin) {
        return false;
      }
      
      // Remove user
      users.splice(userIndex, 1);
      
      localStorage.setItem(userKey, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error deleting user from localStorage:', error);
      return false;
    }
  }
  
  getBookings(): any[] {
    try {
      const bookingsJson = localStorage.getItem(bookingsKey);
      return bookingsJson ? JSON.parse(bookingsJson) : [];
    } catch (error) {
      console.error('Error getting bookings from localStorage:', error);
      return [];
    }
  }
  
  saveBookings(bookings: any[]): boolean {
    try {
      localStorage.setItem(bookingsKey, JSON.stringify(bookings));
      return true;
    } catch (error) {
      console.error('Error saving bookings to localStorage:', error);
      return false;
    }
  }
  
  updateBookingStatus(bookingId: string, status: string): boolean {
    try {
      const bookings = this.getBookings();
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      
      if (bookingIndex === -1) {
        console.error(`Booking ${bookingId} not found in localStorage`);
        return false;
      }
      
      bookings[bookingIndex].status = status;
      return this.saveBookings(bookings);
    } catch (error) {
      console.error('Error updating booking status in localStorage:', error);
      return false;
    }
  }
  
  getMachineStatus(machineId: string): string | null {
    try {
      const statusesJson = localStorage.getItem(machineStatusKey);
      const statuses = statusesJson ? JSON.parse(statusesJson) : {};
      return statuses[machineId] || null;
    } catch (error) {
      console.error('Error getting machine status from localStorage:', error);
      return null;
    }
  }
  
  updateMachineStatus(machineId: string, status: string): boolean {
    try {
      const statusesJson = localStorage.getItem(machineStatusKey);
      const statuses = statusesJson ? JSON.parse(statusesJson) : {};
      statuses[machineId] = status;
      localStorage.setItem(machineStatusKey, JSON.stringify(statuses));
      return true;
    } catch (error) {
      console.error('Error updating machine status in localStorage:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const localStorageService = new LocalStorageService();
