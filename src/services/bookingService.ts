import { apiService } from './apiService';
import { localStorageService } from './localStorageService';
import mongoDbService from './mongoDbService';
import { machineService } from './machineService';
import { isWeb } from '../utils/platform';
import userDatabase from './userDatabase';

export class BookingService {
  // Get all bookings (admin only)
  async getAllBookings() {
    try {
      console.log("BookingService.getAllBookings: Fetching all bookings");
      
      // Try to get from MongoDB first (if available)
      try {
        const mongoBookings = await mongoDbService.getAllBookings();
        if (mongoBookings && mongoBookings.length > 0) {
          console.log(`Found ${mongoBookings.length} bookings in MongoDB`);
          return mongoBookings;
        }
      } catch (mongoError) {
        console.error("Error fetching bookings from MongoDB:", mongoError);
      }
      
      // Try to get from API
      try {
        const token = localStorageService.getItem('token');
        apiService.setToken(token);
        const response = await apiService.get('bookings/all');
        if (response.data) {
          console.log(`Found ${response.data.length} bookings via API`);
          return response.data;
        }
      } catch (apiError) {
        console.error("API error fetching all bookings:", apiError);
      }
      
      // Fallback to localStorage
      const bookings = localStorageService.getItem('bookings') || [];
      console.log(`Found ${bookings.length} bookings in localStorage`);
      return bookings;
    } catch (error) {
      console.error("Error in getAllBookings:", error);
      return [];
    }
  }

  // Get user bookings
  async getUserBookings(userId) {
    try {
      console.log(`BookingService.getUserBookings: Fetching bookings for user ${userId}`);
      
      let bookings = [];
      
      // Try to get from MongoDB first (if available)
      if (!isWeb) {
        try {
          const mongoBookings = await mongoDbService.getUserBookings(userId);
          if (mongoBookings && mongoBookings.length > 0) {
            console.log(`Found ${mongoBookings.length} bookings for user ${userId} in MongoDB`);
            return mongoBookings;
          }
        } catch (mongoError) {
          console.error("Error fetching user bookings from MongoDB:", mongoError);
        }
      }
      
      // Try to get from API
      try {
        const token = localStorageService.getItem('token');
        apiService.setToken(token);
        const response = await apiService.get('bookings');
        if (response.data) {
          console.log(`Found ${response.data.length} bookings for user via API`);
          bookings = response.data;
        }
      } catch (apiError) {
        console.error("API error fetching user bookings:", apiError);
        // If API fails, try localStorage
        const allBookings = localStorageService.getItem('bookings') || [];
        bookings = allBookings.filter(booking => booking.userId === userId);
        console.log(`Retrieved bookings from localStorage bookings collection:`, bookings);
      }
      
      console.log(`Refreshed bookings from service:`, bookings);
      
      // Enrich bookings with machine names if they're missing
      const enrichedBookings = await this.enrichBookingsWithMachineNames(bookings);
      
      return enrichedBookings;
    } catch (error) {
      console.error("Error in getUserBookings:", error);
      return [];
    }
  }

  // Helper to add machine names to bookings
  async enrichBookingsWithMachineNames(bookings) {
    try {
      const enrichedBookings = [...bookings];
      
      for (let i = 0; i < enrichedBookings.length; i++) {
        const booking = enrichedBookings[i];
        
        // Skip if we already have a machine name
        if (booking.machineName) {
          continue;
        }
        
        // Get the machine ID from the booking
        const machineId = booking.machineId || booking.machine;
        
        if (machineId) {
          try {
            // Get machine details
            const machine = await machineService.getMachineById(machineId);
            if (machine && machine.name) {
              enrichedBookings[i] = {
                ...booking,
                machineName: machine.name
              };
            }
          } catch (error) {
            console.error(`Error fetching machine ${machineId} details:`, error);
          }
        }
      }
      
      return enrichedBookings;
    } catch (error) {
      console.error("Error enriching bookings with machine names:", error);
      return bookings;
    }
  }

  // Create booking
  async createBooking(userId, machineId, date, time) {
    try {
      console.log(`BookingService.createBooking: Creating booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
      
      // Create client-side ID for easier reference
      const clientId = `booking-${Date.now()}`;
      
      // Try to create in MongoDB first (if available)
      if (!isWeb) {
        try {
          const mongoSuccess = await mongoDbService.createBooking(userId, machineId, date, time);
          if (mongoSuccess) {
            console.log("Successfully created booking in MongoDB");
            return true;
          }
        } catch (mongoError) {
          console.error("Error creating booking in MongoDB:", mongoError);
        }
      }
      
      // Try to create via API
      try {
        const token = localStorageService.getItem('token');
        apiService.setToken(token);
        
        // Try to get machine details for the booking
        let machineName = "Unknown Machine";
        try {
          const machine = await machineService.getMachineById(machineId);
          if (machine && machine.name) {
            machineName = machine.name;
          }
        } catch (machineError) {
          console.error(`Error fetching machine ${machineId} details:`, machineError);
        }
        
        // Create booking via API
        const response = await apiService.post('bookings', {
          machineId,
          date,
          time,
          clientId,
          machineName
        });
        
        if (response.data && response.data.success) {
          console.log("Successfully created booking via API");
          return true;
        }
      } catch (apiError) {
        console.error("API error creating booking:", apiError);
        
        // If API fails, create in localStorage
        const existingBookings = localStorageService.getItem('bookings') || [];
        
        // Try to get machine details for the booking
        let machineName = "Unknown Machine";
        try {
          const machine = await machineService.getMachineById(machineId);
          if (machine && machine.name) {
            machineName = machine.name;
          }
        } catch (machineError) {
          console.error(`Error fetching machine ${machineId} details:`, machineError);
        }
        
        // Create new booking
        const newBooking = {
          id: clientId,
          userId,
          machineId,
          date,
          time,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          machineName
        };
        
        existingBookings.push(newBooking);
        localStorageService.setItem('bookings', existingBookings);
        console.log("Created booking in localStorage:", newBooking);
        return true;
      }
      
      console.error("All booking creation methods failed");
      return false;
    } catch (error) {
      console.error("Error in createBooking:", error);
      return false;
    }
  }

  // Delete booking
  async deleteBooking(bookingId) {
    try {
      console.log(`BookingService.deleteBooking: bookingId=${bookingId}`);
      
      // Try to delete from MongoDB first
      try {
        const mongoSuccess = await mongoDbService.deleteBooking(bookingId);
        if (mongoSuccess) {
          console.log(`Successfully deleted booking ${bookingId} from MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error("MongoDB delete booking error:", mongoError);
      }
      
      // Try to delete via API
      try {
        const token = localStorageService.getItem('token');
        apiService.setToken(token);
        const response = await apiService.delete(`bookings/${bookingId}`);
        
        if (response.status === 200) {
          console.log(`Successfully deleted booking ${bookingId} via API`);
          return true;
        }
      } catch (apiError) {
        console.error(`API error deleting booking ${bookingId}:`, apiError);
      }
      
      // If API and MongoDB fails, delete from localStorage
      const existingBookings = localStorageService.getItem('bookings') || [];
      const updatedBookings = existingBookings.filter(booking => booking.id !== bookingId);
      
      if (updatedBookings.length < existingBookings.length) {
        localStorageService.setItem('bookings', updatedBookings);
        console.log(`Removed booking ${bookingId} from global bookings list`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error in deleteBooking for ${bookingId}:`, error);
      return false;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    console.log(`BookingService.updateBookingStatus: bookingId=${bookingId}, status=${status}`);
    
    try {
      // First try MongoDB directly if not in web environment
      if (!isWeb) {
        try {
          const success = await mongoDbService.updateBookingStatus(bookingId, status);
          if (success) {
            console.log("Booking status updated via MongoDB");
            toast({
              title: `Booking ${status}`,
              description: `The booking has been ${status.toLowerCase()} successfully.`,
              variant: status === 'Approved' ? 'default' : 'destructive',
            });
            return true;
          }
        } catch (mongoError) {
          console.error("MongoDB error when updating booking status:", mongoError);
        }
      }
      
      // Try API next
      try {
        // Use the appropriate endpoint format based on ID type
        const isClientId = bookingId.startsWith('booking-');
        const endpoint = isClientId 
          ? `bookings/${bookingId}/status` 
          : `bookings/${bookingId}/status`;
          
        const response = await apiService.request(endpoint, 'PUT', { status });
        
        if (response && !response.error) {
          console.log("Successfully updated booking status via API");
          toast({
            title: `Booking ${status}`,
            description: `The booking has been ${status.toLowerCase()} successfully.`,
            variant: status === 'Approved' ? 'default' : 'destructive',
          });
          return true;
        }
      } catch (apiError) {
        console.error("API request failed, trying localStorage", apiError);
      }
      
      // As a last resort, try to update in local storage
      const isClientId = bookingId.startsWith('booking-');
      if (isClientId) {
        try {
          // Get all users from local storage
          const users = localStorageService.getAllUsers();
          
          // Find the user with this booking
          let updated = false;
          let affectedUserId = null;
          
          for (let user of users) {
            if (user.bookings && Array.isArray(user.bookings)) {
              const bookingIndex = user.bookings.findIndex(b => b.id === bookingId);
              if (bookingIndex >= 0) {
                // Update booking status
                user.bookings[bookingIndex].status = status;
                // Save user back to local storage
                localStorageService.updateUser(user.id, user);
                updated = true;
                affectedUserId = user.id;
                break;
              }
            }
          }
          
          // Also update in the separate bookings collection
          const bookings = localStorageService.getBookings();
          const bookingIndex = bookings.findIndex(b => b.id === bookingId);
          
          if (bookingIndex >= 0) {
            bookings[bookingIndex].status = status;
            localStorageService.saveBookings(bookings);
            updated = true;
          }
          
          if (updated) {
            console.log("Booking status updated in local storage");
            toast({
              title: `Booking ${status}`,
              description: `The booking has been ${status.toLowerCase()} successfully.`,
              variant: status === 'Approved' ? 'default' : 'destructive',
            });
            return true;
          }
        } catch (storageError) {
          console.error("Local storage error when updating booking status:", storageError);
        }
      }
      
      // Also update in bookings collection
      try {
        const success = localStorageService.updateBookingStatus(bookingId, status);
        if (success) {
          toast({
            title: `Booking ${status}`,
            description: `The booking has been ${status.toLowerCase()} successfully.`,
            variant: status === 'Approved' ? 'default' : 'destructive',
          });
          return true;
        }
      } catch (error) {
        console.error("Error updating booking status in bookings collection:", error);
      }
      
      console.error("All attempts to update booking status failed");
      toast({
        title: "Error",
        description: "There was a problem updating the booking status.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error("Error in BookingService.updateBookingStatus:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the booking status.",
        variant: "destructive"
      });
      return false;
    }
  }

  // Clear all bookings for a specific user (for resetting)
  async clearUserBookings(userId) {
    console.log(`BookingService.clearUserBookings: userId=${userId}`);
    try {
      // Try clearing from local storage first
      const user = await localStorageService.findUserById(userId);
      if (user) {
        user.bookings = [];
        const success = await localStorageService.updateUser(userId, user);
        
        if (success) {
          toast({
            title: "Bookings Reset",
            description: "All bookings have been cleared for this user",
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error clearing user bookings:", error);
      return false;
    }
  }

  // Clear all bookings in the system (admin only)
  async clearAllBookings() {
    console.log(`BookingService.clearAllBookings: Attempting to clear all bookings`);
    try {
      // Try MongoDB first
      let success = false;
      let count = 0;
      
      try {
        count = await mongoDbService.clearAllBookings();
        success = count > 0;
        console.log(`MongoDB clearAllBookings result: ${count} bookings cleared`);
      } catch (mongoError) {
        console.error("MongoDB error clearing all bookings:", mongoError);
      }
      
      // If MongoDB fails or is not available, try localStorage
      if (!success) {
        // Get all users and clear their bookings
        const users = localStorageService.getAllUsers();
        let totalCleared = 0;
        
        for (const user of users) {
          if (user.bookings && user.bookings.length > 0) {
            totalCleared += user.bookings.length;
            user.bookings = [];
            await localStorageService.updateUser(user.id, { bookings: [] });
          }
        }
        
        // Also clear the separate bookings collection
        localStorageService.saveBookings([]);
        
        console.log(`Cleared ${totalCleared} bookings from localStorage`);
        success = totalCleared > 0;
      }
      
      if (success) {
        toast({
          title: "All Bookings Cleared",
          description: `Successfully cleared all bookings from the system. Total: ${count || 'all'}`,
        });
      } else {
        toast({
          title: "No Bookings to Clear",
          description: "There were no bookings to clear in the system.",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error clearing all bookings:", error);
      toast({
        title: "Error",
        description: "Failed to clear all bookings. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
}

export const bookingService = new BookingService();
