
import { apiService } from './apiService';
import mongoBookingService from './mongodb/bookingService';
import { isWeb } from '@/utils/platform';

class MongoDbService {
  /**
   * Check if time slot is available
   */
  async isTimeSlotAvailable(machineId: string, date: string, time: string): Promise<boolean> {
    try {
      // In web environments, use API
      if (isWeb()) {
        try {
          // First, get all bookings and check manually
          const bookings = await this.getAllBookings();
          
          if (Array.isArray(bookings)) {
            const isBooked = bookings.some(booking => 
              booking.machineId === machineId && 
              new Date(booking.date).toDateString() === new Date(date).toDateString() && 
              booking.time === time &&
              (booking.status === 'Pending' || booking.status === 'Approved')
            );
            
            return !isBooked;
          }
          
          // If we couldn't check manually, assume available
          return true;
        } catch (error) {
          console.error('Error checking time slot availability:', error);
          return true; // Assume available in case of error
        }
      }
      
      // For non-web environments, use MongoDB directly
      return await mongoBookingService.isTimeSlotAvailable(machineId, date, time);
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return true; // Assume available in case of error
    }
  }
  
  /**
   * Create new booking
   */
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      // For web environments, use API
      if (isWeb()) {
        const response = await apiService.addBooking(userId, machineId, date, time);
        return response && !response.error;
      }
      
      // For non-web environments, use MongoDB
      return await mongoBookingService.createBooking(userId, machineId, date, time);
    } catch (error) {
      console.error('Error creating booking:', error);
      return false;
    }
  }
  
  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    try {
      // For web environments, use API
      if (isWeb()) {
        const response = await apiService.updateBookingStatus(bookingId, status);
        return response && !response.error;
      }
      
      // For non-web environments, use MongoDB
      return await mongoBookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  }
  
  /**
   * Delete booking
   */
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      // For web environments, use API
      if (isWeb()) {
        // Try multiple API endpoints
        const endpoints = [
          `bookings/${bookingId}`,
          `auth/bookings/${bookingId}`
        ];
        
        for (const endpoint of endpoints) {
          try {
            const response = await apiService.delete(endpoint);
            if (response && !response.error) {
              return true;
            }
          } catch (e) {
            console.error(`Error deleting booking via ${endpoint}:`, e);
          }
        }
        
        return false;
      }
      
      // For non-web environments, use MongoDB
      return await mongoBookingService.deleteBooking(bookingId);
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  }
  
  /**
   * Get all bookings
   */
  async getAllBookings(): Promise<any[]> {
    try {
      // For web environments, use API
      if (isWeb()) {
        const response = await apiService.getAllBookings();
        console.log("Found", response.data?.length || 0, "bookings via API");
        return response.data || [];
      }
      
      // For non-web environments, use MongoDB
      return await mongoBookingService.getAllBookings();
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return [];
    }
  }
  
  /**
   * Get user bookings
   */
  async getUserBookings(userId: string): Promise<any[]> {
    try {
      // For web environments, use API
      if (isWeb()) {
        const response = await apiService.getUserBookings(userId);
        return response.data || [];
      }
      
      // For non-web environments, use MongoDB
      return await mongoBookingService.getUserBookings(userId);
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
  }
}

const mongoDbService = new MongoDbService();
export default mongoDbService;
