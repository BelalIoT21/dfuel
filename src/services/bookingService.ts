
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { Booking } from '../types/database';
import { bookingDatabaseService } from './database/bookingService';
import { isWeb } from '../utils/platform';
import { toast } from '../components/ui/use-toast';

export class BookingService {
  // Create a booking
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    console.log(`BookingService.createBooking: userId=${userId}, machineId=${machineId}, date=${date}, time=${time}`);
    
    try {
      // Use the bookingDatabaseService which has proper fallback mechanisms
      const success = await bookingDatabaseService.addBooking(userId, machineId, date, time);
      
      if (success) {
        toast({
          title: "Booking Submitted",
          description: "Your booking request has been submitted and is waiting for approval.",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error in BookingService.createBooking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
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
  
  // Update booking status
  async updateBookingStatus(bookingId: string, status: 'Approved' | 'Rejected' | 'Completed' | 'Canceled'): Promise<boolean> {
    console.log(`BookingService.updateBookingStatus: bookingId=${bookingId}, status=${status}`);
    
    try {
      // Try API first
      try {
        const response = await apiService.updateBookingStatus(bookingId, status);
        if (response.data) {
          return true;
        }
      } catch (apiError) {
        console.error("API error when updating booking status:", apiError);
      }
      
      // Then try MongoDB directly if not in web environment
      if (!isWeb) {
        try {
          await mongoDbService.updateBookingStatus(bookingId, status);
          return true;
        } catch (mongoError) {
          console.error("MongoDB error when updating booking status:", mongoError);
        }
      }
      
      // Finally try local storage
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
