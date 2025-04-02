
import { Collection } from 'mongodb';
import mongoose from 'mongoose';
import { Booking } from '../../../server/src/models/Booking';
import { User } from '../../../server/src/models/User';
import { Machine } from '../../../server/src/models/Machine';
import mongoConnectionService from './connectionService';
import { MongoBooking } from './types';
import { isWeb } from '@/utils/platform';

class MongoBookingService {
  private bookingsCollection: Collection | null = null;
  private usersCollection: Collection | null = null;
  private machinesCollection: Collection | null = null;
  
  async initCollections(): Promise<void> {
    try {
      // Skip initialization in web environment
      if (isWeb()) {
        console.log("Skipping MongoDB initialization in web environment");
        return;
      }
      
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
    // Skip MongoDB operations in web environment
    if (isWeb()) {
      console.log("Fetching all bookings from API");
      return [];
    }
    
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
  
  async isTimeSlotAvailable(machineId: string, date: string, time: string): Promise<boolean> {
    await this.initCollections();
    if (!this.bookingsCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      // Create date range for the whole day
      const bookingDate = new Date(date);
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Check for existing approved or pending bookings
      const existingBooking = await this.bookingsCollection.findOne({
        machine: machineId,
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        },
        time: time,
        status: { $in: ['Pending', 'Approved'] }
      });
      
      return !existingBooking;
    } catch (error) {
      console.error("Error checking time slot availability in MongoDB:", error);
      return false;
    }
  }
  
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    await this.initCollections();
    if (!this.bookingsCollection || !this.usersCollection || !this.machinesCollection) {
      console.error("Bookings collection not initialized");
      return false;
    }
    
    try {
      if (!userId || !machineId || !date || !time) {
        console.error('Missing required booking information');
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
      
      // Try with the query parameter
      let user = await this.usersCollection.findOne({ _id: userIdQuery });
      let machine = await this.machinesCollection.findOne({ _id: machineIdQuery });
      
      // If not found, try with string ID
      if (!user) {
        user = await this.usersCollection.findOne({ _id: userId });
      }
      
      if (!machine) {
        machine = await this.machinesCollection.findOne({ _id: machineId });
      }
      
      // If still not found, try with numeric ID
      if (!user && !isNaN(Number(userId))) {
        user = await this.usersCollection.findOne({ _id: Number(userId) });
      }
      
      if (!machine && !isNaN(Number(machineId))) {
        machine = await this.machinesCollection.findOne({ _id: Number(machineId) });
      }
      
      if (!user) {
        console.error(`User not found`);
        return false;
      }
      
      if (!machine) {
        console.error(`Machine not found`);
        return false;
      }
      
      const bookingDate = new Date(date);
      if (isNaN(bookingDate.getTime())) {
        console.error(`Invalid date format: ${date}`);
        return false;
      }
      
      // Check for existing bookings
      console.log(`Checking availability on ${date} at ${time}`);
      
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
        console.error(`This time slot is already booked`);
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
    if (!this.bookingsCollection || !this.usersCollection) {
      console.error("Collections not initialized");
      return false;
    }
    
    try {
      console.log(`Attempting to delete booking ${bookingId}`);
      
      // Find the booking first to get its details
      let booking = null;
      let bookingIdToUse = bookingId;
      
      // Try finding by MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        booking = await this.bookingsCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(bookingId) 
        });
        
        if (booking) {
          console.log(`Found booking with ObjectId: ${bookingId}`);
          bookingIdToUse = booking._id;
        }
      }
      
      // If not found, try with clientId
      if (!booking) {
        booking = await this.bookingsCollection.findOne({ clientId: bookingId });
        if (booking) {
          console.log(`Found booking with clientId: ${bookingId}`);
          bookingIdToUse = booking._id;
        }
      }
      
      // If still not found, try with string id field
      if (!booking) {
        booking = await this.bookingsCollection.findOne({ id: bookingId });
        if (booking) {
          console.log(`Found booking with id field: ${bookingId}`);
          bookingIdToUse = booking._id;
        }
      }
      
      if (!booking) {
        console.log(`No booking found with any ID format: ${bookingId}`);
        return false;
      }
      
      // Get user ID from the booking
      const userId = booking.user;
      console.log(`Booking belongs to user: ${userId}`);
      
      // Delete the booking
      let result;
      if (mongoose.Types.ObjectId.isValid(bookingIdToUse)) {
        result = await this.bookingsCollection.deleteOne({ 
          _id: new mongoose.Types.ObjectId(bookingIdToUse) 
        });
      } else {
        result = await this.bookingsCollection.deleteOne({ _id: bookingIdToUse });
      }
      
      console.log(`Booking deletion result:`, result);
      
      if (result.deletedCount === 0) {
        console.log(`No booking was deleted with ID: ${bookingIdToUse}`);
        return false;
      }
      
      // Update user's bookings array to remove this booking
      if (userId) {
        try {
          let userIdToUse = userId;
          
          // Convert to ObjectId if valid
          if (mongoose.Types.ObjectId.isValid(userId)) {
            userIdToUse = new mongoose.Types.ObjectId(userId);
          }
          
          // Find the user and update their bookings array
          const userUpdateResult = await this.usersCollection.updateOne(
            { _id: userIdToUse },
            { $pull: { bookings: bookingIdToUse } }
          );
          
          console.log(`User update result:`, userUpdateResult);
        } catch (userError) {
          console.error(`Error updating user's bookings array:`, userError);
          // Continue since the booking was deleted successfully
        }
      }
      
      console.log(`Successfully deleted booking: ${bookingId}`);
      return true;
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
      let bookingData = null;
    
      // First try using MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        console.log(`Updating booking with ObjectId: ${bookingId}`);
      
        // First check if the booking exists
        const booking = await this.bookingsCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(bookingId) 
        });
      
        if (booking) {
          bookingFound = true;
          bookingData = booking;
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
          bookingData = booking;
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
          bookingData = booking;
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
    
      // Update machine time slots if status is changing to or from Approved
      if (bookingFound && bookingData) {
        const machineId = bookingData.machine;
        const date = bookingData.date;
        const time = bookingData.time;
      
        if (status === 'Approved') {
          // Add the time slot to the machine's booked slots
          await this.updateMachineTimeSlots(machineId, new Date(date).toISOString(), time, true);
        } else if (bookingData.status === 'Approved' && status !== 'Approved') {
          // Remove the time slot from the machine's booked slots if unapproving
          await this.updateMachineTimeSlots(machineId, new Date(date).toISOString(), time, false);
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
  
  async updateMachineTimeSlots(machineId: string, date: string, time: string, addSlot: boolean = true): Promise<boolean> {
    await this.initCollections();
    if (!this.machinesCollection) {
      console.error("Machines collection not initialized");
      return false;
    }
    
    try {
      const timeSlotKey = `${date.substring(0, 10)}-${time}`;
      let machineIdToUse = machineId;
      
      // Convert to ObjectId if valid
      if (mongoose.Types.ObjectId.isValid(machineId)) {
        machineIdToUse = new mongoose.Types.ObjectId(machineId);
      }
      
      if (addSlot) {
        // Add the time slot to the machine's booked slots
        const result = await this.machinesCollection.updateOne(
          { _id: machineIdToUse },
          { $addToSet: { bookedTimeSlots: timeSlotKey } }
        );
        
        console.log(`Added time slot ${timeSlotKey} to machine ${machineId}, result:`, result);
        return result.modifiedCount > 0 || result.matchedCount > 0;
      } else {
        // Remove the time slot from the machine's booked slots
        const result = await this.machinesCollection.updateOne(
          { _id: machineIdToUse },
          { $pull: { bookedTimeSlots: timeSlotKey } }
        );
        
        console.log(`Removed time slot ${timeSlotKey} from machine ${machineId}, result:`, result);
        return result.modifiedCount > 0 || result.matchedCount > 0;
      }
    } catch (error) {
      console.error(`Error updating machine time slots for ${machineId}:`, error);
      return false;
    }
  }
  
  private async enrichBookingsWithDetails(bookings: any[]): Promise<any[]> {
    if (!this.usersCollection || !this.machinesCollection || isWeb()) {
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
