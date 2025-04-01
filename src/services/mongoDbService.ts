import mongoConnectionService from './mongodb/connectionService';
import mongoUserService from './mongodb/userService';
import mongoMachineService from './mongodb/machineService';
import mongoCourseService from './mongodb/courseService';
import mongoQuizService from './mongodb/quizService';
import mongoBookingService from './mongodb/bookingService';

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
      return await mongoUserService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user from MongoDB:', error);
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
