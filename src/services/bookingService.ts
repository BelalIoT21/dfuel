
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { Booking } from '../types/database';
import { bookingDatabaseService } from './database/bookingService';
import { isWeb } from '../utils/platform';

export class BookingService {
  // Create a booking
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    console.log(`BookingService.createBooking: userId=${userId}, machineId=${machineId}, date=${date}, time=${time}`);
    
    try {
      // Use the bookingDatabaseService which has proper fallback mechanisms
      return await bookingDatabaseService.addBooking(userId, machineId, date, time);
    } catch (error) {
      console.error("Error in BookingService.createBooking:", error);
      return false;
    }
  }
  
  // Get user bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    console.log(`BookingService.getUserBookings: userId=${userId}`);
    
    try {
      // If not in web environment, try MongoDB first
      if (!isWeb) {
        try {
          const mongoUser = await mongoDbService.getUserById(userId);
          if (mongoUser && mongoUser.bookings && mongoUser.bookings.length > 0) {
            console.log("Retrieved bookings from MongoDB:", mongoUser.bookings);
            return mongoUser.bookings;
          }
        } catch (mongoError) {
          console.error("MongoDB error when getting bookings:", mongoError);
        }
      }
      
      // Fall back to bookingDatabaseService which handles other fallbacks
      return bookingDatabaseService.getUserBookings(userId);
    } catch (error) {
      console.error("Error in BookingService.getUserBookings:", error);
      return [];
    }
  }
}

// Create a singleton instance
export const bookingService = new BookingService();
