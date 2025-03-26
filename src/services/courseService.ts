
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
      if (imageUrl && imageUrl.length > 10000000) { // Increased threshold further
        console.warn("Image is very large, processing may take longer");
        
        // For extremely large images, let the request go through but warn about it
        console.log("Processing large image, this may take some time");
      }
      
      const data = imageUrl === null ? { imageUrl: null } : { imageUrl };
      const response = await apiService.put(`/courses/${courseId}`, data);
      
      if (response.error) {
        console.error(`Error updating course image: ${response.error}`);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${courseId} image:`, error);
      return null;
    }
  }
}

export const courseService = new CourseService();
