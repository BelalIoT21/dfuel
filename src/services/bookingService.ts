
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { Booking } from '../types/database';
import { isWeb } from '../utils/platform';
import { Toast as toast } from '../../server/src/components/ui/toast';

type BookingWithMongoId = Booking & { _id?: string };
import { apiService } from './apiService';
import userDatabase from './userDatabase';

export class BookingService {
  // Get all bookings (admin only)
  async getAllBookings(): Promise<any[]> {
    try {
      console.log("BookingService.getAllBookings: Fetching all bookings");
      
      // Try MongoDB first if not in web environment
      if (!isWeb) {
        try {
          const bookings = await mongoDbService.getAllBookings();
          if (bookings && bookings.length > 0) {
            console.log("Retrieved all bookings from MongoDB:", bookings.length);
            // Add machine names if missing
            const bookingsWithNames = bookings.map(booking => {
              if (!booking.machineName) {
                booking.machineName = this.getMachineName(booking.machineId);
              }
              return booking;
            });
            return bookingsWithNames;
          }
        } catch (mongoError) {
          console.error("MongoDB error when fetching bookings:", mongoError);
        }
      }
      
      // Try API next
      try {
        const response = await apiService.getAllBookings();
        if (response && response.data) {
          console.log("Retrieved all bookings from API:", response.data.length);
          // Add machine names if missing
          const bookingsWithNames = response.data.map(booking => {
            if (!booking.machineName) {
              booking.machineName = this.getMachineName(booking.machineId);
            }
            return booking;
          });
          return bookingsWithNames;
        }
      } catch (apiError) {
        console.error("API error when fetching bookings:", apiError);
      }
      
      // As a last resort, use localStorage
      const bookings = localStorageService.getBookings();
      
      // Get all user bookings from all users
      const allUsers = localStorageService.getAllUsers();
      let userBookings: Booking[] = [];
      
      for (const user of allUsers) {
        if (user.bookings && Array.isArray(user.bookings) && user.bookings.length > 0) {
          // Add user data to each booking
          const bookingsWithUserInfo = user.bookings.map(booking => ({
            ...booking,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            machineName: booking.machineName || this.getMachineName(booking.machineId)
          }));
          
          userBookings = [...userBookings, ...bookingsWithUserInfo];
        }
      }
      
      // Merge with global bookings and deduplicate
      const allBookings = [...bookings];
      
      for (const userBooking of userBookings) {
        // Only add if not already in the array
        const exists = allBookings.some((b: BookingWithMongoId) =>  
          (b._id && b._id === (userBooking as BookingWithMongoId)._id)
        );
        
        if (!exists) {
          allBookings.push(userBooking);
        }
      }
      
      console.log("Retrieved all bookings merged from localStorage:", allBookings.length);
      
      // Make sure machine names are set correctly
      const bookingsWithNames = allBookings.map(booking => {
        if (!booking.machineName) {
          booking.machineName = this.getMachineName(booking.machineId || booking.machine);
        }
        return booking;
      });
      
      return bookingsWithNames;
    } catch (error) {
      console.error("Error in BookingService.getAllBookings:", error);
      return [];
    }
  }

  // Create a booking
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    console.log(`BookingService.createBooking: userId=${userId}, machineId=${machineId}, date=${date}, time=${time}`);
    
    try {
      // Check if this time slot is already booked
      const allBookings = await this.getAllBookings();
      const hasConflict = allBookings.some(booking => 
        booking.machineId === machineId && 
        booking.date === date && 
        booking.time === time &&
        (booking.status === 'Approved' || booking.status === 'Pending')
      );
      
      if (hasConflict) {
        toast({
          title: "Time Slot Unavailable",
          content: "This time slot has already been booked. Please select another time.",
          variant: "destructive"
        });
        return false;
      }
      
      // Try MongoDB first
      if (!isWeb) {
        try {
          // For MongoDB, we need to create a booking record and then add it to the user's bookings
          const booking = {
            machineId,
            date,
            time,
            status: 'Pending',
            createdAt: new Date().toISOString()
          };
          
          const success = await mongoDbService.addUserBooking(userId, booking);
          if (success) {
            toast({
              title: "Booking Submitted",
              content: "Your booking request has been submitted and is waiting for approval.",
            });
            return true;
          }
        } catch (mongoErr) {
          console.error("MongoDB error creating booking:", mongoErr);
        }
      }
      
      // Try API next
      try {
        const response = await apiService.addBooking(userId, machineId, date, time);
        if (response && response.data?.success) {
          toast({
            title: "Booking Submitted",
            content: "Your booking request has been submitted and is waiting for approval.",
          });
          return true;
        }
      } catch (apiErr) {
        console.error("API error creating booking:", apiErr);
      }
        
        try {
          const newBooking: Booking = {
            id: `booking-${Date.now()}`,
            machineId,
            date,
            time,
            status: 'Pending' as const,
          };

          // Get existing bookings and add the new one
          const existingBookings = localStorageService.getBookings();
          const bookings = [...existingBookings, newBooking];

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
            
            toast({
              title: "Booking Submitted",
              content: "Your booking request has been submitted and is waiting for approval.",
            });
          }
          
          return success;
        } catch (error) {
          console.error("Error in BookingService.createBooking local storage fallback:", error);
          toast({
            title: "Booking Failed",
            content: "There was an error processing your booking. Please try again.",
            variant: "destructive"
          });
          return false;
        }
    } catch (error) {
      console.error("Error in BookingService.createBooking:", error);
      toast({
        title: "Booking Failed",
        content: "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Get user bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    console.log(`BookingService.getUserBookings: userId=${userId}`);
    
    try {
      // Try MongoDB first if not in web environment
      if (!isWeb) {
        try {
          const mongoUser = await mongoDbService.getUserById(userId);
          if (mongoUser && mongoUser.bookings && mongoUser.bookings.length > 0) {
            console.log("Retrieved bookings from MongoDB:", mongoUser.bookings);
            return mongoUser.bookings;
          }
        } catch (mongoError) {
          console.error("MongoDB error when getting bookings:", mongoError);
        }
      }
      
      // Try getting from global bookings collection via API or localStorage
      try {
        const allBookings = await this.getAllBookings();
        console.log("Retrieved all bookings:", allBookings);
        
        const userBookings = allBookings.filter(booking => 
          booking.userId === userId || 
          booking.user === userId
        );
        
        console.log("Filtered user bookings:", userBookings);
        if (userBookings.length > 0) {
          return userBookings;
        }
      } catch (error) {
        console.error("Error filtering user bookings from all bookings:", error);
      }
      
      // Try API next
      try {
        const response = await apiService.getUserBookings(userId);
        if (response && response.data) {
          console.log("Retrieved bookings from API:", response.data);
          return response.data;
        }
      } catch (apiError) {
        console.error("API error when getting bookings:", apiError);
      }
      
      // Fall back to localStorage - checking user object directly
      const user = localStorageService.findUserById(userId);
      if (user && user.bookings && user.bookings.length > 0) {
        console.log("Retrieved bookings from user in localStorage:", user.bookings);
        return user.bookings;
      }
      
      // Final attempt - check bookings collection and filter by userId
      const bookings = localStorageService.getBookings();
      const userBookings = bookings.filter(booking => booking.userId === userId);
      console.log("Retrieved bookings from localStorage bookings collection:", userBookings);
      return userBookings;
    } catch (error) {
      console.error("Error in BookingService.getUserBookings:", error);
      return [];
    }
  }
  
  // Update booking status
  async updateBookingStatus(bookingId: string, status: 'Approved' | 'Rejected' | 'Completed' | 'Canceled'): Promise<boolean> {
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
              content: `The booking has been ${status.toLowerCase()} successfully.`,
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
        const response = await apiService.updateBookingStatus(bookingId, status);
        
        if (response && !response.error) {
          console.log("Successfully updated booking status via API");
          toast({
            title: `Booking ${status}`,
            content: `The booking has been ${status.toLowerCase()} successfully.`,
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
          let affectedUserId: string | null = null;
          
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
              content: `The booking has been ${status.toLowerCase()} successfully.`,
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
            content: `The booking has been ${status.toLowerCase()} successfully.`,
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
        content: "There was a problem updating the booking status.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error("Error in BookingService.updateBookingStatus:", error);
      toast({
        title: "Error",
        content: "There was a problem updating the booking status.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  
  // Helper method to get machine name from ID
  public getMachineName(machineId: string): string {
    const machineMap: { [key: string]: string } = {
      '1': 'Laser Cutter',
      '2': 'Ultimaker',
      '3': 'X1 E Carbon 3D Printer',
      '4': 'Bambu Lab X1 E',
      '5': 'Soldering Station',
      '6': 'Machine Safety Course'
    };
    
    return machineMap[machineId] || `Machine ${machineId}`;
  }
  
  // Clear all bookings for a specific user (for resetting)
  async clearUserBookings(userId: string): Promise<boolean> {
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
            content: "All bookings have been cleared for this user",
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
  async clearAllBookings(): Promise<boolean> {
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
          content: `Successfully cleared all bookings from the system. Total: ${count || 'all'}`,
        });
      } else {
        toast({
          title: "No Bookings to Clear",
          content: "There were no bookings to clear in the system.",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error clearing all bookings:", error);
      toast({
        title: "Error",
        content: "Failed to clear all bookings. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Delete a booking
  async deleteBooking(bookingId: string): Promise<boolean> {
    console.log(`BookingService.deleteBooking: bookingId=${bookingId}`);
    
    try {
      // Try using the userDatabase facade first (which tries MongoDB then localStorage)
      try {
        const success = await userDatabase.deleteBooking(bookingId);
        if (success) {
          console.log("Successfully deleted booking via userDatabase");
          toast({
            title: "Booking Deleted",
            content: "The booking has been successfully deleted."
          });
          return true;
        }
      } catch (dbError) {
        console.error("userDatabase error deleting booking:", dbError);
      }
      
      // If that fails, try MongoDB directly
      if (!isWeb) {
        try {
          const success = await mongoDbService.deleteBooking(bookingId);
          if (success) {
            console.log("Successfully deleted booking via MongoDB");
            toast({
              title: "Booking Deleted",
              content: "The booking has been successfully deleted."
            });
            return true;
          }
        } catch (mongoError) {
          console.error("MongoDB error deleting booking:", mongoError);
        }
      }
      
      // Try API next
      try {
        const response = await apiService.deleteBooking(bookingId);
        if (response && !response.error) {
          console.log("Successfully deleted booking via API");
          toast({
            title: "Booking Deleted",
            content: "The booking has been successfully deleted."
          });
          return true;
        }
      } catch (apiError) {
        console.error("API error deleting booking:", apiError);
      }
      
      // Finally try localStorage directly - FORCED DELETION APPROACH
      try {
        // Force delete from bookings collection
        const allBookings = localStorageService.getBookings();
        const updatedBookings = allBookings.filter((b) => 
          b.id !== bookingId && (b as BookingWithMongoId)._id !== bookingId
        );
        
        if (updatedBookings.length < allBookings.length) {
          localStorageService.saveBookings(updatedBookings);
          console.log(`Removed booking ${bookingId} from global bookings list`);
        }
        
        // Force delete from all users' bookings arrays
        const allUsers = localStorageService.getAllUsers();
        let foundInUser = false;
        
        for (const user of allUsers) {
          if (user.bookings && Array.isArray(user.bookings)) {
            const originalLength = user.bookings.length;
            const updatedUserBookings = user.bookings.filter(b => 
              b.id !== bookingId && (b as BookingWithMongoId)._id !== bookingId
            );
            
            if (updatedUserBookings.length < originalLength) {
              localStorageService.updateUser(user.id, { bookings: updatedUserBookings });
              console.log(`Removed booking ${bookingId} from user ${user.id}'s bookings`);
              foundInUser = true;
            }
          }
        }
        
        // If we made any changes, consider it a success
        if (updatedBookings.length < allBookings.length || foundInUser) {
          toast({
            title: "Booking Deleted",
            content: "The booking has been successfully deleted."
          });
          return true;
        }
      } catch (storageError) {
        console.error("LocalStorage error deleting booking:", storageError);
      }
      
      // If we get here, all methods failed
      console.error(`Failed to delete booking ${bookingId} after trying all methods`);
      toast({
        title: "Error",
        content: "Failed to delete the booking. Please refresh and try again.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error("Error in BookingService.deleteBooking:", error);
      toast({
        title: "Error",
        content: "There was a problem deleting the booking.",
        variant: "destructive"
      });
      return false;
    }
  }
}

// Create a singleton instance
export const bookingService = new BookingService();
