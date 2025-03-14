
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
      console.log(`Adding booking for machine ${machineId} on ${date} at ${time} for user ${userId}`);
      const response = await apiService.addBooking(userId, machineId, date, time);
      
      if (response.data?.success) {
        console.log('Booking added successfully via API');
        return true;
      } else {
        console.log('API booking failed: No success in response');
        throw new Error('API booking failed');
      }
    } catch (error) {
      console.error("API error, falling back to localStorage booking:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) {
        console.log('User not found in localStorage:', userId);
        return false;
      }
      
      const booking = {
        id: `booking-${Date.now()}`,
        machineId,
        date,
        time,
        status: 'Pending' as const
      };
      
      console.log('Adding booking to localStorage:', booking);
      user.bookings.push(booking);
      return localStorageService.updateUser(userId, { bookings: user.bookings });
    }
  }

  async getUserBookings(userId: string) {
    const user = await userDatabaseService.findUserById(userId);
    return user?.bookings || [];
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
