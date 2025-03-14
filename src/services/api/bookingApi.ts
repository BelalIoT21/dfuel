
import { apiClient, ApiResponse } from './apiClient';

class BookingApi {
  async addBooking(userId: string, machineId: string, date: string, time: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.request<{ success: boolean }>(
      `bookings`, 
      'POST', 
      { userId, machineId, date, time }
    );
  }
  
  async getAllBookings(): Promise<ApiResponse<any[]>> {
    return apiClient.request<any[]>('bookings/all', 'GET');
  }
  
  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<any>> {
    return apiClient.request<any>(
      `bookings/${bookingId}/status`, 
      'PUT', 
      { status }
    );
  }
  
  async cancelBooking(bookingId: string): Promise<ApiResponse<any>> {
    return apiClient.request<any>(`bookings/${bookingId}/cancel`, 'PUT');
  }
}

export const bookingApi = new BookingApi();
