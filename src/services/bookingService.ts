
import { apiService } from './apiService';
import mongoDbService from './mongoDbService';
import { toast } from '@/components/ui/use-toast';
import { isWeb } from '@/utils/platform';

class BookingService {
  async getAllBookings() {
    try {
      console.log("BookingService.getAllBookings: Fetching all bookings");
      
      // Get token directly from localStorage to avoid dependency issues
      const token = isWeb() ? localStorage.getItem('token') : null;
      apiService.setToken(token);
      
      // Try API first
      try {
        const response = await apiService.getAllBookings();
        if (response.data) {
          console.log(`Found ${response.data.length} bookings via API`);
          return response.data;
        }
      } catch (error) {
        console.error("API error fetching all bookings:", error);
      }
      
      // Fallback to MongoDB direct access
      try {
        const bookings = await mongoDbService.getAllBookings();
        console.log(`Found ${bookings.length} bookings in MongoDB`);
        return bookings;
      } catch (error) {
        console.error("Error in getAllBookings:", error);
        return [];
      }
    } catch (error) {
      console.error("Error in getAllBookings:", error);
      return [];
    }
  }
  
  async getUserBookings(userId) {
    try {
      console.log(`BookingService.getUserBookings: Fetching bookings for user ${userId}`);
      
      // Get token directly from localStorage to avoid dependency issues
      const token = isWeb() ? localStorage.getItem('token') : null;
      apiService.setToken(token);
      
      // Try API first
      try {
        const response = await apiService.getUserBookings(userId);
        if (response.data) {
          console.log(`Found ${response.data.length} user bookings via API`);
          return response.data;
        }
      } catch (error) {
        console.error("API error fetching user bookings:", error);
      }
      
      // Fallback to MongoDB direct access
      try {
        const bookings = await mongoDbService.getUserBookings(userId);
        console.log(`Found ${bookings.length} user bookings in MongoDB`);
        return bookings;
      } catch (error) {
        console.error("Error in getUserBookings:", error);
        return [];
      }
    } catch (error) {
      console.error("Error in getUserBookings:", error);
      return [];
    }
  }

  async createBooking(userId, machineId, date, time) {
    try {
      console.log(`BookingService.createBooking: Creating booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
      
      // Get machine name from machine service
      let machineName = '';
      try {
        const machineData = await apiService.getMachineById(machineId);
        if (machineData.data) {
          machineName = machineData.data.name;
          console.log(`Found machine name: ${machineName}`);
        }
      } catch (error) {
        console.error("Error getting machine name:", error);
      }
      
      // Get user's name
      let userName = '';
      try {
        const userData = await apiService.getUserById(userId);
        if (userData.data) {
          userName = userData.data.name || `${userData.data.firstName} ${userData.data.lastName}`.trim();
          console.log(`Found user name: ${userName}`);
        }
      } catch (error) {
        console.error("Error getting user name:", error);
      }
      
      // Get token directly from localStorage to avoid dependency issues
      const token = isWeb() ? localStorage.getItem('token') : null;
      apiService.setToken(token);
      
      // Try API first
      try {
        const response = await apiService.post(
          'bookings', 
          { 
            machineId, 
            date, 
            time,
            userName,
            machineName 
          }
        );
        
        if (response.data && response.data.success) {
          console.log("Successfully created booking via API");
          return true;
        }
      } catch (error) {
        console.error("API error creating booking:", error);
      }
      
      // Fallback to MongoDB direct access
      try {
        const success = await mongoDbService.createBooking(userId, machineId, date, time, userName, machineName);
        console.log(`MongoDB booking creation ${success ? 'successful' : 'failed'}`);
        return success;
      } catch (error) {
        console.error("Error in createBooking:", error);
        return false;
      }
    } catch (error) {
      console.error("Error in createBooking:", error);
      return false;
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      console.log(`BookingService.updateBookingStatus: Updating booking ${bookingId} to ${status}`);
      
      // Get token directly from localStorage to avoid dependency issues
      const token = isWeb() ? localStorage.getItem('token') : null;
      apiService.setToken(token);
      
      // Try API first
      try {
        const response = await apiService.updateBookingStatus(bookingId, status);
        if (response.data) {
          console.log("Successfully updated booking status via API");
          return true;
        }
      } catch (error) {
        console.error("API error updating booking status:", error);
      }
      
      // Fallback to MongoDB direct access
      try {
        const success = await mongoDbService.updateBookingStatus(bookingId, status);
        console.log(`MongoDB booking status update ${success ? 'successful' : 'failed'}`);
        return success;
      } catch (error) {
        console.error("Error in updateBookingStatus:", error);
        return false;
      }
    } catch (error) {
      console.error("Error in updateBookingStatus:", error);
      return false;
    }
  }

  async cancelBooking(bookingId) {
    try {
      console.log(`BookingService.cancelBooking: Canceling booking ${bookingId}`);
      
      // Get token directly from localStorage to avoid dependency issues
      const token = isWeb() ? localStorage.getItem('token') : null;
      apiService.setToken(token);
      
      // Try API first
      try {
        const response = await apiService.cancelBooking(bookingId);
        if (response.data) {
          console.log("Successfully canceled booking via API");
          return true;
        }
      } catch (error) {
        console.error("API error canceling booking:", error);
      }
      
      // Fallback to MongoDB direct access
      try {
        const success = await mongoDbService.updateBookingStatus(bookingId, 'Canceled');
        console.log(`MongoDB booking cancellation ${success ? 'successful' : 'failed'}`);
        return success;
      } catch (error) {
        console.error("Error in cancelBooking:", error);
        return false;
      }
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      return false;
    }
  }
}

export const bookingService = new BookingService();
