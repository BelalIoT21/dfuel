
import { User, Booking } from '../types/database';

class LocalStorageService {
  private storageKey = 'learnit_db';
  
  // Get all users from localStorage
  getAllUsers(): User[] {
    const db = this.getDatabase();
    return db.users || [];
  }
  
  // Get all users without sensitive information
  getAllUsersWithoutSensitiveInfo() {
    return this.getAllUsers().map(user => {
      const { password, resetCode, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
  
  // Find user by email
  findUserByEmail(email: string): User | undefined {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  // Find user by ID
  findUserById(id: string): User | undefined {
    const users = this.getAllUsers();
    return users.find(user => user.id === id || user._id === id);
  }
  
  // Add new user
  addUser(user: User): boolean {
    const db = this.getDatabase();
    
    // Ensure users array exists
    if (!db.users) db.users = [];
    
    // Check if user already exists
    if (db.users.some(existingUser => existingUser.email === user.email)) {
      return false;
    }
    
    // Add user
    db.users.push(user);
    this.saveDatabase(db);
    return true;
  }
  
  // Update user
  updateUser(userId: string, updates: Partial<User>): boolean {
    const db = this.getDatabase();
    if (!db.users) return false;
    
    // Find user index
    const userIndex = db.users.findIndex(user => user.id === userId || user._id === userId);
    if (userIndex === -1) return false;
    
    // Update user
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    this.saveDatabase(db);
    return true;
  }
  
  // Delete user
  deleteUser(userId: string): boolean {
    const db = this.getDatabase();
    if (!db.users) return false;
    
    // Store initial length
    const initialLength = db.users.length;
    
    // Filter out the user to be deleted
    db.users = db.users.filter(user => user.id !== userId && user._id !== userId);
    
    // Check if user was deleted
    if (db.users.length < initialLength) {
      this.saveDatabase(db);
      return true;
    }
    
    return false;
  }
  
  // Private methods for database operations
  private getDatabase(): any {
    const dbString = localStorage.getItem(this.storageKey);
    if (!dbString) return { users: [] };
    
    try {
      return JSON.parse(dbString);
    } catch (error) {
      console.error('Error parsing database from localStorage:', error);
      return { users: [] };
    }
  }
  
  private saveDatabase(db: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }
}

// Create a singleton instance
export const localStorageService = new LocalStorageService();
