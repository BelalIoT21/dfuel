import { apiService } from '@/services/apiService';

const fetchBookingsCount = async () => {
  try {
    const bookings = await apiService.getAllBookings();
    setBookingsCount(bookings.length);
  } catch (error) {
    console.error('Error fetching bookings count:', error);
  }
}; 