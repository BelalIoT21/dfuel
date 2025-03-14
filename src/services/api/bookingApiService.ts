
import { BaseApiService } from './baseApiService';

export class BookingApiService extends BaseApiService {
  async addBooking(userId: string, machineId: string, date: string, time: string) {
    return this.request<{ success: boolean }>(
      `bookings`, 
      'POST', 
      { userId, machineId, date, time }
    );
  }
  
  async getAllBookings() {
    return this.request<any[]>('bookings/all', 'GET');
  }
  
  async updateBookingStatus(bookingId: string, status: string) {
    return this.request<any>(
      `bookings/${bookingId}/status`, 
      'PUT', 
      { status }
    );
  }
  
  async cancelBooking(bookingId: string) {
    return this.request<any>(`bookings/${bookingId}/cancel`, 'PUT');
  }
}

export const bookingApiService = new BookingApiService();
