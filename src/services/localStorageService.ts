
/**
 * DEPRECATED: This service has been completely removed.
 * All data should be fetched directly from MongoDB.
 */
class LocalStorageService {
  constructor() {
    console.warn('LocalStorageService has been completely removed. Use MongoDB API calls instead.');
  }
  
  // All methods return empty or false values
  getAllUsers() { 
    console.warn('LocalStorageService.getAllUsers is no longer available. Use MongoDB API calls instead.');
    return []; 
  }
  getAllUsersWithoutSensitiveInfo() { 
    console.warn('LocalStorageService.getAllUsersWithoutSensitiveInfo is no longer available. Use MongoDB API calls instead.');
    return []; 
  }
  findUserByEmail() { 
    console.warn('LocalStorageService.findUserByEmail is no longer available. Use MongoDB API calls instead.');
    return undefined; 
  }
  findUserById() { 
    console.warn('LocalStorageService.findUserById is no longer available. Use MongoDB API calls instead.');
    return undefined; 
  }
  addUser() { 
    console.warn('LocalStorageService.addUser is no longer available. Use MongoDB API calls instead.');
    return false; 
  }
  updateUser() { 
    console.warn('LocalStorageService.updateUser is no longer available. Use MongoDB API calls instead.');
    return false; 
  }
  deleteUser() { 
    console.warn('LocalStorageService.deleteUser is no longer available. Use MongoDB API calls instead.');
    return false; 
  }
  getBookings() { 
    console.warn('LocalStorageService.getBookings is no longer available. Use MongoDB API calls instead.');
    return []; 
  }
  saveBookings() { 
    console.warn('LocalStorageService.saveBookings is no longer available. Use MongoDB API calls instead.');
    return false; 
  }
  updateBookingStatus() { 
    console.warn('LocalStorageService.updateBookingStatus is no longer available. Use MongoDB API calls instead.');
    return false; 
  }
  getMachineStatus() { 
    console.warn('LocalStorageService.getMachineStatus is no longer available. Use MongoDB API calls instead.');
    return null; 
  }
  getMachineMaintenanceNote() { 
    console.warn('LocalStorageService.getMachineMaintenanceNote is no longer available. Use MongoDB API calls instead.');
    return undefined; 
  }
  updateMachineStatus() { 
    console.warn('LocalStorageService.updateMachineStatus is no longer available. Use MongoDB API calls instead.');
    return false; 
  }
  clearAllDataExceptToken() { 
    console.warn('LocalStorageService.clearAllDataExceptToken is no longer available. Use MongoDB API calls instead.');
    return false; 
  }
}

// Create a singleton instance with warning
export const localStorageService = new LocalStorageService();
