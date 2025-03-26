
import { apiService } from './apiService';

class CourseService {
  async getCourses() {
    try {
      console.log('Fetching all courses');
      const response = await apiService.get('/courses');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  async getCourseById(courseId: string) {
    try {
      console.log(`Fetching course ${courseId}`);
      const response = await apiService.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  }
}

export const courseService = new CourseService();
