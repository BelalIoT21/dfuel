
import { apiService } from '../apiService';
import { localStorageService } from '../localStorageService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';

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
          machineId, 
          date, 
          time 
        });
        
        if (response.data) {
          console.log("Booking created successfully via API:", response.data);
          return true;
        }
      } catch (apiError) {
        console.error("API error, falling back to localStorage booking:", apiError);
      }
      
      // If API fails, fall back to localStorage
      console.log("Using localStorage fallback for booking");
      const user = localStorageService.findUserById(userId);
      if (!user) {
        console.error("User not found in localStorage:", userId);
        return false;
      }
      
      const booking = {
        id: `booking-${Date.now()}`,
        machineId,
        date,
        time,
        status: 'Pending' as const
      };
      
      if (!user.bookings) {
        user.bookings = []; // Initialize bookings array if it doesn't exist
      }
      
      user.bookings.push(booking);
      const success = localStorageService.updateUser(userId, { bookings: user.bookings });
      
      console.log("Booking created via localStorage:", success);
      return success;
    } catch (error) {
      console.error("Fatal error in addBooking:", error);
      return false;
    }
  }

  async getUserBookings(userId: string) {
    const user = await userDatabaseService.findUserById(userId);
    return user?.bookings || [];
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
