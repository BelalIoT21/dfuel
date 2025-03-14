
import { apiService } from '../api';
import { localStorageService } from '../localStorageService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';

/**
 * Service that handles all booking-related database operations.
 */
export class BookingDatabaseService extends BaseService {
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      const response = await apiService.booking.addBooking(userId, machineId, date, time);
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
  
  async getAllBookings() {
    try {
      const response = await apiService.booking.getAllBookings();
      return response.data || [];
    } catch (error) {
      console.error("API error, could not get all bookings:", error);
      return [];
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    try {
      const response = await apiService.booking.updateBookingStatus(bookingId, status);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, could not update booking status:", error);
      return false;
    }
  }
  
  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const response = await apiService.booking.cancelBooking(bookingId);
      return response.data?.success || false;
    } catch (error) {
      console.error("API error, could not cancel booking:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
