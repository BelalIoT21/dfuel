
import { apiClient, ApiResponse } from './apiClient';
import { authApi } from './authApi';
import { userApi } from './userApi';
import { machineApi } from './machineApi';
import { certificationApi } from './certificationApi';
import { bookingApi } from './bookingApi';
import { adminApi } from './adminApi';

// Create a combined service that maintains the original apiService interface
class ApiService {
  // Auth methods
  login = authApi.login.bind(authApi);
  register = authApi.register.bind(authApi);
  checkHealth = authApi.checkHealth.bind(authApi);
  
  // User methods
  getCurrentUser = userApi.getCurrentUser.bind(userApi);
  updateUser = userApi.updateUser.bind(userApi);
  updatePassword = userApi.updatePassword.bind(userApi);
  getUserByEmail = userApi.getUserByEmail.bind(userApi);
  getUserById = userApi.getUserById.bind(userApi);
  updateProfile = userApi.updateProfile.bind(userApi);
  getAllUsers = userApi.getAllUsers.bind(userApi);
  
  // Machine methods
  updateMachineStatus = machineApi.updateMachineStatus.bind(machineApi);
  getMachineStatus = machineApi.getMachineStatus.bind(machineApi);
  
  // Certification methods
  addCertification = certificationApi.addCertification.bind(certificationApi);
  
  // Booking methods
  addBooking = bookingApi.addBooking.bind(bookingApi);
  getAllBookings = bookingApi.getAllBookings.bind(bookingApi);
  updateBookingStatus = bookingApi.updateBookingStatus.bind(bookingApi);
  cancelBooking = bookingApi.cancelBooking.bind(bookingApi);
  
  // Admin methods
  updateAdminCredentials = adminApi.updateAdminCredentials.bind(adminApi);
}

// Export the combined service
export const apiService = new ApiService();

// Also export individual APIs for direct use when needed
export {
  ApiResponse,
  apiClient,
  authApi,
  userApi,
  machineApi,
  certificationApi,
  bookingApi,
  adminApi
};
