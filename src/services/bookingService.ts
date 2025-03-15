
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { Booking } from '../types/database';
import { bookingDatabaseService } from './database/bookingService';
import { isWeb } from '../utils/platform';
import { toast } from '../components/ui/use-toast';
import { apiService } from './apiService';

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
      // Try direct API call first (most reliable)
      const response = await apiService.updateBookingStatus(bookingId, status);
      
      if (response && !response.error) {
        console.log("Successfully updated booking status via API");
        toast({
          title: `Booking ${status}`,
          description: `The booking has been ${status.toLowerCase()} successfully.`,
          variant: status === 'Approved' ? 'default' : 'destructive',
        });
        return true;
      }
      
      console.error("API request failed, trying alternative methods");
      
      // If API fails, try MongoDB directly if not in web environment
      if (!isWeb) {
        try {
          const success = await mongoDbService.updateBookingStatus(bookingId, status);
          if (success) {
            console.log("Booking status updated via MongoDB");
            toast({
              title: `Booking ${status}`,
              description: `The booking has been ${status.toLowerCase()} successfully.`,
              variant: status === 'Approved' ? 'default' : 'destructive',
            });
            return true;
          }
        } catch (mongoError) {
          console.error("MongoDB error when updating booking status:", mongoError);
        }
      }
      
      // As a last resort, try the database service
      const success = await bookingDatabaseService.updateBookingStatus(bookingId, status);
      if (success) {
        toast({
          title: `Booking ${status}`,
          description: `The booking has been ${status.toLowerCase()} successfully.`,
          variant: status === 'Approved' ? 'default' : 'destructive',
        });
        return true;
      }
      
      console.error("All attempts to update booking status failed");
      toast({
        title: "Error",
        description: "There was a problem updating the booking status.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error("Error in BookingService.updateBookingStatus:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the booking status.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Get all bookings (admin only)
  async getAllBookings(): Promise<any[]> {
    try {
      console.log("BookingService.getAllBookings: Fetching all bookings");
      
      // Try API first
      const response = await apiService.getAllBookings();
      if (response && response.data) {
        console.log("Retrieved all bookings from API:", response.data.length);
        return response.data;
      }
      
      // If API fails, try MongoDB directly
      if (!isWeb) {
        const bookings = await mongoDbService.getAllBookings();
        if (bookings && bookings.length > 0) {
          console.log("Retrieved all bookings from MongoDB:", bookings.length);
          return bookings;
        }
      }
      
      // As a last resort, use bookingDatabaseService
      return bookingDatabaseService.getAllPendingBookings(); // This will get all bookings, not just pending
    } catch (error) {
      console.error("Error in BookingService.getAllBookings:", error);
      return [];
    }
  }
}

// Create a singleton instance
export const bookingService = new BookingService();
