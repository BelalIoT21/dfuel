
import mongoDbService from './mongoDbService';
import { localStorageService } from './localStorageService';
import { Booking } from '../types/database';

export class BookingService {
  // Add a booking
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      machineId,
      date,
      time,
      status: 'Pending'
    };
    
    try {
      // Try to add booking in MongoDB first
      const success = await mongoDbService.addUserBooking(userId, booking);
      if (success) return true;
    } catch (error) {
      console.error("Error adding booking in MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.addBooking(userId, booking);
  }
  
  // Get user bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      // Try to get user from MongoDB first
      const mongoUser = await mongoDbService.getUserById(userId);
      if (mongoUser) {
        return mongoUser.bookings;
      }
    } catch (error) {
      console.error("Error getting user bookings from MongoDB:", error);
      // Continue with localStorage if MongoDB fails
    }
    
    return localStorageService.getUserBookings(userId);
  }
}

// Create a singleton instance
export const bookingService = new BookingService();

