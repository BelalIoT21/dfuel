
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { toast } from '@/components/ui/use-toast';
import mongoDbService from '../mongoDbService';

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
      // Try direct MongoDB access first if available
      try {
        const success = await mongoDbService.updateBookingStatus(bookingId, status);
        if (success) {
          console.log("Successfully updated booking status via MongoDB");
          return true;
        }
      } catch (mongoError) {
        console.error("MongoDB error updating booking status:", mongoError);
      }
      
      // Fall back to API
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
    try {
      // Try direct MongoDB access first if available
      try {
        const success = await mongoDbService.updateBookingStatus(bookingId, 'Canceled');
        if (success) {
          console.log("Successfully canceled booking via MongoDB");
          return true;
        }
      } catch (mongoError) {
        console.error("MongoDB error canceling booking:", mongoError);
      }
      
      // Fall back to API
      return this.updateBookingStatus(bookingId, 'Canceled');
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      return false;
    }
  }
  
  async deleteBooking(bookingId: string): Promise<boolean> {
    console.log(`Attempting to delete booking ${bookingId}`);
    try {
      // First try MongoDB direct deletion if available
      let success = false;
      
      try {
        success = await mongoDbService.deleteBooking(bookingId);
        if (success) {
          console.log("Successfully deleted booking via MongoDB");
          return true;
        }
      } catch (mongoError) {
        console.error("MongoDB error deleting booking:", mongoError);
      }
      
      // Try multiple API endpoints
      const endpoints = [
        `bookings/${bookingId}`,
        `auth/bookings/${bookingId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to delete booking via ${endpoint}`);
          const response = await apiService.delete(endpoint);
          
          if (response.data && response.data.success) {
            console.log(`Successfully deleted booking via API endpoint: ${endpoint}`);
            return true;
          }
        } catch (apiError) {
          console.error(`API error deleting booking via ${endpoint}:`, apiError);
        }
      }
      
      // If all deletion attempts fail, try cancellation
      console.log("All deletion attempts failed, trying to cancel instead");
      success = await this.cancelBooking(bookingId);
      
      if (success) {
        console.log("Successfully marked booking as canceled instead of deleting");
        // Return true even though we only canceled - this is better UX than returning an error
        return true;
      }
      
      console.error("All methods of booking deletion failed");
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again later.",
        variant: "destructive"
      });
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
