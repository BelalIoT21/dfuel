
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';
import mongoUserService from '../mongodb/userService';

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
        console.error("API error, falling back to direct MongoDB:", apiError);
      }
      
      // If API fails, fall back to direct MongoDB service
      try {
        console.log("Using direct MongoDB service for booking");
        
        // Create the booking object
        const booking = {
          id: `booking-${Date.now()}`,
          machineId,
          date,
          time,
          status: 'Pending' as const
        };
        
        // Add booking directly with MongoDB user service
        const success = await mongoUserService.addUserBooking(userId, booking);
        
        if (success) {
          console.log("Booking created via MongoDB service:", success);
          return true;
        } else {
          console.error("MongoDB service failed to create booking");
          
          // Last resort: update the user object in memory
          const user = await userDatabaseService.findUserById(userId);
          if (user) {
            if (!user.bookings) {
              user.bookings = [];
            }
            
            user.bookings.push(booking);
            console.log("Booking saved in memory as last resort");
            return true;
          }
        }
        
        return false;
      } catch (error) {
        console.error("Error with MongoDB service:", error);
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
      // First try to get bookings from MongoDB user service
      const user = await mongoUserService.getUserById(userId);
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
