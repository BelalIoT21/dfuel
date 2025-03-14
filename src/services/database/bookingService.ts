
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
      // Convert string IDs to proper format if needed, MongoDB expects ObjectId
      // For machine IDs that are just numbers, MongoDB will throw error during cast
      // Ensure machineId is properly formatted for MongoDB
      
      const formattedMachineId = machineId;
      console.log(`Attempting to create booking for user ${userId} on machine ${formattedMachineId}`);
      
      const response = await apiService.addBooking(userId, formattedMachineId, date, time);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, falling back to localStorage booking:", error);
      
      // Fallback to localStorage
      const user = localStorageService.findUserById(userId);
      if (!user) return false;
      
      const booking = {
        id: `booking-${Date.now()}`,
        machineId,
        date,
        time,
        status: 'Pending' as const
      };
      
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
