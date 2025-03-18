
import { apiService } from './apiService';
import { localStorageService } from './localStorageService';
import mongoDbService from './mongoDbService';
import { toast } from '@/components/ui/use-toast';
import { isWeb } from '../utils/platform';

class BookingService {
  async getAllBookings() {
    try {
      console.log('BookingService.getAllBookings: Fetching all bookings');
      
      if (isWeb) {
        const response = await apiService.getAllBookings();
        if (response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch bookings');
      }
      
      // Use mongoDbService for direct MongoDB access
      return await mongoDbService.getAllBookings();
    } catch (apiError) {
      console.error('API error fetching all bookings:', apiError);
      
      try {
        // Fallback to localStorage
        const bookings = localStorageService.getBookings();
        return bookings || [];
      } catch (error) {
        console.error('Error in getAllBookings:', error);
        return [];
      }
    }
  }

  async getUserBookings(userId) {
    try {
      console.log(`BookingService.getUserBookings: Fetching bookings for user ${userId}`);
      
      if (isWeb) {
        const response = await apiService.getUserBookings();
        if (response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch user bookings');
      }
      
      // Use mongoDbService for direct MongoDB access
      return await mongoDbService.getUserBookings(userId);
    } catch (apiError) {
      console.error('API error fetching user bookings:', apiError);
      
      try {
        // Fallback to localStorage
        const bookings = localStorageService.getBookings();
        return bookings.filter(booking => booking.userId === userId);
      } catch (error) {
        console.error('Error in getUserBookings:', error);
        return [];
      }
    }
  }

  async createBooking(userId, machineId, date, time) {
    console.log(`BookingService.createBooking: Creating booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
    
    try {
      if (isWeb) {
        const response = await apiService.createBooking(machineId, date, time);
        if (response.data && response.data.success) {
          return true;
        }
        throw new Error('Failed to create booking through API');
      }
      
      // Use mongoDbService for direct MongoDB access
      return await mongoDbService.createBooking(userId, machineId, date, time);
    } catch (apiError) {
      console.error('API error creating booking:', apiError);
      
      try {
        // Fallback to localStorage
        const bookings = localStorageService.getBookings();
        
        // Create new booking
        const newBooking = {
          id: `booking-${Date.now()}`,
          userId,
          machineId,
          date,
          time,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        
        bookings.push(newBooking);
        localStorageService.saveBookings(bookings);
        
        toast({
          title: "Booking Created",
          description: "Your booking has been saved to local storage",
        });
        
        return true;
      } catch (error) {
        console.error('Error in createBooking:', error);
        return false;
      }
    }
  }

  async cancelBooking(bookingId) {
    try {
      console.log(`BookingService.cancelBooking: Canceling booking ${bookingId}`);
      
      if (isWeb) {
        const response = await apiService.cancelBooking(bookingId);
        if (response.data && response.data.success) {
          return true;
        }
        throw new Error('Failed to cancel booking through API');
      }
      
      // Use mongoDbService for direct MongoDB access
      return await mongoDbService.updateBookingStatus(bookingId, 'Canceled');
    } catch (apiError) {
      console.error('API error canceling booking:', apiError);
      
      try {
        // Fallback to localStorage
        const bookings = localStorageService.getBookings();
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: 'Canceled' } : booking
        );
        
        localStorageService.saveBookings(updatedBookings);
        return true;
      } catch (error) {
        console.error('Error in cancelBooking:', error);
        return false;
      }
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      console.log(`BookingService.updateBookingStatus: Updating booking ${bookingId} to ${status}`);
      
      if (isWeb) {
        const response = await apiService.updateBookingStatus(bookingId, status);
        if (response.data && response.data.success) {
          return true;
        }
        throw new Error('Failed to update booking status through API');
      }
      
      // Use mongoDbService for direct MongoDB access
      return await mongoDbService.updateBookingStatus(bookingId, status);
    } catch (apiError) {
      console.error('API error updating booking status:', apiError);
      
      try {
        // Fallback to localStorage
        const bookings = localStorageService.getBookings();
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        );
        
        localStorageService.saveBookings(updatedBookings);
        return true;
      } catch (error) {
        console.error('Error in updateBookingStatus:', error);
        return false;
      }
    }
  }

  async deleteBooking(bookingId) {
    try {
      console.log(`BookingService.deleteBooking: Deleting booking ${bookingId}`);
      
      if (isWeb) {
        const response = await apiService.deleteBooking(bookingId);
        if (response.status === 200) {
          return true;
        }
        throw new Error('Failed to delete booking through API');
      }
      
      // Use mongoDbService for direct MongoDB access
      return await mongoDbService.deleteBooking(bookingId);
    } catch (apiError) {
      console.error('API error deleting booking:', apiError);
      
      try {
        // Fallback to localStorage
        const bookings = localStorageService.getBookings();
        const filteredBookings = bookings.filter(booking => booking.id !== bookingId);
        
        if (filteredBookings.length === bookings.length) {
          // No booking was found with that ID
          return false;
        }
        
        localStorageService.saveBookings(filteredBookings);
        return true;
      } catch (error) {
        console.error('Error in deleteBooking:', error);
        return false;
      }
    }
  }
}

export const bookingService = new BookingService();
