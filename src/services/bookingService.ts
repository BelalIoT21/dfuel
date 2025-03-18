
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
    
    // Check for missing information
    if (!userId || !machineId || !date || !time) {
      console.error('Missing required booking information:', { userId, machineId, date, time });
      toast({
        title: "Missing Information",
        description: "Please ensure all booking details are provided",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Ensure date is properly formatted (YYYY-MM-DD)
      let formattedDate = date;
      if (date instanceof Date) {
        formattedDate = date.toISOString().split('T')[0];
      }
      
      // Ensure IDs are strings
      const userIdStr = String(userId);
      const machineIdStr = String(machineId);
      
      console.log(`Processing booking with userId: ${userIdStr} (${typeof userIdStr}), machineId: ${machineIdStr} (${typeof machineIdStr}), date: ${formattedDate}, time: ${time}`);
      
      if (isWeb) {
        try {
          console.log(`Sending API request with userId: ${userIdStr}, machineId: ${machineIdStr}, date: ${formattedDate}, time: ${time}`);
          const response = await apiService.addBooking(userIdStr, machineIdStr, formattedDate, time);
          
          if (response.data) {
            console.log('Successfully created booking via API:', response.data);
            // The API should set the status to 'Pending' for non-admin users
            return true;
          } else {
            console.error('API booking failed:', response.data);
          }
        } catch (error) {
          console.error('API error creating booking:', error);
        }
      }
      
      // Always try mongoDbService regardless of platform
      console.log('Creating booking in MongoDB...');
      
      // Log the exact data being sent to MongoDB
      console.log('Sending to MongoDB:', {
        userId: userIdStr,
        machineId: machineIdStr,
        date: formattedDate,
        time
      });
      
      const success = await mongoDbService.createBooking(userIdStr, machineIdStr, formattedDate, time);
      
      if (success) {
        console.log('Successfully created booking in MongoDB');
        return true;
      } else {
        console.error('Failed to create booking in MongoDB');
        return false;
      }
    } catch (error) {
      console.error('Error in createBooking:', error);
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
