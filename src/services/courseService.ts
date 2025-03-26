
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
  
  async updateCourseImage(courseId: string, imageUrl: string | null) {
    try {
      console.log(`Updating course ${courseId} image:`, imageUrl ? "New image" : "Removing image");
      
      // Check if imageUrl is too large
      if (imageUrl && imageUrl.length > 2000000) {
        console.warn("Image is very large, processing may take longer");
      }
      
      const data = imageUrl === null ? { imageUrl: null } : { imageUrl };
      const response = await apiService.put(`/courses/${courseId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${courseId} image:`, error);
      return null;
    }
  }
}

export const courseService = new CourseService();
