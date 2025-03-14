// Simulated user database service with MongoDB integration
import mongoDbService, { MongoUser } from './mongoDbService';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  certifications: string[];
  bookings: {
    id: string;
    machineId: string;
    date: string;
    time: string;
    status: 'Pending' | 'Approved' | 'Completed' | 'Canceled';
  }[];
  lastLogin: string;
  resetCode?: {
    code: string;
    expiry: string;
  };
}

// Get admin credentials from environment
const getAdminCredentials = () => {
  // In a real app, this would come from process.env
  // Using localStorage to simulate .env for this demo
  const adminEmail = localStorage.getItem('ADMIN_EMAIL') || 'admin@learnit.com';
  const adminPassword = localStorage.getItem('ADMIN_PASSWORD') || 'admin123';
  
  return { adminEmail, adminPassword };
};

// Set admin credentials
const setAdminCredentials = (email: string, password: string) => {
  localStorage.setItem('ADMIN_EMAIL', email);
  localStorage.setItem('ADMIN_PASSWORD', password);
};

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

class UserDatabase {
  private users: User[];
  private machineStatuses: {[key: string]: {status: string, note?: string}} = {};
  private initialized: boolean = false;
  
  constructor() {
    this.users = [];
    this.initializeDatabase();
  }
  
  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Try to get users from MongoDB
      const mongoUsers = await mongoDbService.getUsers();
      
      // If MongoDB has users, use them
      if (mongoUsers.length > 0) {
        this.users = mongoUsers as unknown as User[];
      } else {
        // Otherwise, load from localStorage or use initialUsers
        this.loadUsers();
        
        // If still no users, initialize with default admin
        if (this.users.length === 0) {
          this.users = [...initialUsers];
          
          // Save default admin to MongoDB
          for (const user of initialUsers) {
            await mongoDbService.createUser(user as unknown as MongoUser);
          }
        }
      }
      
      // Load machine statuses
      this.loadMachineStatuses();
      
      this.initialized = true;
    } catch (error) {
      console.error("Error initializing database:", error);
      // Fallback to localStorage
      this.loadUsers();
      this.loadMachineStatuses();
      this.initialized = true;
    }
  }
  
  private loadUsers(): void {
    const storedUsers = localStorage.getItem('learnit_users');
    this.users = storedUsers ? JSON.parse(storedUsers) : [];
  }
  
  private saveUsers(): void {
    localStorage.setItem('learnit_users', JSON.stringify(this.users));
  }
  
  private loadMachineStatuses(): void {
    const statuses = localStorage.getItem('learnit_machine_statuses');
    this.machineStatuses = statuses ? JSON.parse(statuses) : {};
  }
  
  private saveMachineStatuses(): void {
    localStorage.setItem('learnit_machine_statuses', JSON.stringify(this.machineStatuses));
  }
  
  // Get all users (for admin)
  async getAllUsers(): Promise<Omit<User, 'password' | 'resetCode'>[]> {
    await this.initializeDatabase();
    
    try {
      // Try to get users from MongoDB first
      const mongoUsers = await mongoDbService.getUsers();
      if (mongoUsers.length > 0) {
        return mongoUsers.map(({ password, resetCode, ...user }) => user) as any[];
      }
    } catch (error) {
      console.error("Error getting users from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return this.users.map(({ password, resetCode, ...user }) => user);
  }
  
  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    await this.initializeDatabase();
    
    try {
      // Try to get user from MongoDB first
      const mongoUser = await mongoDbService.getUserByEmail(email);
      if (mongoUser) {
        return mongoUser as unknown as User;
      }
    } catch (error) {
      console.error("Error finding user by email in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  // Authenticate user
  async authenticate(email: string, password: string): Promise<Omit<User, 'password' | 'resetCode'> | null> {
    try {
      const user = await this.findUserByEmail(email);
      if (user && user.password === password) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        
        // Update in MongoDB
        try {
          await mongoDbService.updateUser(user.id, { lastLogin: user.lastLogin });
        } catch (error) {
          console.error("Error updating user lastLogin in MongoDB:", error);
          // Fall back to localStorage
          this.saveUsers();
        }
        
        const { password, resetCode, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    } catch (error) {
      console.error("Error authenticating user:", error);
    }
    return null;
  }
  
  // Register new user
  async registerUser(email: string, password: string, name: string): Promise<Omit<User, 'password' | 'resetCode'> | null> {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
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
    
    try {
      // Add user to MongoDB
      const createdUser = await mongoDbService.createUser(newUser as unknown as MongoUser);
      if (!createdUser) {
        // MongoDB failed, use localStorage
        this.users.push(newUser);
        this.saveUsers();
      }
    } catch (error) {
      console.error("Error registering user in MongoDB:", error);
      // MongoDB failed, use localStorage
      this.users.push(newUser);
      this.saveUsers();
    }
    
    const { password: _, resetCode: __, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  
  // Update user certifications
  async addCertification(userId: string, machineId: string): Promise<boolean> {
    try {
      // Try to update in MongoDB first
      const success = await mongoDbService.updateUserCertifications(userId, machineId);
      if (success) return true;
    } catch (error) {
      console.error("Error adding certification in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    if (!this.users[userIndex].certifications.includes(machineId)) {
      this.users[userIndex].certifications.push(machineId);
      this.saveUsers();
    }
    return true;
  }
  
  // Add a booking
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    const booking = {
      id: `booking-${Date.now()}`,
      machineId,
      date,
      time,
      status: 'Pending' as const
    };
    
    try {
      // Try to add booking in MongoDB first
      const success = await mongoDbService.addUserBooking(userId, booking);
      if (success) return true;
    } catch (error) {
      console.error("Error adding booking in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    this.users[userIndex].bookings.push(booking);
    this.saveUsers();
    return true;
  }
  
  // Get user bookings
  async getUserBookings(userId: string) {
    try {
      // Try to get user from MongoDB first
      const mongoUser = await mongoDbService.getUserById(userId);
      if (mongoUser) {
        return mongoUser.bookings;
      }
    } catch (error) {
      console.error("Error getting user bookings from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    const user = this.users.find(user => user.id === userId);
    return user ? user.bookings : [];
  }
  
  // Update user profile
  async updateUserProfile(userId: string, updates: {name?: string, email?: string}): Promise<boolean> {
    try {
      // Check if user is admin
      const user = this.users.find(user => user.id === userId);
      if (user?.isAdmin && updates.email) {
        const { adminPassword } = getAdminCredentials();
        setAdminCredentials(updates.email, adminPassword);
      }
      
      // Try to update in MongoDB first
      const success = await mongoDbService.updateUser(userId, updates);
      if (success) return true;
    } catch (error) {
      console.error("Error updating user profile in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    if (updates.name) this.users[userIndex].name = updates.name;
    
    if (updates.email) {
      // Check if user is admin and update admin email in "environment"
      if (this.users[userIndex].isAdmin) {
        const { adminPassword } = getAdminCredentials();
        setAdminCredentials(updates.email, adminPassword);
      }
      
      this.users[userIndex].email = updates.email;
    }
    
    this.saveUsers();
    return true;
  }

  // Change user password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    // Verify current password
    if (this.users[userIndex].password !== currentPassword) return false;
    
    // Enforce password requirements
    if (newPassword.length < 6) return false;
    
    // Update password in MongoDB
    try {
      const success = await mongoDbService.updateUser(userId, { password: newPassword });
      if (!success) {
        // MongoDB failed, update localStorage
        this.users[userIndex].password = newPassword;
        this.saveUsers();
      }
    } catch (error) {
      console.error("Error changing password in MongoDB:", error);
      // MongoDB failed, update localStorage
      this.users[userIndex].password = newPassword;
      this.saveUsers();
    }
    
    // If admin, update admin password in "environment"
    if (this.users[userIndex].isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    return true;
  }

  // Update machine status
  async updateMachineStatus(machineId: string, status: string, note?: string): Promise<boolean> {
    try {
      // Try to update in MongoDB first
      const success = await mongoDbService.updateMachineStatus(machineId, status, note);
      if (success) return true;
    } catch (error) {
      console.error("Error updating machine status in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    this.machineStatuses[machineId] = { status, note };
    this.saveMachineStatuses();
    return true;
  }

  // Get machine status
  async getMachineStatus(machineId: string): Promise<string> {
    try {
      // Try to get from MongoDB first
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        return status.status;
      }
    } catch (error) {
      console.error("Error getting machine status from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return this.machineStatuses[machineId]?.status || 'available';
  }
  
  // Get machine maintenance note
  async getMachineMaintenanceNote(machineId: string): Promise<string | undefined> {
    try {
      // Try to get from MongoDB first
      const status = await mongoDbService.getMachineStatus(machineId);
      if (status) {
        return status.note;
      }
    } catch (error) {
      console.error("Error getting machine maintenance note from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return this.machineStatuses[machineId]?.note;
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) return false;
    
    // Generate a simple 6-digit code (in a real app, this would be more secure)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Code expires in 1 hour
    
    const resetCodeObj = {
      code: resetCode,
      expiry: expiry.toISOString()
    };
    
    try {
      // Update in MongoDB
      const success = await mongoDbService.updateUser(this.users[userIndex].id, { resetCode: resetCodeObj });
      if (!success) {
        // MongoDB failed, update localStorage
        this.users[userIndex].resetCode = resetCodeObj;
        this.saveUsers();
      }
    } catch (error) {
      console.error("Error requesting password reset in MongoDB:", error);
      // MongoDB failed, update localStorage
      this.users[userIndex].resetCode = resetCodeObj;
      this.saveUsers();
    }
    
    // In a real app, this would send an email
    console.log(`
==== Password Reset Email ====
To: ${email}
Subject: Learnit Password Reset

Dear ${this.users[userIndex].name},

We received a request to reset your password for your Learnit account.

Your password reset code is: ${resetCode}

This code will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.

Thank you,
The Learnit Team
==========================
    `);
    
    return true;
  }

  // Reset password with code
  async resetPassword(email: string, resetCode: string, newPassword: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) return false;
    
    const user = this.users[userIndex];
    
    // Check if reset code exists and is valid
    if (!user.resetCode) return false;
    
    if (user.resetCode.code !== resetCode) return false;
    
    // Check if code is expired
    if (new Date() > new Date(user.resetCode.expiry)) return false;
    
    // Enforce password requirements
    if (newPassword.length < 6) return false;
    
    // Update password and clear reset code
    try {
      // Update in MongoDB
      const success = await mongoDbService.updateUser(user.id, { 
        password: newPassword,
        resetCode: undefined 
      });
      
      if (!success) {
        // MongoDB failed, update localStorage
        user.password = newPassword;
        user.resetCode = undefined;
        this.saveUsers();
      }
    } catch (error) {
      console.error("Error resetting password in MongoDB:", error);
      // MongoDB failed, update localStorage
      user.password = newPassword;
      user.resetCode = undefined;
      this.saveUsers();
    }
    
    // If admin, update admin password in "environment"
    if (user.isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    return true;
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
