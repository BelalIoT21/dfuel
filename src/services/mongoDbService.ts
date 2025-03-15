
import { apiService } from './apiService';
import { User } from '@/types/database';

// Static user data for fallback when server is not reachable
const fallbackUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@learnit.com',
    isAdmin: true,
    certifications: ['Safety Course', 'Laser Cutter', 'X1 E Carbon 3D Printer']
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    isAdmin: false,
    certifications: ['Safety Course']
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    isAdmin: false,
    certifications: ['Safety Course', 'Laser Cutter']
  }
];

class MongoDbService {
  private cachedUserCount: number | null = null;
  private lastFetchTime: number = 0;
  private cacheExpiryMs: number = 30000; // 30 seconds cache

  constructor() {
    console.log('MongoDbService initialized');
  }
  
  /**
   * Get user count from MongoDB
   * Uses a caching mechanism to reduce API calls
   */
  async getUserCount(): Promise<number> {
    try {
      const now = Date.now();
      
      // Use cached value if it exists and hasn't expired
      if (this.cachedUserCount !== null && (now - this.lastFetchTime) < this.cacheExpiryMs) {
        console.log(`Using cached MongoDB user count: ${this.cachedUserCount}`);
        return this.cachedUserCount;
      }
      
      console.log('Fetching MongoDB user count...');
      
      // Try the health endpoint first
      const healthResponse = await fetch('http://localhost:4000/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
      
      if (healthResponse && healthResponse.mongodb && typeof healthResponse.mongodb.userCount === 'number') {
        const count = healthResponse.mongodb.userCount;
        console.log(`MongoDB user count from health endpoint: ${count}`);
        this.cachedUserCount = count;
        this.lastFetchTime = now;
        return count;
      }
      
      // Try the API service as backup
      const response = await apiService.ping();
      if (response.data && response.data.mongodb && typeof response.data.mongodb.userCount === 'number') {
        const count = response.data.mongodb.userCount;
        console.log(`MongoDB user count from API ping: ${count}`);
        this.cachedUserCount = count;
        this.lastFetchTime = now;
        return count;
      }
      
      // If both attempts fail, try to get all users and count them
      const usersResponse = await apiService.getAllUsers();
      if (usersResponse.data && Array.isArray(usersResponse.data)) {
        const count = usersResponse.data.length;
        console.log(`MongoDB user count from getAllUsers: ${count}`);
        this.cachedUserCount = count;
        this.lastFetchTime = now;
        return count;
      }
      
      // Fallback to static data if all attempts fail
      console.log('Using fallback user count: ', fallbackUsers.length);
      this.cachedUserCount = fallbackUsers.length;
      this.lastFetchTime = now;
      return fallbackUsers.length;
      
    } catch (error) {
      console.error('Error getting MongoDB user count:', error);
      
      // Return fallback count if there's an error
      if (this.cachedUserCount !== null) {
        console.log(`Using last cached user count: ${this.cachedUserCount}`);
        return this.cachedUserCount;
      }
      
      console.log('Using fallback user count: ', fallbackUsers.length);
      return fallbackUsers.length;
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiService.getAllUsers();
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Fallback to static data
      console.log('Using fallback user data');
      return fallbackUsers as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return fallbackUsers as User[];
    }
  }
  
  // Add more MongoDB service methods as needed
}

const mongoDbService = new MongoDbService();
export default mongoDbService;
