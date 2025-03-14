
import { BaseApiService } from './baseApiService';
import { authApiService } from './authApiService';
import { userApiService } from './userApiService';
import { machineApiService } from './machineApiService';
import { bookingApiService } from './bookingApiService';
import { certificationApiService } from './certificationApiService';
import { adminApiService } from './adminApiService';
import { healthApiService } from './healthApiService';

// Re-export the ApiResponse type from the base API service
export type { ApiResponse } from './baseApiService';
export { BaseApiService };

// Create and export a consolidated API service with all domains
class ApiService {
  auth = authApiService;
  user = userApiService;
  machine = machineApiService;
  booking = bookingApiService;
  certification = certificationApiService;
  admin = adminApiService;
  health = healthApiService;
  
  // Legacy methods to maintain backward compatibility
  login = this.auth.login.bind(this.auth);
  register = this.auth.register.bind(this.auth);
  checkHealth = this.health.checkHealth.bind(this.health);
  getCurrentUser = this.auth.getCurrentUser.bind(this.auth);
  updateUser = this.user.updateUser.bind(this.user);
  updatePassword = this.auth.updatePassword.bind(this.auth);
  getUserByEmail = this.user.getUserByEmail.bind(this.user);
  getUserById = this.user.getUserById.bind(this.user);
  updateProfile = this.user.updateProfile.bind(this.user);
  addCertification = this.certification.addCertification.bind(this.certification);
  addBooking = this.booking.addBooking.bind(this.booking);
  updateMachineStatus = this.machine.updateMachineStatus.bind(this.machine);
  getAllBookings = this.booking.getAllBookings.bind(this.booking);
  updateBookingStatus = this.booking.updateBookingStatus.bind(this.booking);
  cancelBooking = this.booking.cancelBooking.bind(this.booking);
  updateAdminCredentials = this.admin.updateAdminCredentials.bind(this.admin);
  getAllUsers = this.user.getAllUsers.bind(this.user);
  getMachineStatus = this.machine.getMachineStatus.bind(this.machine);
}

export const apiService = new ApiService();
