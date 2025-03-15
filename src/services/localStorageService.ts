import { User, UserWithoutSensitiveInfo } from '../types/database';
import { toast } from '@/components/ui/use-toast';

const USERS_KEY = 'learnit_users';
const BOOKINGS_KEY = 'learnit_bookings';
const MACHINE_STATUSES_KEY = 'learnit_machine_statuses';

class LocalStorageService {
  // User methods
  getAllUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users from localStorage:', error);
      return [];
    }
  }

  getAllUsersWithoutSensitiveInfo(): UserWithoutSensitiveInfo[] {
    const users = this.getAllUsers();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      certifications: user.certifications,
      bookings: user.bookings,
      lastLogin: user.lastLogin
    }));
  }

  findUserByEmail(email: string): User | undefined {
    try {
      const users = this.getAllUsers();
      return users.find(user => user.email === email);
    } catch (error) {
      console.error('Error finding user by email in localStorage:', error);
      return undefined;
    }
  }

  findUserById(id: string): User | undefined {
    try {
      const users = this.getAllUsers();
      return users.find(user => user.id === id);
    } catch (error) {
      console.error('Error finding user by id in localStorage:', error);
      return undefined;
    }
  }

  addUser(user: User): boolean {
    try {
      const users = this.getAllUsers();
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
        console.error(`User with id ${id} not found in localStorage`);
        return false;
      }

      // Merge existing user with updates
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error updating user in localStorage:', error);
      return false;
    }
  }

  removeUser(id: string): boolean {
    try {
      let users = this.getAllUsers();
      users = users.filter(user => user.id !== id);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
      return false;
    }
  }
  
  // Certification methods
  addCertification(userId: string, machineId: string): boolean {
    try {
      const user = this.findUserById(userId);
      if (!user) return false;
      
      if (!user.certifications.includes(machineId)) {
        user.certifications.push(machineId);
        return this.updateUser(userId, { certifications: user.certifications });
      }
      
      return true; // Already certified
    } catch (error) {
      console.error('Error in localStorage.addCertification:', error);
      return false;
    }
  }
  
  // Booking methods
  getBookings(): any[] {
    try {
      const bookingsJson = localStorage.getItem(BOOKINGS_KEY);
      return bookingsJson ? JSON.parse(bookingsJson) : [];
    } catch (error) {
      console.error('Error getting bookings from localStorage:', error);
      return [];
    }
  }
  
  saveBookings(bookings: any[]): boolean {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
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
  
  // Machine status methods
  getMachineStatus(machineId: string): string | null {
    try {
      const statusesJson = localStorage.getItem(MACHINE_STATUSES_KEY);
      const statuses = statusesJson ? JSON.parse(statusesJson) : {};
      return statuses[machineId] || null;
    } catch (error) {
      console.error('Error getting machine status from localStorage:', error);
      return null;
    }
  }

  updateMachineStatus(machineId: string, status: string): boolean {
    try {
      const statusesJson = localStorage.getItem(MACHINE_STATUSES_KEY);
      const statuses = statusesJson ? JSON.parse(statusesJson) : {};
      statuses[machineId] = status;
      localStorage.setItem(MACHINE_STATUSES_KEY, JSON.stringify(statuses));
      return true;
    } catch (error) {
      console.error('Error updating machine status in localStorage:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const localStorageService = new LocalStorageService();
