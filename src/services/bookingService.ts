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
      // Use the API service for server-side updates
      const response = await apiService.request(`bookings/${bookingId}/status`, 'PUT', { status });
      
      if (!response.error) {
        toast({
          title: `Booking ${status}`,
          description: `The booking has been ${status.toLowerCase()} successfully.`,
          variant: status === 'Approved' ? 'default' : 'destructive',
        });
        return true;
      }
      
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
      
      console.error("Failed to update booking status");
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
}

// Create a singleton instance
export const bookingService = new BookingService();
