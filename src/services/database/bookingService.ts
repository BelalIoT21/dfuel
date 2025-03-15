
import { apiService } from '../apiService';
import { localStorageService } from '../localStorageService';
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
      console.error("API error, falling back to localStorage booking:", error);
      
      // Fallback to localStorage
      try {
        const bookings = localStorageService.getBookings();
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
        
        // Update the bookings
        const success = localStorageService.saveBookings(bookings);
        
        // Update the user
        const user = localStorageService.findUserById(userId);
        if (user && success) {
          if (!user.bookings) {
            user.bookings = [];
          }
          user.bookings.push(newBooking);
          localStorageService.updateUser(userId, { bookings: user.bookings });
        }
        
        return success;
      } catch (storageError) {
        console.error("LocalStorage error:", storageError);
        toast({
          title: "Error",
          description: "Failed to add booking",
          variant: "destructive"
        });
        return false;
      }
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
      console.error("API error, falling back to localStorage bookings:", error);
      
      // Fallback to localStorage
      const bookings = localStorageService.getBookings();
      return bookings.filter(booking => booking.userId === userId);
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
      console.error("API error, falling back to localStorage bookings:", error);
      
      // Fallback to localStorage
      const bookings = localStorageService.getBookings();
      console.log("Retrieved all bookings from local storage:", bookings.length);
      console.log("Retrieved all bookings from local database:", bookings.length);
      return bookings;
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    console.log(`Updating booking ${bookingId} status to ${status}`);
    try {
      // First, try the API
      const response = await apiService.updateBookingStatus(bookingId, status);
      if (response.data && !response.error) {
        console.log("Successfully updated booking status via API");
        return true;
      }
      
      throw new Error('Failed to update booking status through API');
    } catch (apiError) {
      console.error("API error accessing booking:", apiError);
      
      try {
        // Try localStorage fallback
        console.log("Trying localStorage fallback for booking status update");
        const success = localStorageService.updateBookingStatus(bookingId, status);
        
        if (success) {
          console.log("Successfully updated booking status in localStorage");
          
          // Now update the user's booking list
          const bookings = localStorageService.getBookings();
          const booking = bookings.find(b => b.id === bookingId);
          
          if (booking) {
            const user = localStorageService.findUserById(booking.userId);
            if (user && user.bookings) {
              const updatedBookings = user.bookings.map(b => 
                b.id === bookingId ? { ...b, status } : b
              );
              
              localStorageService.updateUser(booking.userId, { bookings: updatedBookings });
            }
          }
          
          return true;
        }
        
        throw new Error('Failed to update booking status in localStorage');
      } catch (storageError) {
        console.error("Error accessing local storage:", storageError);
        
        // Final attempt: Directly manipulate the in-memory data if possible
        try {
          const allUsers = localStorageService.getAllUsers();
          for (const user of allUsers) {
            if (user.bookings) {
              const bookingIndex = user.bookings.findIndex(b => b.id === bookingId);
              if (bookingIndex !== -1) {
                user.bookings[bookingIndex].status = status;
                localStorageService.updateUser(user.id, { bookings: user.bookings });
                console.log(`Updated booking status directly in user ${user.id}`);
                return true;
              }
            }
          }
          
          throw new Error('Could not find booking in any user');
        } catch (finalError) {
          console.error("Error updating booking status:", finalError);
          toast({
            title: "Error",
            description: "Failed to update booking status",
            variant: "destructive"
          });
          return false;
        }
      }
    }
  }
  
  async cancelBooking(bookingId: string): Promise<boolean> {
    return this.updateBookingStatus(bookingId, 'Canceled');
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
