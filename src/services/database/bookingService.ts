import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';
import { isWeb } from '../../utils/platform';
import mongoDbService from '../mongoDbService';
import { toast } from '../../components/ui/use-toast';

/**
 * Service that handles all booking-related database operations.
 */
export class BookingDatabaseService extends BaseService {
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      console.log(`Attempting to create booking: userId=${userId}, machineId=${machineId}, date=${date}, time=${time}`);
      
      // First try to save directly to MongoDB if not in web environment
      if (!isWeb) {
        try {
          console.log("Attempting to save booking directly to MongoDB");
          const success = await mongoDbService.addUserBooking(userId, {
            id: `booking-${Date.now()}`,
            machineId,
            date,
            time,
            status: 'Pending'
          });
          
          if (success) {
            console.log("Booking saved successfully to MongoDB");
            return true;
          }
        } catch (mongoError) {
          console.error("MongoDB error, will try API next:", mongoError);
        }
      }
      
      // Next try the API
      try {
        const response = await apiService.request('bookings', 'POST', { 
          userId,
          machineId, 
          date, 
          time 
        });
        
        if (response.data) {
          console.log("Booking created successfully via API:", response.data);
          return true;
        }
      } catch (apiError) {
        console.error("API error, falling back to memory store:", apiError);
      }
      
      // Use in-memory fallback as last resort
      console.log("Using in-memory fallback for booking");
      
      // Memory fallback
      const user = await userDatabaseService.findUserById(userId);
      if (user) {
        if (!user.bookings) {
          user.bookings = [];
        }
        
        const booking = {
          id: `booking-${Date.now()}`,
          machineId,
          date,
          time,
          status: 'Pending' as const
        };
        
        user.bookings.push(booking);
        console.log("Booking saved in memory:", booking);
        
        // Show toast notification about fallback
        if (!isWeb) {
          toast({
            title: "Booking saved locally",
            description: "Your booking has been saved locally and is pending approval.",
            variant: "default"
          });
        }
        
        return true;
      }
      
      console.error("Could not find user to add booking to");
      return false;
    } catch (error) {
      console.error("Fatal error in addBooking:", error);
      return false;
    }
  }

  async getUserBookings(userId: string) {
    try {
      console.log(`Getting bookings for user ${userId}`);
      
      // First try API
      try {
        const response = await apiService.request('bookings', 'GET');
        if (response && response.data) {
          console.log("Retrieved bookings from API:", response.data.length);
          return response.data;
        }
      } catch (apiError) {
        console.error("API error when getting bookings:", apiError);
      }
      
      // Then try to get bookings from MongoDB if not in web environment
      if (!isWeb) {
        try {
          const user = await mongoDbService.getUserById(userId);
          if (user && user.bookings && user.bookings.length > 0) {
            console.log("Retrieved bookings from MongoDB:", user.bookings);
            return user.bookings;
          }
        } catch (mongoError) {
          console.error("MongoDB error when getting bookings:", mongoError);
        }
      }
      
      // For web environment or as fallback, use memory store
      const user = await userDatabaseService.findUserById(userId);
      console.log("Retrieved bookings from memory:", user?.bookings?.length || 0);
      return user?.bookings || [];
    } catch (error) {
      console.error("Error getting user bookings:", error);
      return [];
    }
  }
  
  async updateBookingStatus(bookingId: string, status: 'Approved' | 'Rejected' | 'Completed' | 'Canceled'): Promise<boolean> {
    try {
      console.log(`Updating booking ${bookingId} status to ${status}`);
      
      // Try API first
      try {
        const response = await apiService.request(`bookings/${bookingId}/status`, 'PUT', { status });
        if (response && !response.error) {
          console.log("Booking status updated via API:", response.data);
          return true;
        }
      } catch (apiError) {
        console.error("API error when updating booking status:", apiError);
      }
      
      // Then try MongoDB directly if not in web environment
      if (!isWeb) {
        try {
          const success = await mongoDbService.updateBookingStatus(bookingId, status);
          if (success) {
            console.log("Booking status updated in MongoDB");
            return true;
          }
        } catch (mongoError) {
          console.error("MongoDB error when updating booking status:", mongoError);
        }
      }
      
      // Finally try local storage - find the booking in all users
      const allUsers = await userDatabaseService.getAllUsers();
      
      let updated = false;
      for (const user of allUsers) {
        if (user.bookings) {
          const bookingIndex = user.bookings.findIndex(b => b.id === bookingId);
          if (bookingIndex >= 0) {
            user.bookings[bookingIndex].status = status;
            
            // Update the user in local storage
            const usersCopy = await this.getItem('users') || [];
            const userIndex = usersCopy.findIndex((u: any) => u.id === user.id);
            if (userIndex >= 0) {
              usersCopy[userIndex] = user;
              await this.setItem('users', usersCopy);
              console.log("Booking status updated in local storage");
              updated = true;
              break;
            }
          }
        }
      }
      
      if (!updated) {
        console.error("Could not find booking to update status");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating booking status:", error);
      return false;
    }
  }
  
  async getAllPendingBookings(): Promise<any[]> {
    try {
      console.log("Getting all bookings");
      
      // Try API first
      try {
        const response = await apiService.request('bookings/all', 'GET');
        if (response && response.data) {
          console.log("Retrieved all bookings from API:", response.data.length);
          return response.data;
        }
      } catch (apiError) {
        console.error("API error when getting all bookings:", apiError);
      }
      
      // Fall back to local users and their bookings
      const allUsers = await userDatabaseService.getAllUsers();
      const allBookings = [];
      
      for (const user of allUsers) {
        if (user.bookings && user.bookings.length > 0) {
          for (const booking of user.bookings) {
            allBookings.push({
              ...booking,
              userName: user.name,
              userEmail: user.email,
              userId: user.id,
              // Add additional fields to match MongoDB response format
              _id: booking.id,
              machineName: `Machine ${booking.machineId}`, // Provide a default machine name
              machineType: 'Unknown Type',
            });
          }
        }
      }
      
      console.log("Retrieved all bookings from local storage:", allBookings.length);
      return allBookings;
    } catch (error) {
      console.error("Error getting all bookings:", error);
      return [];
    }
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
