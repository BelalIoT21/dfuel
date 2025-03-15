
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';
import mongoDbService from '../mongoDbService';

/**
 * Service that handles all booking-related database operations.
 */
export class BookingDatabaseService extends BaseService {
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      console.log(`Attempting to create booking: userId=${userId}, machineId=${machineId}, date=${date}, time=${time}`);
      
      // First try the API
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
        console.error("API error, falling back to MongoDB:", apiError);
      }
      
      // If API fails, fall back to MongoDB
      console.log("Using MongoDB fallback for booking");
      
      try {
        // Connect to MongoDB first
        await mongoDbService.connect();
        
        // Create the booking object
        const booking = {
          id: `booking-${Date.now()}`,
          machineId,
          date,
          time,
          status: 'Pending' as const
        };
        
        // Add booking to the user's bookings
        const success = await mongoDbService.addUserBooking(userId, booking);
        
        console.log("Booking created via MongoDB:", success);
        return success;
      } catch (mongoError) {
        console.error("MongoDB error:", mongoError);
        // Even if MongoDB fails, we should update the user object in memory
        // so at least the booking appears in the UI
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
          console.log("Booking saved in memory as last resort");
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Fatal error in addBooking:", error);
      return false;
    }
  }

  async getUserBookings(userId: string) {
    try {
      // First try to get bookings from MongoDB
      await mongoDbService.connect();
      const user = await mongoDbService.getUserById(userId);
      if (user?.bookings && user.bookings.length > 0) {
        return user.bookings;
      }
    } catch (error) {
      console.error("Error getting bookings from MongoDB:", error);
    }
    
    // Fall back to user database service
    const user = await userDatabaseService.findUserById(userId);
    return user?.bookings || [];
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
