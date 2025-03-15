
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { toast } from '@/components/ui/use-toast';

/**
 * Service that handles all booking-related database operations.
 */
export class BookingDatabaseService extends BaseService {
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      const response = await apiService.addBooking(userId, machineId, date, time);
      if (response.data?.success) {
        return true;
      }
      
      throw new Error('Failed to add booking through API');
    } catch (error) {
      console.error("API error adding booking:", error);
      toast({
        title: "Error",
        description: "Failed to add booking",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async getUserBookings(userId: string) {
    try {
      const response = await apiService.getUserBookings(userId);
      if (response.data && !response.error) {
        return response.data;
      }
      
      throw new Error('Failed to get user bookings through API');
    } catch (error) {
      console.error("API error getting user bookings:", error);
      return [];
    }
  }
  
  async getAllBookings() {
    try {
      const response = await apiService.getAllBookings();
      console.log("Retrieved all bookings from API:", response);
      
      if (response.data && !response.error) {
        return response.data;
      }
      
      throw new Error('Failed to get all bookings through API');
    } catch (error) {
      console.error("API error getting all bookings:", error);
      return [];
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    console.log(`Updating booking ${bookingId} status to ${status}`);
    try {
      const response = await apiService.updateBookingStatus(bookingId, status);
      if (response.data && !response.error) {
        console.log("Successfully updated booking status via API");
        return true;
      }
      
      throw new Error('Failed to update booking status through API');
    } catch (error) {
      console.error("API error updating booking status:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async cancelBooking(bookingId: string): Promise<boolean> {
    return this.updateBookingStatus(bookingId, 'Canceled');
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
