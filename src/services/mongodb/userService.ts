
import { Collection } from 'mongodb';
import { MongoUser } from './types';
import mongoConnectionService from './connectionService';

class MongoUserService {
  private usersCollection: Collection<MongoUser> | null = null;
  
  async initCollection(): Promise<void> {
    if (!this.usersCollection) {
      const db = await mongoConnectionService.connect();
      if (db) {
        this.usersCollection = db.collection<MongoUser>('users');
        // Create indexes for faster queries
        await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      }
    }
  }
  
  async getUsers(): Promise<MongoUser[]> {
    await this.initCollection();
    if (!this.usersCollection) return [];
    
    try {
      return await this.usersCollection.find().toArray();
    } catch (error) {
      console.error("Error getting users from MongoDB:", error);
      return [];
    }
  }
  
  async getUserByEmail(email: string): Promise<MongoUser | null> {
    await this.initCollection();
    if (!this.usersCollection) return null;
    
    try {
      return await this.usersCollection.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error("Error getting user by email from MongoDB:", error);
      return null;
    }
  }
  
  async getUserById(id: string): Promise<MongoUser | null> {
    await this.initCollection();
    if (!this.usersCollection) return null;
    
    try {
      return await this.usersCollection.findOne({ id });
    } catch (error) {
      console.error("Error getting user by ID from MongoDB:", error);
      return null;
    }
  }
  
  async createUser(user: MongoUser): Promise<MongoUser | null> {
    await this.initCollection();
    if (!this.usersCollection) return null;
    
    try {
      // Check if user with this email already exists
      const existingUser = await this.getUserByEmail(user.email);
      if (existingUser) return null;
      
      await this.usersCollection.insertOne(user);
      return user;
    } catch (error) {
      console.error("Error creating user in MongoDB:", error);
      return null;
    }
  }
  
  async updateUser(id: string, updates: Partial<MongoUser>): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    
    try {
      const result = await this.usersCollection.updateOne(
        { id },
        { $set: updates }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error updating user in MongoDB:", error);
      return false;
    }
  }
  
  async deleteUser(id: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    
    try {
      // First check if user exists and is not an admin
      const user = await this.getUserById(id);
      if (!user) return false;
      
      if (user.isAdmin) {
        console.error("Cannot delete admin user");
        return false;
      }
      
      const result = await this.usersCollection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting user in MongoDB:", error);
      return false;
    }
  }
  
  async updateUserCertifications(userId: string, machineId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;
      
      // Special handling for Machine Safety Course (ID: 6) and special users
      const isSpecialUser = userId === "user-1741957466063" || (user.email && user.email.includes("b.l.mishmish"));
      const isSafetyCourse = machineId === "6";
      
      if (isSafetyCourse && isSpecialUser) {
        console.log(`Special handling for user ${userId} with Safety Course certification`);
        // Clear all certifications first
        const clearResult = await this.usersCollection.updateOne(
          { id: userId },
          { $set: { certifications: [] } }
        );
        
        // Then add just the safety course
        const addResult = await this.usersCollection.updateOne(
          { id: userId },
          { $push: { certifications: machineId } }
        );
        
        return clearResult.modifiedCount > 0 || addResult.modifiedCount > 0;
      }
      
      // Normal handling for other cases
      if (!user.certifications.includes(machineId)) {
        const result = await this.usersCollection.updateOne(
          { id: userId },
          { $push: { certifications: machineId } }
        );
        
        return result.modifiedCount > 0;
      }
      
      return true; // Certification already exists
    } catch (error) {
      console.error("Error updating user certifications in MongoDB:", error);
      return false;
    }
  }
  
  async addUserBooking(userId: string, booking: any): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    
    try {
      const result = await this.usersCollection.updateOne(
        { id: userId },
        { $push: { bookings: booking } }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error adding user booking in MongoDB:", error);
      return false;
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    
    try {
      console.log(`Attempting to update booking ${bookingId} to status ${status} in MongoDB`);
      
      // Find the user with this booking
      const user = await this.usersCollection.findOne({
        "bookings.id": bookingId
      });
      
      if (!user) {
        console.error(`No user found with booking ${bookingId}`);
        return false;
      }
      
      // Update the booking status
      const result = await this.usersCollection.updateOne(
        { "bookings.id": bookingId },
        { $set: { "bookings.$.status": status } }
      );
      
      console.log(`MongoDB update result: ${JSON.stringify(result)}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error updating booking status in MongoDB:", error);
      return false;
    }
  }
  
  async deleteUserBooking(bookingId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.usersCollection) return false;
    
    try {
      console.log(`Attempting to delete booking ${bookingId} from user's bookings in MongoDB`);
      
      // Find the user with this booking
      const user = await this.usersCollection.findOne({
        "bookings.id": bookingId
      });
      
      if (!user) {
        console.error(`No user found with booking ${bookingId}`);
        return false;
      }
      
      // Remove the booking from the user's bookings array
      const result = await this.usersCollection.updateOne(
        { "bookings.id": bookingId },
        { $pull: { bookings: { id: bookingId } } }
      );
      
      console.log(`MongoDB delete booking result: ${JSON.stringify(result)}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error deleting booking in MongoDB:", error);
      return false;
    }
  }
  
  // Clear all bookings for all users (admin only)
  async clearAllUserBookings(): Promise<number> {
    await this.initCollection();
    if (!this.usersCollection) return 0;
    
    try {
      console.log("Attempting to clear all bookings for all users in MongoDB");
      
      // Get all users
      const users = await this.getUsers();
      let totalCleared = 0;
      
      // Clear bookings for each user
      for (const user of users) {
        if (user.bookings && user.bookings.length > 0) {
          const result = await this.usersCollection.updateOne(
            { id: user.id },
            { $set: { bookings: [] } }
          );
          
          if (result.modifiedCount > 0) {
            totalCleared += user.bookings.length;
            console.log(`Cleared ${user.bookings.length} bookings for user ${user.id}`);
          }
        }
      }
      
      console.log(`Total bookings cleared: ${totalCleared}`);
      return totalCleared;
    } catch (error) {
      console.error("Error clearing all user bookings in MongoDB:", error);
      return 0;
    }
  }
}

// Create a singleton instance
const mongoUserService = new MongoUserService();
export default mongoUserService;
