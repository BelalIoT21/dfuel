import { Collection } from 'mongodb';
import mongoose from 'mongoose';
import { Booking } from '../../../server/src/models/Booking';
import { User } from '../../../server/src/models/User';
import { Machine } from '../../../server/src/models/Machine';
import mongoConnectionService from './connectionService';
import { MongoBooking } from './types';

class MongoBookingService {
  private bookingsCollection: Collection | null = null;
  private usersCollection: Collection | null = null;
  private machinesCollection: Collection | null = null;
  
  async initCollections(): Promise<void> {
    try {
      if (!this.bookingsCollection || !this.usersCollection || !this.machinesCollection) {
        const db = await mongoConnectionService.connect();
        if (db) {
          this.bookingsCollection = db.collection('bookings');
          this.usersCollection = db.collection('users');
          this.machinesCollection = db.collection('machines');
          
          console.log('MongoDB Collections initialized for bookings service');
        } else {
          console.error("Failed to connect to MongoDB database");
        }
      }
    } catch (error) {
      console.error("Error initializing MongoDB collections:", error);
    }
  }
  
  async getAllBookings(): Promise<any[]> {
    await this.initCollections();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return [];
    }
    
    try {
      // Find all bookings
      const bookings = await this.bookingsCollection.find().toArray();
      
      // Enrich bookings with user and machine information
      const enrichedBookings = await this.enrichBookingsWithDetails(bookings);
      
      console.log(`Retrieved ${bookings.length} bookings from MongoDB`);
      return enrichedBookings;
    } catch (error) {
      console.error("Error getting all bookings from MongoDB:", error);
      return [];
    }
  }
  
  async getUserBookings(userId: string): Promise<any[]> {
    await this.initCollections();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return [];
    }
    
    try {
      // Convert string ID to ObjectId if needed
      let userIdQuery = userId;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userIdQuery = new mongoose.Types.ObjectId(userId);
      }
      
      // Find bookings for the user
      const bookings = await this.bookingsCollection.find({ 
        user: userIdQuery 
      }).toArray();
      
      // Enrich bookings with user and machine information
      const enrichedBookings = await this.enrichBookingsWithDetails(bookings);
      
      console.log(`Retrieved ${bookings.length} bookings for user ${userId} from MongoDB`);
      return enrichedBookings;
    } catch (error) {
      console.error(`Error getting bookings for user ${userId} from MongoDB:`, error);
      return [];
    }
  }
  
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    await this.initCollections();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      // Get user and machine details
      const user = await this.usersCollection?.findOne({ _id: userId });
      const machine = await this.machinesCollection?.findOne({ _id: machineId });
      
      if (!user) {
        console.error(`User ${userId} not found`);
        return false;
      }
      
      if (!machine) {
        console.error(`Machine ${machineId} not found`);
        return false;
      }
      
      // Create client-side ID for easier reference
      const clientId = `booking-${Date.now()}`;
      
      // Create booking object
      const booking: MongoBooking = {
        user: userId,
        machine: machineId,
        date: new Date(date),
        time,
        status: 'Pending',
        clientId,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add user and machine details
        userName: user.name || 'Unknown User',
        machineName: machine.name || 'Unknown Machine',
      };
      
      // Insert booking
      const result = await this.bookingsCollection.insertOne(booking);
      
      console.log(`Booking created with ID: ${result.insertedId}`);
      return result.acknowledged;
    } catch (error) {
      console.error("Error creating booking in MongoDB:", error);
      return false;
    }
  }
  
  async deleteBooking(bookingId: string): Promise<boolean> {
    await this.initCollections();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      let result;
      
      // Try to find by MongoDB ID first
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        result = await this.bookingsCollection.deleteOne({ _id: new mongoose.Types.ObjectId(bookingId) });
      } else {
        // If not a valid ObjectId, it might be a client-generated ID
        result = await this.bookingsCollection.deleteOne({ clientId: bookingId });
      }
      
      console.log(`Booking deleted: ${result.deletedCount > 0}`);
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting booking ${bookingId} from MongoDB:`, error);
      return false;
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    await this.initCollections();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      let result;
      
      // Try to find by MongoDB ID first
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        result = await this.bookingsCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(bookingId) },
          { $set: { status, updatedAt: new Date() } }
        );
      } else {
        // If not a valid ObjectId, it might be a client-generated ID
        result = await this.bookingsCollection.updateOne(
          { clientId: bookingId },
          { $set: { status, updatedAt: new Date() } }
        );
      }
      
      console.log(`Booking status updated: ${result.modifiedCount > 0}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status in MongoDB:`, error);
      return false;
    }
  }
  
  // Helper method to enrich bookings with user and machine details
  private async enrichBookingsWithDetails(bookings: any[]): Promise<any[]> {
    if (!this.usersCollection || !this.machinesCollection) {
      return bookings;
    }
    
    const enrichedBookings = [];
    
    for (const booking of bookings) {
      try {
        // If booking already has userName and machineName, use those
        if (booking.userName && booking.machineName) {
          enrichedBookings.push({
            ...booking,
            id: booking._id.toString(), // Add id field for client compatibility
          });
          continue;
        }
        
        let userId = booking.user;
        let machineId = booking.machine;
        
        // Convert string IDs to ObjectId if needed
        if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
          userId = new mongoose.Types.ObjectId(userId);
        }
        
        if (typeof machineId === 'string' && mongoose.Types.ObjectId.isValid(machineId)) {
          machineId = new mongoose.Types.ObjectId(machineId);
        }
        
        // Get user and machine details
        const user = await this.usersCollection.findOne({ _id: userId });
        const machine = await this.machinesCollection.findOne({ _id: machineId });
        
        // Add user and machine details to booking
        enrichedBookings.push({
          ...booking,
          id: booking._id.toString(), // Add id field for client compatibility
          userName: user?.name || 'Unknown User',
          machineName: machine?.name || 'Unknown Machine',
        });
      } catch (error) {
        console.error("Error enriching booking with details:", error);
        enrichedBookings.push({
          ...booking,
          id: booking._id.toString(), // Add id field for client compatibility
        });
      }
    }
    
    return enrichedBookings;
  }
}

const mongoBookingService = new MongoBookingService();
export default mongoBookingService;
