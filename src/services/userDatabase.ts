
// Simulated user database service
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

// In a real app, this would be a database. Here we use localStorage.
class UserDatabase {
  private users: User[];
  private machineStatuses: {[key: string]: {status: string, note?: string}} = {};
  
  constructor() {
    this.loadUsers();
    this.loadMachineStatuses();
    
    // Initialize with default admin if no users exist
    if (this.users.length === 0) {
      this.users = [...initialUsers];
      this.saveUsers();
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
  getAllUsers(): Omit<User, 'password' | 'resetCode'>[] {
    return this.users.map(({ password, resetCode, ...user }) => user);
  }
  
  // Find user by email
  findUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  // Authenticate user
  authenticate(email: string, password: string): Omit<User, 'password' | 'resetCode'> | null {
    const user = this.findUserByEmail(email);
    if (user && user.password === password) {
      // Update last login time
      user.lastLogin = new Date().toISOString();
      this.saveUsers();
      const { password, resetCode, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
  
  // Register new user
  registerUser(email: string, password: string, name: string): Omit<User, 'password' | 'resetCode'> | null {
    // Check if user already exists
    if (this.findUserByEmail(email)) {
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
    
    this.users.push(newUser);
    this.saveUsers();
    
    const { password: _, resetCode: __, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  
  // Update user certifications
  addCertification(userId: string, machineId: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    if (!this.users[userIndex].certifications.includes(machineId)) {
      this.users[userIndex].certifications.push(machineId);
      this.saveUsers();
    }
    return true;
  }
  
  // Add a booking
  addBooking(userId: string, machineId: string, date: string, time: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    const booking = {
      id: `booking-${Date.now()}`,
      machineId,
      date,
      time,
      status: 'Pending' as const
    };
    
    this.users[userIndex].bookings.push(booking);
    this.saveUsers();
    return true;
  }
  
  // Get user bookings
  getUserBookings(userId: string) {
    const user = this.users.find(user => user.id === userId);
    return user ? user.bookings : [];
  }
  
  // Update user profile
  updateUserProfile(userId: string, updates: {name?: string, email?: string}): boolean {
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
  changePassword(userId: string, currentPassword: string, newPassword: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return false;
    
    // Verify current password
    if (this.users[userIndex].password !== currentPassword) return false;
    
    // Enforce password requirements
    if (newPassword.length < 6) return false;
    
    // Update password
    this.users[userIndex].password = newPassword;
    
    // If admin, update admin password in "environment"
    if (this.users[userIndex].isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    this.saveUsers();
    return true;
  }

  // Update machine status
  updateMachineStatus(machineId: string, status: string, note?: string): boolean {
    this.machineStatuses[machineId] = { status, note };
    this.saveMachineStatuses();
    return true;
  }

  // Get machine status
  getMachineStatus(machineId: string): string {
    return this.machineStatuses[machineId]?.status || 'available';
  }
  
  // Get machine maintenance note
  getMachineMaintenanceNote(machineId: string): string | undefined {
    return this.machineStatuses[machineId]?.note;
  }

  // Request password reset
  requestPasswordReset(email: string): boolean {
    const userIndex = this.users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) return false;
    
    // Generate a simple 6-digit code (in a real app, this would be more secure)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Code expires in 1 hour
    
    this.users[userIndex].resetCode = {
      code: resetCode,
      expiry: expiry.toISOString()
    };
    
    this.saveUsers();
    
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
  resetPassword(email: string, resetCode: string, newPassword: string): boolean {
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
    user.password = newPassword;
    user.resetCode = undefined;
    
    // If admin, update admin password in "environment"
    if (user.isAdmin) {
      const { adminEmail } = getAdminCredentials();
      setAdminCredentials(adminEmail, newPassword);
    }
    
    this.saveUsers();
    return true;
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
