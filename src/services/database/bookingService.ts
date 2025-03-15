
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';
import { isWeb } from '../../utils/platform';
import mongoDbService from '../mongoDbService';
import { toast } from '../../components/ui/use-toast';

/**
 * Service that handles all booking-related database operations.
 */
export class BookingDatabaseService extends BaseService {
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      console.log(`Attempting to create booking: userId=${userId}, machineId=${machineId}, date=${date}, time=${time}`);
      
      // First try to save directly to MongoDB if not in web environment
      if (!isWeb) {
        try {
          console.log("Attempting to save booking directly to MongoDB");
          const success = await mongoDbService.addUserBooking(userId, {
            id: `booking-${Date.now()}`,
            machineId,
            date,
            time,
            status: 'Pending'
          });
          
          if (success) {
            console.log("Booking saved successfully to MongoDB");
            return true;
          }
        } catch (mongoError) {
          console.error("MongoDB error, will try API next:", mongoError);
        }
      }
      
      // Next try the API
      try {
        const response = await apiService.request('bookings', 'POST', { 
          userId,
          machineId, 
          date, 
          time 
        });
        
        if (response.data) {
          console.log("Booking created successfully via API:", response.data);
          return true;
        }
      } catch (apiError) {
        console.error("API error, falling back to memory store:", apiError);
      }
      
      // Use in-memory fallback as last resort
      console.log("Using in-memory fallback for booking");
      
      // Memory fallback
      const user = await userDatabaseService.findUserById(userId);
      if (user) {
        if (!user.bookings) {
          user.bookings = [];
        }
        
        const booking = {
          id: `booking-${Date.now()}`,
          machineId,
          date,
          time,
          status: 'Pending' as const
        };
        
        user.bookings.push(booking);
        console.log("Booking saved in memory:", booking);
        
        // Show toast notification about fallback
        if (!isWeb) {
          toast({
            title: "Booking saved locally",
            description: "Your booking was saved to local storage because the server was unreachable.",
            variant: "destructive"
          });
        }
        
        return true;
      }
      
      console.error("Could not find user to add booking to");
      return false;
    } catch (error) {
      console.error("Fatal error in addBooking:", error);
      return false;
    }
  }

  async getUserBookings(userId: string) {
    try {
      // First try to get bookings from MongoDB if not in web environment
      if (!isWeb) {
        try {
          const user = await mongoDbService.getUserById(userId);
          if (user && user.bookings && user.bookings.length > 0) {
            console.log("Retrieved bookings from MongoDB:", user.bookings);
            return user.bookings;
          }
        } catch (mongoError) {
          console.error("MongoDB error when getting bookings:", mongoError);
        }
      }
      
      // For web environment or as fallback, use memory store
      const user = await userDatabaseService.findUserById(userId);
      return user?.bookings || [];
    } catch (error) {
      console.error("Error getting user bookings:", error);
      return [];
    }
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
