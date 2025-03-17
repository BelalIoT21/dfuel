
import { Collection } from 'mongodb';
import { MongoBooking } from './types';
import mongoConnectionService from './connectionService';
import { machineService } from '../machineService';
import userDatabase from '../userDatabase';

class MongoBookingService {
  private bookingsCollection: Collection<MongoBooking> | null = null;
  
  async initCollection(): Promise<void> {
    try {
      if (!this.bookingsCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.bookingsCollection = db.collection<MongoBooking>('bookings');
          console.log("MongoDB Bookings collection initialized successfully");
        } else {
          console.error("Failed to connect to MongoDB database");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB bookings collection:", error);
    }
  }
  
  async getBookings(): Promise<MongoBooking[]> {
    await this.initCollection();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return [];
    }
    
    try {
      const bookings = await this.bookingsCollection.find().toArray();
      console.log(`Retrieved ${bookings.length} bookings from MongoDB`);
      return bookings;
    } catch (error) {
      console.error("Error getting bookings from MongoDB:", error);
      return [];
    }
  }
  
  async getBookingsByUserId(userId: string): Promise<MongoBooking[]> {
    await this.initCollection();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return [];
    }
    
    try {
      const bookings = await this.bookingsCollection.find({ userId }).toArray();
      console.log(`Retrieved ${bookings.length} bookings for user ${userId} from MongoDB`);
      return bookings;
    } catch (error) {
      console.error("Error getting user bookings from MongoDB:", error);
      return [];
    }
  }
  
  async createBooking(userId: string, machineId: string, date: string, time: string, userName: string = '', machineName: string = ''): Promise<boolean> {
    await this.initCollection();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      console.log(`Creating booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
      
      // Get userName if not provided
      if (!userName) {
        try {
          const user = await userDatabase.getUserById(userId);
          if (user) {
            userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
            console.log(`Found user name: ${userName}`);
          }
        } catch (userError) {
          console.error("Error getting user name for booking:", userError);
        }
      }
      
      // Get machineName if not provided
      if (!machineName) {
        try {
          const machine = await machineService.getMachineById(machineId);
          if (machine) {
            machineName = machine.name || '';
            console.log(`Found machine name: ${machineName}`);
          }
        } catch (machineError) {
          console.error("Error getting machine name for booking:", machineError);
        }
      }
      
      const booking: MongoBooking = {
        userId,
        userName: userName || 'Unknown User',
        machineId,
        machineName: machineName || `Machine ${machineId}`,
        date,
        time,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await this.bookingsCollection.insertOne(booking);
      console.log(`Booking created result: ${result.acknowledged}`);
      return result.acknowledged;
    } catch (error) {
      console.error("Error creating booking in MongoDB:", error);
      return false;
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    await this.initCollection();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      console.log(`Updating booking ${bookingId} status to ${status}`);
      const result = await this.bookingsCollection.updateOne(
        { _id: bookingId },
        { $set: { status, updatedAt: new Date() } }
      );
      
      console.log(`Booking status update result: ${result.acknowledged}`);
      return result.acknowledged && result.modifiedCount > 0;
    } catch (error) {
      console.error("Error updating booking status in MongoDB:", error);
      return false;
    }
  }
  
  async deleteBooking(bookingId: string): Promise<boolean> {
    await this.initCollection();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      console.log(`Deleting booking ${bookingId}`);
      const result = await this.bookingsCollection.deleteOne({ _id: bookingId });
      console.log(`Booking deletion result: ${result.acknowledged}`);
      return result.acknowledged && result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting booking in MongoDB:", error);
      return false;
    }
  }
}

const mongoBookingService = new MongoBookingService();
export default mongoBookingService;
