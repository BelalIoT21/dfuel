
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
      
      toast({
        title: "Error",
        description: response.error || "Failed to add booking",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error("API error in addBooking:", error);
      toast({
        title: "Error",
        description: "Failed to add booking. Please try again.",
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
      console.error("Failed to get user bookings:", response.error);
      return [];
    } catch (error) {
      console.error("API error in getUserBookings:", error);
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
      
      console.error("Failed to get all bookings:", response.error);
      return [];
    } catch (error) {
      console.error("API error in getAllBookings:", error);
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
      
      console.error("Failed to update booking status:", response.error);
      return false;
    } catch (error) {
      console.error("API error in updateBookingStatus:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  async cancelBooking(bookingId: string): Promise<boolean> {
    return this.updateBookingStatus(bookingId, 'Canceled');
  }
  
  async deleteBooking(bookingId: string): Promise<boolean> {
    console.log(`Attempting to delete booking ${bookingId}`);
    try {
      const response = await apiService.delete(`bookings/${bookingId}`);
      
      if (response.data && response.data.success) {
        console.log("Successfully deleted booking via API");
        return true;
      }
      
      console.error("Failed to delete booking:", response.error);
      return false;
    } catch (error) {
      console.error("API error in deleteBooking:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
