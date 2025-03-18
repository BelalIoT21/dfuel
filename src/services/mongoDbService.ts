import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoBookingService from './mongodb/bookingService';
import { isWeb } from '../utils/platform';
import { apiService } from './apiService';

class MongoDbService {
  async getUsers() {
    if (isWeb) {
      console.log('MongoDB access attempted from web environment, using API fallback');
      try {
        const response = await apiService.get('users');
        if (response.data) {
          console.log('API returned', response.data.length, 'users');
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching users from API:", error);
      }
      return [];
    }
    
    const users = await mongoUserService.getUsers();
    console.log('Retrieved', users.length, 'users from MongoDB');
    return users;
  }

  async getUserByEmail(email: string) {
    if (isWeb) {
      try {
        const response = await apiService.get(`users/email/${email}`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching user by email from API:", error);
      }
      return null;
    }
    
    return await mongoUserService.getUserByEmail(email);
  }

  async getUserById(userId: string) {
    if (isWeb) {
      try {
        const response = await apiService.get(`users/${userId}`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching user by ID from API:", error);
      }
      return null;
    }
    
    return await mongoUserService.getUserById(userId);
  }

  async updateUserCertifications(userId: string, machineId: string) {
    console.log(`MongoDbService: updateUserCertifications for user ${userId}, machine ${machineId}`);
    
    if (isWeb) {
      try {
        const response = await apiService.post('certifications', { userId, machineId });
        return response.data && response.data.success;
      } catch (error) {
        console.error("Error updating user certifications via API:", error);
        return false;
      }
    }
    
    return await mongoUserService.addCertification(userId, machineId);
  }

  async removeUserCertification(userId: string, machineId: string) {
    console.log(`MongoDbService: removeUserCertification for user ${userId}, machine ${machineId}`);
    
    if (isWeb) {
      try {
        const response = await apiService.delete(`certifications/${userId}/${machineId}`);
        return response.data && response.data.success;
      } catch (error) {
        console.error("Error removing user certification via API:", error);
        return false;
      }
    }
    
    return await mongoUserService.removeCertification(userId, machineId);
  }

  async clearUserCertifications(userId: string) {
    if (isWeb) {
      try {
        const response = await apiService.delete(`certifications/clear/${userId}`);
        return response.data && response.data.success;
      } catch (error) {
        console.error("Error clearing user certifications via API:", error);
        return false;
      }
    }
    
    return await mongoUserService.clearCertifications(userId);
  }
  
  async getMachines() {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const timestamp = new Date().getTime(); // Add timestamp to bypass cache
        const response = await apiService.get(`machines?t=${timestamp}`);
        if (response.data && Array.isArray(response.data)) {
          console.log(`API returned ${response.data.length} machines`);
          // Filter out machines 5 and 6
          const filteredMachines = response.data.filter(machine => {
            const id = machine.id || machine._id;
            return id !== '5' && id !== '6';
          });
          return filteredMachines;
        }
      } catch (error) {
        console.error("Error getting machines from API:", error);
      }
      return [];
    }
    
    try {
      const machines = await mongoMachineService.getMachines();
      console.log(`MongoDB returned ${machines?.length || 0} machines`);
      return machines || [];
    } catch (error) {
      console.error("Error getting machines from MongoDB:", error);
      return [];
    }
  }

  async getMachineById(machineId: string) {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const timestamp = new Date().getTime(); // Add timestamp to bypass cache
        const response = await apiService.get(`machines/${machineId}?t=${timestamp}`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error(`Error getting machine ${machineId} from API:`, error);
      }
      return null;
    }
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineById");
        return null;
      }
      const machine = await mongoMachineService.getMachineById(machineId);
      console.log(`MongoDB ${machine ? 'found' : 'did not find'} machine ${machineId}`);
      return machine;
    } catch (error) {
      console.error(`Error getting machine ${machineId} from MongoDB:`, error);
      return null;
    }
  }

  async getMachineStatus(machineId: string, timestamp = new Date().getTime()) {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const response = await apiService.get(`machines/${machineId}/status?t=${timestamp}`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error(`Error getting status for machine ${machineId} from API:`, error);
      }
      return null;
    }
    try {
      if (!machineId) {
        console.error("Invalid machineId passed to getMachineStatus");
        return null;
      }
      const status = await mongoMachineService.getMachineStatus(machineId);
      console.log(`MongoDB returned status for machine ${machineId}: ${status ? status.status : 'no status'}`);
      return status;
    } catch (error) {
      console.error(`Error getting status for machine ${machineId}:`, error);
      return null;
    }
  }

  async updateMachineStatus(machineId: string, status: string, note?: string) {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        apiService.setToken(token);
        
        // Convert "out of order" to "in-use" for the server
        let normalizedStatus = status;
        if (status && status.toLowerCase() === 'out of order') {
          normalizedStatus = 'in-use';
        }
        
        // Make sure we're sending the string status in the correct format
        console.log(`Sending machine status update via API: ${machineId}, status: ${normalizedStatus}`);
        const response = await apiService.put(`machines/${machineId}/status`, { 
          status: normalizedStatus, 
          maintenanceNote: note 
        });
        console.log("API response:", response.data);
        return response.data?.success || false;
      } catch (error) {
        console.error(`Error updating status for machine ${machineId} via API:`, error);
        return false;
      }
    }
    
    try {
      if (!machineId || !status) {
        console.error("Invalid machineId or status passed to updateMachineStatus");
        return false;
      }
      
      // Convert "out of order" to "in-use" for the database
      let normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'out of order') {
        normalizedStatus = 'in-use';
      }
      
      console.log(`MongoDbService: Updating status for machine ${machineId} to ${normalizedStatus}`);
      const success = await mongoMachineService.updateMachineStatus(machineId, normalizedStatus, note);
      console.log(`MongoDB update machine status result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error updating status for machine ${machineId}:`, error);
      return false;
    }
  }

  async deleteUser(userId: string) {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        const response = await apiService.delete(`users/${userId}`);
        return response.status === 200;
      } catch (error) {
        console.error(`Error deleting user ${userId} via API:`, error);
        return false;
      }
    }
    try {
      if (!userId) {
        console.error("Invalid userId passed to deleteUser");
        return false;
      }
      const success = await mongoUserService.deleteUser(userId);
      console.log(`MongoDB delete user result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      return false;
    }
  }

  async getAllBookings() {
    if (isWeb) {
      try {
        const response = await apiService.get('bookings/all');
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching all bookings from API:", error);
      }
      return [];
    }
    
    try {
      const bookings = await mongoBookingService.getAllBookings();
      console.log(`Retrieved ${bookings.length} bookings from MongoDB`);
      return bookings;
    } catch (error) {
      console.error("Error getting all bookings from MongoDB:", error);
      return [];
    }
  }

  async getUserBookings(userId: string) {
    if (isWeb) {
      try {
        const response = await apiService.get(`bookings`);
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching user bookings from API:", error);
      }
      return [];
    }
    
    try {
      const bookings = await mongoBookingService.getUserBookings(userId);
      console.log(`Retrieved ${bookings.length} bookings for user ${userId} from MongoDB`);
      return bookings;
    } catch (error) {
      console.error(`Error getting bookings for user ${userId} from MongoDB:`, error);
      return [];
    }
  }

  async createBooking(userId: string, machineId: string, date: string, time: string) {
    if (isWeb) {
      try {
        const response = await apiService.post('bookings', { machineId, date, time });
        return response.data && response.data.success;
      } catch (error) {
        console.error("Error creating booking via API:", error);
        return false;
      }
    }
    
    try {
      const success = await mongoBookingService.createBooking(userId, machineId, date, time);
      console.log(`MongoDB create booking result: ${success}`);
      return success;
    } catch (error) {
      console.error("Error creating booking in MongoDB:", error);
      return false;
    }
  }

  async deleteBooking(bookingId: string) {
    if (isWeb) {
      console.log("MongoDB access attempted from web environment, using API fallback");
      try {
        // First try the auth API endpoint (more reliable)
        try {
          console.log(`Deleting booking via auth API: ${bookingId}`);
          const authResponse = await apiService.delete(`auth/bookings/${bookingId}`);
          if (authResponse.data && authResponse.data.success) {
            console.log("Successfully deleted booking via auth API");
            return true;
          }
        } catch (authError) {
          console.error(`Error deleting booking ${bookingId} via auth API:`, authError);
        }
        
        // Fall back to standard booking endpoint
        console.log(`Deleting booking via standard API: ${bookingId}`);
        const response = await apiService.delete(`bookings/${bookingId}`);
        const success = response.status === 200 || 
                      (response.data && response.data.success);
        console.log(`API booking deletion result: ${success}`);
        return success;
      } catch (error) {
        console.error(`Error deleting booking ${bookingId} via API:`, error);
        return false;
      }
    }
    
    try {
      if (!bookingId) {
        console.error("Invalid bookingId passed to deleteBooking");
        return false;
      }
      
      console.log(`MongoDbService: Deleting booking ${bookingId}`);
      const success = await mongoBookingService.deleteBooking(bookingId);
      console.log(`MongoDB delete booking result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error deleting booking ${bookingId}:`, error);
      return false;
    }
  }

  async updateBookingStatus(bookingId: string, status: string) {
    if (isWeb) {
      try {
        const response = await apiService.put(`bookings/${bookingId}/status`, { status });
        return response.data && response.data.success;
      } catch (error) {
        console.error(`Error updating booking ${bookingId} status via API:`, error);
        return false;
      }
    }
    
    try {
      const success = await mongoBookingService.updateBookingStatus(bookingId, status);
      console.log(`MongoDB update booking status result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status in MongoDB:`, error);
      return false;
    }
  }

  async updateUser(userId: string, updates: { name?: string, email?: string, password?: string, currentPassword?: string }): Promise<boolean> {
    console.log(`MongoDbService: updateUser for user ${userId}`, updates);
    
    if (isWeb) {
      console.log("Updating user via direct MongoDB connection");
      
      try {
        // For password change - need to verify current password
        if (updates.password && updates.currentPassword) {
          console.log("Handling password change via direct MongoDB connection");
          
          // First verify current password
          const user = await this.getUserById(userId);
          if (!user) {
            console.error("User not found for password change");
            return false;
          }
          
          if (user.password !== updates.currentPassword) {
            console.error("Current password is incorrect");
            return false;
          }
          
          // If verification passes, update with new password
          const passwordUpdateData = { password: updates.password };
          
          try {
            // Try to use server API first for better security
            const response = await fetch('http://localhost:4000/api/auth/change-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                currentPassword: updates.currentPassword,
                newPassword: updates.password
              })
            });
            
            const data = await response.json();
            console.log("MongoDB password change response:", data);
            
            if (data && data.success) {
              console.log("Password updated successfully via server API");
              return true;
            }
          } catch (serverError) {
            console.error("Error using server API for password change:", serverError);
          }
          
          // Direct MongoDB update as fallback
          console.log("Using direct MongoDB update for password");
          return await mongoUserService.updateUser(userId, passwordUpdateData);
        }
        
        // For regular profile updates (name/email)
        const profileUpdates = {
          ...(updates.name && { name: updates.name }),
          ...(updates.email && { email: updates.email })
        };
        
        if (Object.keys(profileUpdates).length === 0) {
          console.log("No valid profile updates provided");
          return false;
        }
        
        // Try server API first
        try {
          console.log("Updating profile via server API");
          const response = await fetch('http://localhost:4000/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(profileUpdates)
          });
          
          const data = await response.json();
          if (data && data.success) {
            console.log("Profile updated successfully via server API");
            return true;
          }
        } catch (serverError) {
          console.error("Error using server API for profile update:", serverError);
        }
        
        // Direct MongoDB update as fallback
        console.log("Using direct MongoDB update for profile");
        return await mongoUserService.updateUser(userId, profileUpdates);
      } catch (error) {
        console.error("Error in updateUser:", error);
        return false;
      }
    }
    
    try {
      if (!userId) {
        console.error("Invalid userId passed to updateUser");
        return false;
      }
      
      // If updating password, verify current password first
      if (updates.password && updates.currentPassword) {
        const user = await mongoUserService.getUserById(userId);
        if (!user) {
          console.error("User not found for password change");
          return false;
        }
        
        if (user.password !== updates.currentPassword) {
          console.error("Current password is incorrect");
          return false;
        }
        
        // Remove currentPassword from updates
        const { currentPassword, ...passwordUpdate } = updates;
        console.log("Verified current password, updating with new password");
        return await mongoUserService.updateUser(userId, passwordUpdate);
      }
      
      // Regular update
      console.log(`MongoDbService: Updating user ${userId} with`, updates);
      const success = await mongoUserService.updateUser(userId, updates);
      console.log(`MongoDB update user result: ${success}`);
      return success;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      return false;
    }
  }
}

const mongoDbService = new MongoDbService();
export default mongoDbService;
