import { apiService } from './apiService';
import { machineService } from './machineService';
import { toast } from '@/hooks/use-toast';

class BookingService {
  async getAllBookings() {
    try {
      console.log('Fetching all bookings via API');
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
      console.log(`Fetching bookings for user ${userId} via API`);
      const response = await apiService.getUserBookings(userId);
      
      if (response.error) {
        // Don't consider empty bookings an error
        if (response.error.includes("No bookings found") || 
            response.error.includes("Bookings not found")) {
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
        machineId: machineId
      };
    }));
    
    return processedBookings;
  }
  
  async isTimeSlotAvailable(machineId: string, date: string, time: string): Promise<boolean> {
    try {
      const response = await apiService.request(
        `machines/${machineId}/availability`, 
        'GET', 
        { date, time }
      );
      
      if (response.data?.available === false) {
        console.log(`Time slot ${date} at ${time} for machine ${machineId} is not available`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  }
  
  async createBooking(userId: string, machineId: string, date: string, time: string) {
    try {
      console.log(`Creating booking via API for machine ${machineId}, date ${date}, time ${time}`);
      
      const response = await apiService.addBooking(userId, machineId, date, time);
      
      if (response.error) {
        console.error('Error creating booking:', response.error);
        
        if (typeof response.error === 'string' && 
            (response.error.toLowerCase().includes('time slot') || 
             response.error.toLowerCase().includes('already booked'))) {
          toast({
            title: "Time Slot Unavailable",
            description: "This time slot has already been booked. Please select another time.",
            variant: "destructive"
          });
          return { success: false, message: "Time slot already booked" };
        }
        
        toast({
          title: "Booking Failed",
          description: "There was a problem creating your booking. Please try again.",
          variant: "destructive"
        });
        return { success: false, message: response.error };
      }
      
      toast({
        title: "Booking Created",
        description: "Your booking has been created successfully.",
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating booking:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Booking Failed",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive"
      });
      
      return { success: false, message: errorMessage };
    }
  }
  
  async cancelBooking(bookingId: string) {
    try {
      console.log(`Cancelling booking ${bookingId} via API`);
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
      console.log(`Updating booking ${bookingId} status to ${status} via API`);
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
      console.log(`Deleting booking ${bookingId} via API`);
      const response = await apiService.delete(`bookings/${bookingId}`);
      
      if (response.error) {
        console.error('Error deleting booking:', response.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  }
}

export const bookingService = new BookingService();