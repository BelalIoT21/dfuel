
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
      // First check if this is a client-generated ID (usually has "booking-" prefix)
      const isClientId = bookingId.startsWith('booking-');
      
      // Try direct API call first (most reliable)
      try {
        // Use the appropriate endpoint format based on ID type
        const endpoint = isClientId 
          ? `bookings/${bookingId}/status` 
          : `bookings/${bookingId}/status`;
          
        const response = await apiService.request(endpoint, 'PUT', { status });
        
        if (response && !response.error) {
          console.log("Successfully updated booking status via API");
          toast({
            title: `Booking ${status}`,
            description: `The booking has been ${status.toLowerCase()} successfully.`,
            variant: status === 'Approved' ? 'default' : 'destructive',
          });
          return true;
        }
      } catch (apiError) {
        console.error("API request failed, trying alternative methods", apiError);
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
      
      // As a last resort, try to update in local storage
      // This is especially important for client-generated IDs
      try {
        if (isClientId) {
          // Get all users from local storage
          const users = await localStorageService.getAll('users');
          
          // Find the user with this booking
          let updated = false;
          for (let user of users) {
            if (user.bookings && Array.isArray(user.bookings)) {
              const bookingIndex = user.bookings.findIndex(b => b.id === bookingId);
              if (bookingIndex >= 0) {
                // Update booking status
                user.bookings[bookingIndex].status = status;
                // Save user back to local storage
                await localStorageService.update('users', user.id, user);
                updated = true;
                break;
              }
            }
          }
          
          if (updated) {
            console.log("Booking status updated in local storage");
            toast({
              title: `Booking ${status}`,
              description: `The booking has been ${status.toLowerCase()} successfully.`,
              variant: status === 'Approved' ? 'default' : 'destructive',
            });
            return true;
          }
        }
      } catch (storageError) {
        console.error("Local storage error when updating booking status:", storageError);
      }
      
      // Finally try the database service (which has its own fallbacks)
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
      try {
        const response = await apiService.getAllBookings();
        if (response && response.data) {
          console.log("Retrieved all bookings from API:", response.data.length);
          // Add machine names if missing
          const bookingsWithNames = response.data.map(booking => {
            if (!booking.machineName) {
              booking.machineName = this.getMachineName(booking.machineId);
            }
            return booking;
          });
          return bookingsWithNames;
        }
      } catch (apiError) {
        console.error("API error when fetching bookings:", apiError);
      }
      
      // If API fails, try MongoDB directly
      if (!isWeb) {
        try {
          const bookings = await mongoDbService.getAllBookings();
          if (bookings && bookings.length > 0) {
            console.log("Retrieved all bookings from MongoDB:", bookings.length);
            // Add machine names if missing
            const bookingsWithNames = bookings.map(booking => {
              if (!booking.machineName) {
                booking.machineName = this.getMachineName(booking.machineId);
              }
              return booking;
            });
            return bookingsWithNames;
          }
        } catch (mongoError) {
          console.error("MongoDB error when fetching bookings:", mongoError);
        }
      }
      
      // As a last resort, use bookingDatabaseService
      const bookings = await bookingDatabaseService.getAllPendingBookings();
      console.log("Retrieved all bookings from local database:", bookings.length);
      // Make sure machine names are set correctly
      const bookingsWithNames = bookings.map(booking => {
        if (!booking.machineName) {
          booking.machineName = this.getMachineName(booking.machineId);
        }
        return booking;
      });
      return bookingsWithNames;
    } catch (error) {
      console.error("Error in BookingService.getAllBookings:", error);
      return [];
    }
  }
  
  // Helper method to get machine name from ID
  private getMachineName(machineId: string): string {
    const machineMap = {
      '1': 'Laser Cutter',
      '2': 'Ultimaker',
      '3': 'X1 E Carbon 3D Printer',
      '4': 'Bambu Lab X1 E',
      '5': 'Soldering Station'
    };
    
    return machineMap[machineId] || `Machine ${machineId}`;
  }
}

// Create a singleton instance
export const bookingService = new BookingService();
