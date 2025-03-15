
import { apiService } from '../apiService';
import { BaseService } from './baseService';
import { userDatabaseService } from './userService';
import { isWeb } from '../../utils/platform';
import mongoDbService from '../mongoDbService';
import { toast } from '../../components/ui/use-toast';
import { localStorageService } from '../localStorageService';

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
      
      // Check if this is a client-generated ID
      const isClientId = bookingId.startsWith('booking-');
      
      // Try API first with the appropriate endpoint format
      try {
        const endpoint = isClientId
          ? `bookings/${bookingId}/status`
          : `bookings/${bookingId}/status`;
          
        const response = await apiService.request(endpoint, 'PUT', { status });
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
      
      // Direct local storage access for client-generated IDs
      if (isClientId) {
        try {
          const users = await localStorageService.getAll('users');
          let updated = false;
          
          for (const user of users) {
            if (user.bookings && Array.isArray(user.bookings)) {
              const bookingIndex = user.bookings.findIndex(b => b.id === bookingId);
              if (bookingIndex >= 0) {
                user.bookings[bookingIndex].status = status;
                await localStorageService.update('users', user.id, user);
                console.log(`Updated booking ${bookingId} status to ${status} in local storage`);
                updated = true;
                break;
              }
            }
          }
          
          if (updated) {
            return true;
          }
        } catch (storageError) {
          console.error("Error accessing local storage:", storageError);
        }
      }
      
      // Finally try local users and their bookings
      const allUsers = await userDatabaseService.getAllUsers();
      
      let updated = false;
      for (const user of allUsers) {
        if (user.bookings) {
          const bookingIndex = user.bookings.findIndex(b => b.id === bookingId);
          if (bookingIndex >= 0) {
            user.bookings[bookingIndex].status = status;
            
            // Update the user in memory
            await userDatabaseService.updateUser(user.id, user);
            console.log(`Updated booking ${bookingId} status to ${status} in memory`);
            updated = true;
            break;
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
              machineName: this.getMachineName(booking.machineId), // Use helper method to get proper machine name
              machineType: this.getMachineType(booking.machineId),
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
  
  // Helper method to get machine name by ID
  private getMachineName(machineId: string): string {
    const machines = [
      { id: '1', name: 'Laser Cutter' },
      { id: '2', name: 'Ultimaker' },
      { id: '3', name: 'X1 E Carbon 3D Printer' },
      { id: '4', name: 'Bambu Lab X1 E' },
      { id: '5', name: 'Soldering Station' }
    ];
    
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : `Machine ${machineId}`;
  }
  
  // Helper method to get machine type by ID
  private getMachineType(machineId: string): string {
    const machines = [
      { id: '1', type: 'Cutting' },
      { id: '2', type: 'Printing' },
      { id: '3', type: 'Printing' },
      { id: '4', type: 'Printing' },
      { id: '5', type: 'Electronics' }
    ];
    
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.type : 'Unknown Type';
  }
}

// Create a singleton instance
export const bookingDatabaseService = new BookingDatabaseService();
