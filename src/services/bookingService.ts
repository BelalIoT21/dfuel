
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
  
  // Update booking status (for admin approval/rejection)
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    console.log(`BookingService.updateBookingStatus: bookingId=${bookingId}, status=${status}`);
    
    try {
      // First try the API
      const response = await apiService.updateBookingStatus(bookingId, status);
      if (response.data) {
        console.log("Booking status updated via API");
        return true;
      }
      
      // If API fails, try updating in MongoDB directly (if not in web)
      if (!isWeb) {
        try {
          // This would need implementation in MongoDB service
          // For now, return false as this is not implemented
          console.log("API failed, but MongoDB direct update not implemented");
          return false;
        } catch (mongoError) {
          console.error("MongoDB error when updating booking status:", mongoError);
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error in BookingService.updateBookingStatus:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const bookingService = new BookingService();

import { apiService } from './apiService';
