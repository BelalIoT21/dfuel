
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';
import { isWeb } from '../../utils/platform';

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
        console.error("API error, falling back to memory store:", apiError);
      }
      
      // Always use in-memory fallback in web environment (no MongoDB)
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
    // For web environment, always use memory store
    const user = await userDatabaseService.findUserById(userId);
    return user?.bookings || [];
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
