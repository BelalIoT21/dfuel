
import { User, MachineStatus } from '../types/database';
import { getAdminCredentials } from '../utils/adminCredentials';

// Initial users including the admin
const { adminEmail, adminPassword } = getAdminCredentials();

const initialUsers: User[] = [
  {
    id: 'admin-1',
    email: adminEmail,
    password: adminPassword, // In a real app, this would be hashed
    name: 'Administrator',
    isAdmin: true,
    certifications: ['1', '2', '3', '4', '5'],
    bookings: [],
    lastLogin: new Date().toISOString(),
  }
];

export class LocalStorageService {
  private users: User[] = [];
  private machineStatuses: {[key: string]: {status: string, note?: string}} = {};
  
  constructor() {
    this.loadUsers();
    this.loadMachineStatuses();
    
    // If no users exist, initialize with admin
    if (this.users.length === 0) {
      // Get the most up-to-date admin credentials
      const { adminEmail, adminPassword } = getAdminCredentials();
      
      const adminUser = {
        ...initialUsers[0],
        email: adminEmail,
        password: adminPassword
      };
      
      this.users = [adminUser];
      this.saveUsers();
    }
  }
  
  // User operations
  loadUsers(): void {
    const storedUsers = localStorage.getItem('learnit_users');
    this.users = storedUsers ? JSON.parse(storedUsers) : [];
  }
  
  saveUsers(): void {
    localStorage.setItem('learnit_users', JSON.stringify(this.users));
  }
  
  getUsers(): User[] {
    return this.users;
  }
  
  findUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  findUserById(userId: string): User | undefined {
    return this.users.find(user => user.id === userId);
  }
  
  addUser(user: User): User | null {
    // Check if user already exists
    const existingUser = this.findUserByEmail(user.email);
    if (existingUser) {
      return null;
    }
    
    this.users.push(user);
    this.saveUsers();
    return user;
  }
  
  updateUser(userId: string, updates: Partial<User>): boolean {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers();
    return true;
  }
  
  // Certification operations
  addCertification(userId: string, machineId: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    if (!this.users[userIndex].certifications.includes(machineId)) {
      this.users[userIndex].certifications.push(machineId);
      this.saveUsers();
    }
    return true;
  }
  
  // Booking operations
  addBooking(userId: string, booking: any): boolean {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    this.users[userIndex].bookings.push(booking);
    this.saveUsers();
    return true;
  }
  
  getUserBookings(userId: string): any[] {
    const user = this.users.find(user => user.id === userId);
    return user ? user.bookings : [];
  }
  
  // Machine status operations
  loadMachineStatuses(): void {
    const statuses = localStorage.getItem('learnit_machine_statuses');
    this.machineStatuses = statuses ? JSON.parse(statuses) : {};
  }
  
  saveMachineStatuses(): void {
    localStorage.setItem('learnit_machine_statuses', JSON.stringify(this.machineStatuses));
  }
  
  getMachineStatus(machineId: string): string {
    return this.machineStatuses[machineId]?.status || 'available';
  }
  
  getMachineMaintenanceNote(machineId: string): string | undefined {
    return this.machineStatuses[machineId]?.note;
  }
  
  updateMachineStatus(machineId: string, status: string, note?: string): boolean {
    this.machineStatuses[machineId] = { status, note };
    this.saveMachineStatuses();
    return true;
  }
}

// Create a singleton instance
export const localStorageService = new LocalStorageService();

