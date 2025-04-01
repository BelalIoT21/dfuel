import mongoConnectionService from './mongodb/connectionService';
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoCourseService from './mongodb/courseService';
import mongoQuizService from './mongodb/quizService';
import mongoBookingService from './mongodb/bookingService';
import { apiService } from './apiService';

class MongoDbService {
  async createBooking(userId: string, machineId: string, date: string, time: string): Promise<boolean> {
    try {
      return await mongoBookingService.createBooking(userId, machineId, date, time);
    } catch (error) {
      console.error('Error creating booking via MongoDB:', error);
      return false;
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    try {
      return await mongoBookingService.updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error('Error updating booking status via MongoDB:', error);
      return false;
    }
  }

  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      return await mongoBookingService.deleteBooking(bookingId);
    } catch (error) {
      console.error('Error deleting booking via MongoDB:', error);
      return false;
    }
  }

  async getAllUsers() {
    try {
      return await mongoUserService.getAllUsers();
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

  async deleteUser(userId: string) {
    try {
      console.log(`MongoDbService: Attempting to delete user ${userId}`);
      
      // First attempt: direct API call with the correct endpoint (fixed)
      try {
        console.log(`Trying direct API deletion for user ${userId}`);
        // Fixed the endpoint to include the slash between 'api' and 'users'
        const response = await apiService.request(`/users/${userId}`, 'DELETE', undefined, true);
        console.log(`API response:`, response);
        
        if (response && response.status >= 200 && response.status < 300) {
          console.log(`User ${userId} deleted successfully via API`);
          return true;
        }
      } catch (apiError) {
        console.error('Direct API error deleting user:', apiError);
      }
      
      // Second attempt: use MongoDB service as fallback
      try {
        console.log(`Trying MongoDB userService for deletion of user ${userId}`);
        const mongoResult = await mongoUserService.deleteUser(userId);
        if (mongoResult) {
          console.log(`User ${userId} deleted successfully via MongoDB service`);
          return true;
        }
      } catch (mongoError) {
        console.error('MongoDB service error deleting user:', mongoError);
      }
      
      // Third attempt: Try direct axios call with token and corrected URL
      try {
        console.log(`Trying direct axios call for user ${userId}`);
        const axios = (await import('axios')).default;
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token available for direct axios call');
          return false;
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        const apiUrl = apiService['api'].defaults.baseURL || 'http://localhost:4000/api';
        
        // Ensure the URL is correctly formatted with proper slashes
        const endpoint = `${apiUrl}/users/${userId}`;
        
        console.log(`Making direct axios DELETE request to ${endpoint}`);
        const response = await axios.delete(endpoint, { headers });
        
        if (response.status >= 200 && response.status < 300) {
          console.log(`User ${userId} deleted successfully via direct axios call`);
          return true;
        }
      } catch (axiosError) {
        console.error('Direct axios error:', axiosError);
      }
      
      console.log(`Failed to delete user ${userId} through all methods`);
      return false;
    } catch (error) {
      console.error('Error in deleteUser method:', error);
      return false;
    }
  }

  async getAllBookings() {
    try {
      console.log("MongoDbService: Fetching all bookings");
      
      // Try direct MongoDB service first
      try {
        const bookings = await mongoBookingService.getAllBookings();
        if (Array.isArray(bookings) && bookings.length > 0) {
          console.log(`Found ${bookings.length} bookings via MongoDB service`);
          return bookings;
        }
      } catch (mongoError) {
        console.error("MongoDB bookings fetch error:", mongoError);
      }
      
      // Try direct API fetch as fallback
      try {
        console.log("Fetching all bookings from API");
        const response = await apiService.request('bookings/all', 'GET');
        if (response?.data && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} bookings via API`);
          return response.data;
        }
      } catch (apiError) {
        console.error("API bookings fetch error:", apiError);
      }
      
      // If both failed, return empty array
      console.log("Failed to fetch bookings from both MongoDB and API");
      return [];
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
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

  async getAllCourses() {
    try {
      return await mongoCourseService.getAllCourses();
    } catch (error) {
      console.error('Error fetching courses from MongoDB:', error);
      return [];
    }
  }

  async getCourseById(courseId: string) {
    try {
      return await mongoCourseService.getCourseById(courseId);
    } catch (error) {
      console.error('Error fetching course from MongoDB:', error);
      return null;
    }
  }

  async createCourse(courseData: any) {
    try {
      return await mongoCourseService.createCourse(courseData);
    } catch (error) {
      console.error('Error creating course in MongoDB:', error);
      return false;
    }
  }

  async updateCourse(courseId: string, updateData: any) {
    try {
      return await mongoCourseService.updateCourse(courseId, updateData);
    } catch (error) {
      console.error('Error updating course in MongoDB:', error);
      return false;
    }
  }

  async deleteCourse(courseId: string) {
    try {
      return await mongoCourseService.deleteCourse(courseId);
    } catch (error) {
      console.error('Error deleting course from MongoDB:', error);
      return false;
    }
  }

  async getAllQuizzes() {
    try {
      return await mongoQuizService.getAllQuizzes();
    } catch (error) {
      console.error('Error fetching quizzes from MongoDB:', error);
      return [];
    }
  }

  async getQuizById(quizId: string) {
    try {
      return await mongoQuizService.getQuizById(quizId);
    } catch (error) {
      console.error('Error fetching quiz from MongoDB:', error);
      return null;
    }
  }

  async createQuiz(quizData: any) {
    try {
      return await mongoQuizService.createQuiz(quizData);
    } catch (error) {
      console.error('Error creating quiz in MongoDB:', error);
      return false;
    }
  }

  async updateQuiz(quizId: string, updateData: any) {
    try {
      return await mongoQuizService.updateQuiz(quizId, updateData);
    } catch (error) {
      console.error('Error updating quiz in MongoDB:', error);
      return false;
    }
  }

  async deleteQuiz(quizId: string) {
    try {
      return await mongoQuizService.deleteQuiz(quizId);
    } catch (error) {
      console.error('Error deleting quiz from MongoDB:', error);
      return false;
    }
  }
}

const mongoDbService = new MongoDbService();
export default mongoDbService;
