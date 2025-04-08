import mongoConnectionService from './mongodb/connectionService';
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoCourseService from './mongodb/courseService';
import mongoQuizService from './mongodb/quizService';
import { apiService } from './apiService';
import { getApiUrl } from '@/utils/env';

class MongoDbService {
  async getAllBookings() {
    try {
      console.log("MongoDbService: Fetching all bookings from API");
      const response = await apiService.request('bookings/all', 'GET');
      if (response?.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} bookings via API`);
        return response.data;
      }
      console.log("No bookings found via API");
      return [];
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  }

  async getAllUsers() {
    try {
      return await mongoUserService.getUsers();
    } catch (error) {
      console.error('Error fetching users from MongoDB:', error);
      return [];
    }
  }

  async getUserById(userId: string) {
    try {
      return await mongoUserService.getUserById(userId);
    } catch (error) {
      console.error('Error fetching user from MongoDB:', error);
      return null;
    }
  }

  async updateUser(userId: string, updateData: any) {
    try {
      return await mongoUserService.updateUser(userId, updateData);
    } catch (error) {
      console.error('Error updating user in MongoDB:', error);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      console.log(`MongoDbService: Attempting to delete user ${userId}`);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return false;
      }

      // Set token in apiService
      apiService.setToken(token);
      
      // Make API call to delete the user
      try {
        console.log(`Attempting API deletion for user ${userId}`);
        const response = await apiService.request(`users/${userId}`, 'DELETE');
        console.log(`API deletion response:`, response);
        
        if (response && response.status >= 200 && response.status < 300) {
          console.log(`User ${userId} deleted successfully via API`);
          return true;
        } else {
          console.log(`API deletion failed with status ${response?.status}`);
        }
      } catch (apiError) {
        console.error('API error deleting user:', apiError);
      }
      
      // Fall back to MongoDB service if API fails
      console.log(`Falling back to MongoDB userService for deletion`);
      const mongoResult = await mongoUserService.deleteUser(userId);
      if (mongoResult) {
        console.log(`User ${userId} deleted successfully via MongoDB service`);
        return true;
      }
      
      console.log(`Failed to delete user ${userId} through all methods`);
      return false;
    } catch (error) {
      console.error('Error in deleteUser method:', error);
      return false;
    }
  }

  async getAllMachines() {
    try {
      return await mongoMachineService.getAllMachines();
    } catch (error) {
      console.error('Error fetching machines from MongoDB:', error);
      return [];
    }
  }

  async getMachineById(machineId: string) {
    try {
      return await mongoMachineService.getMachineById(machineId);
    } catch (error) {
      console.error('Error fetching machine from MongoDB:', error);
      return null;
    }
  }

  async createMachine(machineData: any) {
    try {
      return await mongoMachineService.createMachine(machineData);
    } catch (error) {
      console.error('Error creating machine in MongoDB:', error);
      return false;
    }
  }

  async updateMachine(machineId: string, updateData: any) {
    try {
      return await mongoMachineService.updateMachine(machineId, updateData);
    } catch (error) {
      console.error('Error updating machine in MongoDB:', error);
      return false;
    }
  }

  async deleteMachine(machineId: string) {
    try {
      return await mongoMachineService.deleteMachine(machineId);
    } catch (error) {
      console.error('Error deleting machine from MongoDB:', error);
      return false;
    }
  }

  async backupMachine(machineId: string): Promise<boolean> {
    try {
      console.log(`Backing up machine ${machineId} before deletion`);
      
      // Create a connector to MongoDB service
      const apiUrl = apiService.getBaseUrl();
      if (!apiUrl) {
        console.error('No API URL available for backup operation');
        return false;
      }
      
      const response = await fetch(`${apiUrl}/mongodb/backup-machine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ machineId })
      });
      
      if (!response.ok) {
        console.error(`Failed to backup machine ${machineId}: ${response.statusText}`);
        return false;
      }
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error(`Error backing up machine ${machineId}:`, error);
      return false;
    }
  }

  async restoreFromBackup(machineId: string): Promise<boolean> {
    try {
      console.log(`Restoring machine ${machineId} from backup`);
      
      // Create a connector to MongoDB service
      const apiUrl = apiService.getBaseUrl();
      if (!apiUrl) {
        console.error('No API URL available for restore operation');
        return false;
      }
      
      const response = await fetch(`${apiUrl}/mongodb/restore-machine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ machineId })
      });
      
      if (!response.ok) {
        console.error(`Failed to restore machine ${machineId}: ${response.statusText}`);
        return false;
      }
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error(`Error restoring machine ${machineId}:`, error);
      return false;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token || ''}`
    };
  }

  async getAllCourses() {
    try {
      console.log("MongoDbService: Fetching all courses from API");
      const response = await apiService.request('courses/all', 'GET');
      if (response?.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} courses via API`);
        return response.data;
      }
      console.log("No courses found via API");
      return [];
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  }

  async getCourseById(courseId: string) {
    try {
      console.log(`MongoDbService: Fetching course ${courseId} from API`);
      const response = await apiService.request(`courses/${courseId}`, 'GET');
      if (response?.data) {
        console.log(`Found course ${courseId} via API`);
        return response.data;
      }
      console.log(`Course ${courseId} not found via API`);
      return null;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  }

  async createCourse(courseData: any) {
    try {
      console.log("MongoDbService: Creating new course via API");
      const response = await apiService.request('courses', 'POST', courseData);
      if (response?.data) {
        console.log("Course created successfully via API");
        return true;
      }
      console.log("Failed to create course via API");
      return false;
    } catch (error) {
      console.error('Error creating course:', error);
      return false;
    }
  }

  async updateCourse(courseId: string, updateData: any) {
    try {
      console.log(`MongoDbService: Updating course ${courseId} via API`);
      const response = await apiService.request(`courses/${courseId}`, 'PUT', updateData);
      if (response?.data) {
        console.log(`Course ${courseId} updated successfully via API`);
        return true;
      }
      console.log(`Failed to update course ${courseId} via API`);
      return false;
    } catch (error) {
      console.error(`Error updating course ${courseId}:`, error);
      return false;
    }
  }

  async deleteCourse(courseId: string) {
    try {
      console.log(`MongoDbService: Deleting course ${courseId} via API`);
      const response = await apiService.request(`courses/${courseId}`, 'DELETE');
      if (response?.data) {
        console.log(`Course ${courseId} deleted successfully via API`);
      return true;
      }
      console.log(`Failed to delete course ${courseId} via API`);
      return false;
    } catch (error) {
      console.error(`Error deleting course ${courseId}:`, error);
      return false;
    }
  }

  async getAllQuizzes() {
    try {
      console.log("MongoDbService: Fetching all quizzes from API");
      const response = await apiService.request('quizzes/all', 'GET');
      if (response?.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} quizzes via API`);
        return response.data;
      }
      console.log("No quizzes found via API");
      return [];
    } catch (error) {
      console.error('Error fetching all quizzes:', error);
      return [];
    }
  }

  async getQuizById(quizId: string) {
    try {
      console.log(`MongoDbService: Fetching quiz ${quizId} from API`);
      const response = await apiService.request(`quizzes/${quizId}`, 'GET');
      if (response?.data) {
        console.log(`Found quiz ${quizId} via API`);
        return response.data;
      }
      console.log(`Quiz ${quizId} not found via API`);
      return null;
    } catch (error) {
      console.error(`Error fetching quiz ${quizId}:`, error);
      return null;
    }
  }

  async createQuiz(quizData: any) {
    try {
      console.log("MongoDbService: Creating new quiz via API");
      const response = await apiService.request('quizzes', 'POST', quizData);
      if (response?.data) {
        console.log("Quiz created successfully via API");
        return true;
      }
      console.log("Failed to create quiz via API");
      return false;
    } catch (error) {
      console.error('Error creating quiz:', error);
      return false;
    }
  }

  async updateQuiz(quizId: string, updateData: any) {
    try {
      console.log(`MongoDbService: Updating quiz ${quizId} via API`);
      const response = await apiService.request(`quizzes/${quizId}`, 'PUT', updateData);
      if (response?.data) {
        console.log(`Quiz ${quizId} updated successfully via API`);
        return true;
      }
      console.log(`Failed to update quiz ${quizId} via API`);
      return false;
    } catch (error) {
      console.error(`Error updating quiz ${quizId}:`, error);
      return false;
    }
  }

  async deleteQuiz(quizId: string) {
    try {
      console.log(`MongoDbService: Deleting quiz ${quizId} via API`);
      const response = await apiService.request(`quizzes/${quizId}`, 'DELETE');
      if (response?.data) {
        console.log(`Quiz ${quizId} deleted successfully via API`);
        return true;
      }
      console.log(`Failed to delete quiz ${quizId} via API`);
      return false;
    } catch (error) {
      console.error(`Error deleting quiz ${quizId}:`, error);
      return false;
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    try {
      console.log(`Updating booking status via API: ID=${bookingId}, status=${status}`);
      const response = await apiService.request(`bookings/${bookingId}/status`, 'PUT', { status }, true);
      
      if (response.data?.success) {
        console.log(`Successfully updated booking status to ${status}`);
        return true;
      }
      
      console.error(`Failed to update booking status: ${response.error}`);
      return false;
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      return false;
    }
  }
}

export default new MongoDbService();
