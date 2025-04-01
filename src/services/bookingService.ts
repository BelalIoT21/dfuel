import { apiService } from './apiService';
import { machineService } from './machineService';
import mongoDbService from './mongoDbService';
import { toast } from '@/hooks/use-toast';

class BookingService {
  async getAllBookings() {
    try {
      console.log('Fetching all bookings');
      const response = await apiService.getAllBookings();
      
      if (response.error) {
        console.error('Error fetching all bookings:', response.error);
        return [];
      }
      
      // Process and format bookings
      const bookings = await this.processBookings(response.data || []);
      return bookings;
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  }
  
  async getUserBookings(userId?: string) {
    try {
      console.log(`Fetching bookings for user ${userId}`);
      const response = await apiService.getUserBookings(userId);
      
      if (response.error) {
        // Don't consider empty bookings an error, just return an empty array
        if (response.error.includes("No bookings found") || response.error.includes("Bookings not found")) {
          console.log('No bookings found for user, returning empty array');
          return [];
        }
        console.error('Error fetching user bookings:', response.error);
        return [];
      }
      
      // Process and format bookings
      const bookings = await this.processBookings(response.data || []);
      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }
  
  private async processBookings(bookings: any[]) {
    // Ensure all bookings have machine names
    const processedBookings = await Promise.all(bookings.map(async (booking) => {
      const machineId = booking.machineId || booking.machine;
      let machineName = booking.machineName;
      
      if (!machineName && machineId) {
        try {
          const machine = await machineService.getMachineById(machineId);
          machineName = machine?.name || 'Unknown Machine';
        } catch (error) {
          console.error(`Error fetching machine ${machineId} for booking:`, error);
          machineName = 'Unknown Machine';
        }
      }
      
      return { 
        ...booking,
        machineName: machineName || 'Unknown Machine',
        id: booking._id || booking.id,
        machineId: machineId // Ensure machineId is consistently available
      };
    }));
    
    return processedBookings;
  }
  
  async isTimeSlotAvailable(machineId: string, date: string, time: string): Promise<boolean> {
    try {
      // First check with MongoDB service
      const isAvailable = await mongoDbService.isTimeSlotAvailable(machineId, date, time);
      if (!isAvailable) {
        console.log(`Time slot ${date} at ${time} for machine ${machineId} is already booked`);
        return false;
      }
      
      // If MongoDB says it's available, double-check with API
      try {
        const response = await apiService.request(`machines/${machineId}/availability`, 'GET', {
          date,
          time
        });
        
        if (response.data && response.data.available === false) {
          console.log(`API reports time slot ${date} at ${time} for machine ${machineId} is not available`);
          return false;
        }
      } catch (apiError) {
        console.log('API availability check failed, relying on MongoDB result');
      }
      
      return true;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false; // Default to unavailable on error
    }
  }
  
  async createBooking(userId: string, machineId: string, date: string, time: string) {
    try {
      console.log(`Creating booking for machine ${machineId}, date ${date}, time ${time}`);
      
      // First check if the time slot is available
      const isAvailable = await this.isTimeSlotAvailable(machineId, date, time);
      if (!isAvailable) {
        console.log(`Time slot is already booked`);
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot has already been booked. Please select another time.",
          variant: "destructive"
        });
        return { success: false, message: "Time slot already booked" };
      }
      
      try {
        console.log("Attempting to create booking via MongoDB");
        const mongoSuccess = await mongoDbService.createBooking(userId, machineId, date, time);
        if (mongoSuccess) {
          console.log("Successfully created booking");
          return { success: true };
        }
        console.log("MongoDB booking creation failed, falling back to API");
      } catch (mongoError) {
        console.error("MongoDB booking creation error");
      }
      
      // Fallback to API
      const response = await apiService.addBooking(userId, machineId, date, time);
      
      if (response.error) {
        console.error('Error creating booking via API:', response.error);
        
        // Check for specific error messages related to time slot booking
        if (typeof response.error === 'string' && 
            (response.error.toLowerCase().includes('time slot') || 
             response.error.toLowerCase().includes('already booked') || 
             response.error.toLowerCase().includes('already exists'))) {
          toast({
            title: "Time Slot Unavailable",
            description: "This time slot has already been booked. Please select another time.",
            variant: "destructive"
          });
          return { success: false, message: "Time slot already booked" };
        } else {
          toast({
            title: "Booking Failed",
            description: "There was a problem creating your booking. Please try again.",
            variant: "destructive"
          });
          return { success: false, message: response.error };
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Ensure we show the proper toast for uncaught errors too
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.toLowerCase().includes('time slot') || 
          errorMessage.toLowerCase().includes('already booked')) {
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot has already been booked. Please select another time.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Booking Failed",
          description: "There was a problem creating your booking. Please try again.",
          variant: "destructive"
        });
      }
      
      return { success: false, message: errorMessage };
    }
  }
  
  async cancelBooking(bookingId: string) {
    try {
      console.log(`Cancelling booking ${bookingId}`);
      
      // Try MongoDB service first
      try {
        const success = await mongoDbService.updateBookingStatus(bookingId, 'Canceled');
        if (success) return true;
      } catch (error) {
        console.error('MongoDB error cancelling booking:', error);
      }
      
      // Fallback to API
      const response = await apiService.cancelBooking(bookingId);
      
      if (response.error) {
        console.error('Error cancelling booking:', response.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }
  
  async updateBookingStatus(bookingId: string, status: string) {
    try {
      console.log(`Updating booking ${bookingId} status to ${status}`);
      
      // Try MongoDB service first
      try {
        const success = await mongoDbService.updateBookingStatus(bookingId, status);
        if (success) return true;
      } catch (error) {
        console.error('MongoDB error updating booking status:', error);
      }
      
      // Fallback to API
      const response = await apiService.updateBookingStatus(bookingId, status);
      
      if (response.error) {
        console.error('Error updating booking status:', response.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  }
  
  async deleteBooking(bookingId: string) {
    try {
      console.log(`Deleting booking ${bookingId}`);
      
      // First try MongoDB direct deletion
      let success = false;
      try {
        success = await mongoDbService.deleteBooking(bookingId);
        if (success) {
          console.log(`Successfully deleted booking ${bookingId} via MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error('MongoDB error deleting booking:', mongoError);
      }
      
      // Try API's delete endpoint with both paths
      try {
        // Try /bookings/:id endpoint
        const response = await apiService.delete(`bookings/${bookingId}`);
        if (response.data?.success) {
          console.log(`Successfully deleted booking ${bookingId} via API`);
          return true;
        }
      } catch (apiError) {
        console.error('API error deleting booking:', apiError);
      }
      
      try {
        // Try /auth/bookings/:id endpoint
        const authResponse = await apiService.delete(`auth/bookings/${bookingId}`);
        if (authResponse.data?.success) {
          console.log(`Successfully deleted booking ${bookingId} via auth API`);
          return true;
        }
      } catch (authError) {
        console.error('Auth API error deleting booking:', authError);
      }
      
      // If all else fails, try cancelling
      try {
        success = await this.cancelBooking(bookingId);
        if (success) {
          console.log(`Successfully marked booking ${bookingId} as canceled`);
          return true;
        }
      } catch (cancelError) {
        console.error('Error cancelling booking as fallback:', cancelError);
      }
      
      console.error(`All booking deletion methods failed for ${bookingId}`);
      return false;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  }
}

export const bookingService = new BookingService();
