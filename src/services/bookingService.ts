
import { apiService } from './apiService';
import mongoDbService from './mongoDbService';
import { toast } from '@/components/ui/use-toast';
import { isWeb } from '../utils/platform';

class BookingService {
  async getAllBookings() {
    try {
      console.log('BookingService.getAllBookings: Fetching all bookings');
      
      if (isWeb) {
        try {
          const response = await apiService.getAllBookings();
          if (response.data) {
            console.log('Successfully retrieved bookings from API:', response.data.length);
            return response.data;
          }
        } catch (error) {
          console.error('API error fetching all bookings:', error);
        }
      }
      
      // Always try mongoDbService regardless of platform
      console.log('Fetching bookings from MongoDB...');
      const bookings = await mongoDbService.getAllBookings();
      console.log('Retrieved bookings from MongoDB:', bookings.length);
      return bookings;
    } catch (error) {
      console.error('Error in getAllBookings:', error);
      return [];
    }
  }

  async getUserBookings(userId) {
    try {
      console.log(`BookingService.getUserBookings: Fetching bookings for user ${userId}`);
      
      if (isWeb) {
        try {
          const response = await apiService.getUserBookings();
          if (response.data) {
            console.log('Successfully retrieved user bookings from API:', response.data.length);
            return response.data;
          }
        } catch (error) {
          console.error('API error fetching user bookings:', error);
        }
      }
      
      // Always try mongoDbService regardless of platform
      console.log('Fetching user bookings from MongoDB...');
      const bookings = await mongoDbService.getUserBookings(userId);
      console.log('Retrieved user bookings from MongoDB:', bookings.length);
      return bookings;
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      return [];
    }
  }

  async createBooking(userId, machineId, date, time) {
    console.log(`BookingService.createBooking: Creating booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
    
    try {
      if (isWeb) {
        try {
          // Convert userId and machineId to strings to ensure proper format
          const userIdStr = String(userId);
          const machineIdStr = String(machineId);
          
          console.log(`Sending API request with userId: ${userIdStr}, machineId: ${machineIdStr}`);
          const response = await apiService.addBooking(userIdStr, machineIdStr, date, time);
          if (response.data && response.data.success) {
            console.log('Successfully created booking via API');
            toast({
              title: "Booking Created",
              description: "Your booking has been created successfully",
            });
            return true;
          }
        } catch (error) {
          console.error('API error creating booking:', error);
        }
      }
      
      // Always try mongoDbService regardless of platform
      console.log('Creating booking in MongoDB...');
      // Convert userId and machineId to strings before passing to MongoDB service
      const userIdStr = String(userId);
      const machineIdStr = String(machineId);
      const success = await mongoDbService.createBooking(userIdStr, machineIdStr, date, time);
      
      if (success) {
        console.log('Successfully created booking in MongoDB');
        toast({
          title: "Booking Created",
          description: "Your booking has been saved to MongoDB",
        });
        return true;
      } else {
        console.error('Failed to create booking in MongoDB');
        toast({
          title: "Booking Failed",
          description: "Unable to create your booking. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error in createBooking:', error);
      toast({
        title: "Booking Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }

  async cancelBooking(bookingId) {
    try {
      console.log(`BookingService.cancelBooking: Canceling booking ${bookingId}`);
      
      if (isWeb) {
        try {
          const response = await apiService.cancelBooking(bookingId);
          if (response.data && response.data.success) {
            console.log('Successfully canceled booking via API');
            return true;
          }
        } catch (error) {
          console.error('API error canceling booking:', error);
        }
      }
      
      // Always try mongoDbService regardless of platform
      console.log('Canceling booking in MongoDB...');
      const success = await mongoDbService.updateBookingStatus(bookingId, 'Canceled');
      
      if (success) {
        console.log('Successfully canceled booking in MongoDB');
        return true;
      }
      
      console.error('Failed to cancel booking');
      return false;
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      return false;
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      console.log(`BookingService.updateBookingStatus: Updating booking ${bookingId} to ${status}`);
      
      if (isWeb) {
        try {
          const response = await apiService.updateBookingStatus(bookingId, status);
          if (response.data && response.data.success) {
            console.log('Successfully updated booking status via API');
            return true;
          }
        } catch (error) {
          console.error('API error updating booking status:', error);
        }
      }
      
      // Always try mongoDbService regardless of platform
      console.log('Updating booking status in MongoDB...');
      const success = await mongoDbService.updateBookingStatus(bookingId, status);
      
      if (success) {
        console.log('Successfully updated booking status in MongoDB');
        return true;
      }
      
      console.error('Failed to update booking status');
      return false;
    } catch (error) {
      console.error('Error in updateBookingStatus:', error);
      return false;
    }
  }

  async deleteBooking(bookingId) {
    try {
      console.log(`BookingService.deleteBooking: Deleting booking ${bookingId}`);
      
      if (isWeb) {
        try {
          const response = await apiService.deleteBooking(bookingId);
          if (response.status === 200) {
            console.log('Successfully deleted booking via API');
            return true;
          }
        } catch (error) {
          console.error('API error deleting booking:', error);
        }
      }
      
      // Always try mongoDbService regardless of platform
      console.log('Deleting booking in MongoDB...');
      const success = await mongoDbService.deleteBooking(bookingId);
      
      if (success) {
        console.log('Successfully deleted booking in MongoDB');
        return true;
      }
      
      console.error('Failed to delete booking');
      return false;
    } catch (error) {
      console.error('Error in deleteBooking:', error);
      return false;
    }
  }
}

export const bookingService = new BookingService();
