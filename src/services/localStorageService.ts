
/**
 * DEPRECATED: This service is deprecated and should not be used.
 * All data should be fetched directly from MongoDB.
 */
class LocalStorageService {
  constructor() {
    console.warn('LocalStorageService is deprecated and should not be used.');
  }
  
  // All methods return empty or false values
  getAllUsers() { return []; }
  getAllUsersWithoutSensitiveInfo() { return []; }
  findUserByEmail() { return undefined; }
  findUserById() { return undefined; }
  addUser() { return false; }
  updateUser() { return false; }
  deleteUser() { return false; }
  getBookings() { return []; }
  saveBookings() { return false; }
  updateBookingStatus() { return false; }
  getMachineStatus() { return null; }
  getMachineMaintenanceNote() { return undefined; }
  updateMachineStatus() { return false; }
  clearAllDataExceptToken() { return false; }
}

// Create a singleton instance with warning
export const localStorageService = new LocalStorageService();
