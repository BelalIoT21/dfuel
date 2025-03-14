
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
}

// Initial users including the admin
const initialUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@machinemaster.com',
    password: 'admin123', // In a real app, this would be hashed
    name: 'Administrator',
    isAdmin: true,
    certifications: ['laser-cutter', 'ultimaker', 'safety-cabinet', 'carbon-3d', 'bambu-lab'],
    bookings: [],
    lastLogin: new Date().toISOString(),
  }
];

// In a real app, this would be a database. Here we use localStorage.
class UserDatabase {
  private users: User[];
  
  constructor() {
    this.loadUsers();
    // Initialize with default admin if no users exist
    if (this.users.length === 0) {
      this.users = [...initialUsers];
      this.saveUsers();
    }
  }
  
  private loadUsers(): void {
    const storedUsers = localStorage.getItem('machinemaster_users');
    this.users = storedUsers ? JSON.parse(storedUsers) : [];
  }
  
  private saveUsers(): void {
    localStorage.setItem('machinemaster_users', JSON.stringify(this.users));
  }
  
  // Get all users (for admin)
  getAllUsers(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...user }) => user);
  }
  
  // Find user by email
  findUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  // Authenticate user
  authenticate(email: string, password: string): Omit<User, 'password'> | null {
    const user = this.findUserByEmail(email);
    if (user && user.password === password) {
      // Update last login time
      user.lastLogin = new Date().toISOString();
      this.saveUsers();
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
  
  // Register new user
  registerUser(email: string, password: string, name: string): Omit<User, 'password'> | null {
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
    
    const { password: _, ...userWithoutPassword } = newUser;
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
    if (updates.email) this.users[userIndex].email = updates.email;
    
    this.saveUsers();
    return true;
  }
}

// Create a singleton instance
const userDatabase = new UserDatabase();
export default userDatabase;
