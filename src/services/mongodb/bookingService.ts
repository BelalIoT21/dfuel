
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
      const bookings = await this.bookingsCollection.find().toArray();
      
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
      let userIdQuery = userId;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userIdQuery = new mongoose.Types.ObjectId(userId);
      }
      
      const bookings = await this.bookingsCollection.find({ 
        user: userIdQuery 
      }).toArray();
      
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
    if (!this.bookingsCollection || !this.usersCollection || !this.machinesCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      console.log(`Creating booking with userId: ${userId} (${typeof userId}), machineId: ${machineId} (${typeof machineId}), date: ${date}, time: ${time}`);
      
      if (!userId || !machineId || !date || !time) {
        console.error('Missing required booking information:', { userId, machineId, date, time });
        return false;
      }
      
      // Define variables to store the query parameters
      let userIdQuery: any = userId;
      let machineIdQuery: any = machineId;
      
      // Try to handle different ID formats
      // For numeric IDs
      if (!isNaN(Number(userId))) {
        userIdQuery = Number(userId);
      } else if (mongoose.Types.ObjectId.isValid(userId)) {
        userIdQuery = new mongoose.Types.ObjectId(userId);
      }
      
      if (!isNaN(Number(machineId))) {
        machineIdQuery = Number(machineId);
      } else if (mongoose.Types.ObjectId.isValid(machineId)) {
        machineIdQuery = new mongoose.Types.ObjectId(machineId);
      }
      
      console.log(`Looking up user with ID: ${userIdQuery} (${typeof userIdQuery})`);
      console.log(`Looking up machine with ID: ${machineIdQuery} (${typeof machineIdQuery})`);
      
      // Try with the query parameter
      let user = await this.usersCollection.findOne({ _id: userIdQuery });
      let machine = await this.machinesCollection.findOne({ _id: machineIdQuery });
      
      // If not found, try with string ID
      if (!user) {
        console.log(`User not found with ID ${userIdQuery}, trying string ID...`);
        user = await this.usersCollection.findOne({ _id: userId });
      }
      
      if (!machine) {
        console.log(`Machine not found with ID ${machineIdQuery}, trying string ID...`);
        machine = await this.machinesCollection.findOne({ _id: machineId });
      }
      
      // If still not found, try with numeric ID
      if (!user && !isNaN(Number(userId))) {
        console.log(`User not found with string ID, trying numeric ID...`);
        user = await this.usersCollection.findOne({ _id: Number(userId) });
      }
      
      if (!machine && !isNaN(Number(machineId))) {
        console.log(`Machine not found with string ID, trying numeric ID...`);
        machine = await this.machinesCollection.findOne({ _id: Number(machineId) });
      }
      
      if (!user) {
        console.error(`User ${userId} not found`);
        return false;
      }
      
      if (!machine) {
        console.error(`Machine ${machineId} not found`);
        return false;
      }
      
      console.log(`Found user: ${user.name}, machine: ${machine.name}`);
      
      const bookingDate = new Date(date);
      if (isNaN(bookingDate.getTime())) {
        console.error(`Invalid date format: ${date}`);
        return false;
      }
      
      // Improved check for existing bookings - check by both machine ID and exact time slot
      console.log(`Checking for existing bookings on ${date} at ${time} for machine ${machineId}`);
      
      // Create date range for the whole day
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const existingBooking = await this.bookingsCollection.findOne({
        machine: machineId,
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        },
        time: time,
        status: { $in: ['Pending', 'Approved'] }
      });
      
      if (existingBooking) {
        console.error(`Booking already exists for machine ${machineId} on ${date} at ${time}`);
        console.error(`Existing booking details:`, existingBooking);
        return false;
      }
      
      const clientId = `booking-${Date.now()}`;
      
      // ALWAYS set status to 'Pending' for new bookings - no exceptions
      const booking: MongoBooking = {
        user: userId,
        machine: machineId,
        date: bookingDate,
        time,
        status: 'Pending', // ALWAYS 'Pending' for initial booking
        clientId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: user.name || 'Unknown User',
        machineName: machine.name || 'Unknown Machine',
      };
      
      console.log('Creating booking with data:', booking);
      
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
      
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        result = await this.bookingsCollection.deleteOne({ _id: new mongoose.Types.ObjectId(bookingId) });
      } else {
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
      console.log(`MongoDB: Updating booking ${bookingId} status to ${status}`);
      let result;
      let bookingFound = false;
      
      // First try using MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        console.log(`Updating booking with ObjectId: ${bookingId}`);
        
        // First check if the booking exists
        const booking = await this.bookingsCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(bookingId) 
        });
        
        if (booking) {
          bookingFound = true;
          console.log(`Found booking with ObjectId, current status: ${booking.status}`);
          
          // If the booking already has the target status, return success without updating
          if (booking.status === status) {
            console.log(`Booking ${bookingId} already has status ${status}`);
            return true;
          }
          
          result = await this.bookingsCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(bookingId) },
            { $set: { status, updatedAt: new Date() } }
          );
        }
      }
      
      // If not found with ObjectId, try with clientId
      if (!bookingFound) {
        console.log(`Booking not found with ObjectId, trying clientId: ${bookingId}`);
        
        // Check if the booking exists with clientId
        const booking = await this.bookingsCollection.findOne({ 
          clientId: bookingId 
        });
        
        if (booking) {
          bookingFound = true;
          console.log(`Found booking with clientId, current status: ${booking.status}`);
          
          // If the booking already has the target status, return success without updating
          if (booking.status === status) {
            console.log(`Booking ${bookingId} already has status ${status}`);
            return true;
          }
          
          result = await this.bookingsCollection.updateOne(
            { clientId: bookingId },
            { $set: { status, updatedAt: new Date() } }
          );
        }
      }
      
      // If still not found, try one more time with string ID
      if (!bookingFound) {
        console.log(`Booking not found with ObjectId or clientId, trying string ID: ${bookingId}`);
        
        // Check if any booking has an id field matching the bookingId
        const booking = await this.bookingsCollection.findOne({ 
          id: bookingId 
        });
        
        if (booking) {
          bookingFound = true;
          console.log(`Found booking with id field, current status: ${booking.status}`);
          
          // If the booking already has the target status, return success without updating
          if (booking.status === status) {
            console.log(`Booking ${bookingId} already has status ${status}`);
            return true;
          }
          
          result = await this.bookingsCollection.updateOne(
            { id: bookingId },
            { $set: { status, updatedAt: new Date() } }
          );
        }
      }
      
      // Log detailed results and check success
      console.log(`MongoDB update result:`, result);
      
      if (!bookingFound) {
        console.log(`❌ No booking found with any ID format: ${bookingId}`);
        return false;
      }
      
      // Check if document was actually modified and make sure result exists
      if (result && result.modifiedCount > 0) {
        console.log(`✅ Booking ${bookingId} status updated to ${status}`);
        return true;
      } else if (result && result.matchedCount > 0 && result.modifiedCount === 0) {
        // Document found but not modified (might have already had the status)
        console.log(`⚠️ Booking ${bookingId} was found but status not changed (might already be ${status})`);
        // Still return true since the booking exists with the wanted status
        return true;
      } else {
        console.log(`❓ Update operation completed but with unexpected result`);
        // Do one final check to confirm the current status
        const updatedBooking = bookingFound && mongoose.Types.ObjectId.isValid(bookingId) 
          ? await this.bookingsCollection.findOne({ _id: new mongoose.Types.ObjectId(bookingId) })
          : await this.bookingsCollection.findOne({ clientId: bookingId });
        
        if (updatedBooking && updatedBooking.status === status) {
          console.log(`✅ Confirmed booking now has status ${status}`);
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status in MongoDB:`, error);
      return false;
    }
  }
  
  private async enrichBookingsWithDetails(bookings: any[]): Promise<any[]> {
    if (!this.usersCollection || !this.machinesCollection) {
      return bookings;
    }
    
    const enrichedBookings = [];
    
    for (const booking of bookings) {
      try {
        if (booking.userName && booking.machineName) {
          enrichedBookings.push({
            ...booking,
            id: booking._id.toString(),
          });
          continue;
        }
        
        let userId = booking.user;
        let machineId = booking.machine;
        
        if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
          userId = new mongoose.Types.ObjectId(userId);
        }
        
        if (typeof machineId === 'string' && mongoose.Types.ObjectId.isValid(machineId)) {
          machineId = new mongoose.Types.ObjectId(machineId);
        }
        
        const user = await this.usersCollection.findOne({ _id: userId });
        const machine = await this.machinesCollection.findOne({ _id: machineId });
        
        enrichedBookings.push({
          ...booking,
          id: booking._id.toString(),
          userName: user?.name || 'Unknown User',
          machineName: machine?.name || 'Unknown Machine',
        });
      } catch (error) {
        console.error("Error enriching booking with details:", error);
        enrichedBookings.push({
          ...booking,
          id: booking._id.toString(),
        });
      }
    }
    
    return enrichedBookings;
  }
}

const mongoBookingService = new MongoBookingService();
export default mongoBookingService;
