import { User, UserWithoutSensitiveInfo } from '@/types/database';
import { storage } from '@/utils/storage';

// In-memory user database for offline mode
const users: User[] = [
  {
    id: "admin-offline",
    _id: "admin-offline",
    name: "Administrator",
    email: "admin@learnit.com",
    password: "admin123",
    isAdmin: true,
    certifications: ["1", "2", "3", "4", "5", "6"],
    bookings: [],
    lastLogin: new Date().toISOString()
  }
];

/**
 * User database service for managing users in local storage
 */
const userDatabase = {
  /**
   * Get all users (without sensitive information)
   */
  getAllUsersWithoutSensitiveInfo: async (): Promise<UserWithoutSensitiveInfo[]> => {
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users };
    
    return db.users.map(({ password, resetCode, ...user }: User) => user);
  },
  
  /**
   * Find a user by email
   */
  findUserByEmail: async (email: string): Promise<User | undefined> => {
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users };
    
    return db.users.find((user: User) => user.email.toLowerCase() === email.toLowerCase());
  },
  
  /**
   * Authenticate a user
   */
  authenticate: async (email: string, password: string): Promise<UserWithoutSensitiveInfo | null> => {
    console.log("Authenticating user:", email);
    
    // First check predefined users
    const predefinedUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (predefinedUser) {
      console.log("Found predefined user:", predefinedUser.email);
      const { password, resetCode, ...userWithoutPassword } = predefinedUser;
      return userWithoutPassword;
    }
    
    // Then check stored users
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users: [] };
    
    const user = db.users.find((u: User) => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (user) {
      console.log("Found stored user:", user.email);
      // Update last login
      user.lastLogin = new Date().toISOString();
      await storage.setItem('userDb', JSON.stringify(db));
      
      const { password, resetCode, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    console.log("Authentication failed");
    return null;
  },
  
  /**
   * Register a new user
   */
  registerUser: async (email: string, password: string, name: string): Promise<UserWithoutSensitiveInfo | null> => {
    // Check predefined users first
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      console.log("User already exists in predefined users");
      return null;
    }
    
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users: [] };
    
    // Check if user already exists
    if (db.users.some((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
      console.log("User already exists in database");
      return null;
    }
    
    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      _id: `user-${Date.now()}`,
      email,
      password,
      name,
      isAdmin: false,
      certifications: [],
      bookings: [],
      lastLogin: new Date().toISOString(),
    };
    
    // Add to database
    db.users.push(newUser);
    await storage.setItem('userDb', JSON.stringify(db));
    
    // Return without sensitive info
    const { password: _, resetCode, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
  
  /**
   * Add certification to user
   */
  addCertification: async (userId: string, machineId: string): Promise<boolean> => {
    // Always succeed for admin users
    if (userId === "admin-offline") {
      console.log("Admin user already has all certifications");
      return true;
    }
    
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users: [] };
    
    const userIndex = db.users.findIndex((u: User) => u.id === userId);
    if (userIndex === -1) {
      console.log("User not found");
      return false;
    }
    
    // Add certification if not already present
    if (!db.users[userIndex].certifications) {
      db.users[userIndex].certifications = [];
    }
    
    if (!db.users[userIndex].certifications.includes(machineId)) {
      db.users[userIndex].certifications.push(machineId);
      await storage.setItem('userDb', JSON.stringify(db));
    }
    
    return true;
  },
  
  /**
   * Update user profile
   */
  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<boolean> => {
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users: [] };
    
    const userIndex = db.users.findIndex((u: User) => u.id === userId);
    if (userIndex === -1) {
      console.log("User not found");
      return false;
    }
    
    // Update user
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    await storage.setItem('userDb', JSON.stringify(db));
    
    return true;
  },
  
  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<boolean> => {
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users: [] };
    
    const userIndex = db.users.findIndex((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      console.log("User not found");
      return false;
    }
    
    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    
    db.users[userIndex].resetCode = {
      code: resetCode,
      expiry: expiry.toISOString()
    };
    
    await storage.setItem('userDb', JSON.stringify(db));
    
    // In a real app, this would send an email
    console.log(`
==== Password Reset Email ====
To: ${email}
Subject: Learnit Password Reset

Dear ${db.users[userIndex].name},

We received a request to reset your password for your Learnit account.

Your password reset code is: ${resetCode}

This code will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact our support team if you have any concerns.

Thank you,
The Learnit Team
==========================
    `);
    
    return true;
  },
  
  /**
   * Reset password
   */
  resetPassword: async (email: string, resetCode: string, newPassword: string): Promise<boolean> => {
    const dbString = await storage.getItem('userDb');
    const db = dbString ? JSON.parse(dbString) : { users: [] };
    
    const userIndex = db.users.findIndex((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      console.log("User not found");
      return false;
    }
    
    if (!db.users[userIndex].resetCode || db.users[userIndex].resetCode?.code !== resetCode) {
      console.log("Invalid reset code");
      return false;
    }
    
    if (new Date() > new Date(db.users[userIndex].resetCode.expiry)) {
      console.log("Reset code expired");
      return false;
    }
    
    // Update password and clear reset code
    db.users[userIndex].password = newPassword;
    db.users[userIndex].resetCode = undefined;
    
    await storage.setItem('userDb', JSON.stringify(db));
    
    return true;
  }
};

export default userDatabase;
