
import { apiService } from './apiService';
import { machineService } from './machineService';

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
        id: booking._id || booking.id
      };
    }));
    
    return processedBookings;
  }
  
  async createBooking(userId: string, machineId: string, date: string, time: string) {
    try {
      console.log(`Creating booking for user ${userId}, machine ${machineId}, date ${date}, time ${time}`);
      const response = await apiService.addBooking(userId, machineId, date, time);
      
      if (response.error) {
        console.error('Error creating booking:', response.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating booking:', error);
      return false;
    }
  }
  
  async cancelBooking(bookingId: string) {
    try {
      console.log(`Cancelling booking ${bookingId}`);
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
}

export const bookingService = new BookingService();
