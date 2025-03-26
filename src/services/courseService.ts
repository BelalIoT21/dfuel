
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
      console.log(`Updating course ${courseId} image:`, imageUrl ? "New image provided" : "Removing image");
      
      // Simple check if imageUrl is provided but empty
      if (imageUrl === "") {
        console.warn("Empty image URL provided, treating as null");
        imageUrl = null;
      }
      
      const data = imageUrl === null ? { imageUrl: null } : { imageUrl };
      
      // For large payloads, log the size
      if (imageUrl) {
        const sizeKB = (imageUrl.length / 1024).toFixed(2);
        const sizeMB = (imageUrl.length / (1024 * 1024)).toFixed(2);
        console.log(`Image size being sent: ${sizeKB}KB (${sizeMB}MB)`);
        
        if (imageUrl.length > 5 * 1024 * 1024) { // 5MB
          console.warn(`Image size (${sizeMB}MB) exceeds recommended maximum (5MB)`);
          return { error: "Image exceeds maximum size of 5MB" };
        }
      }
      
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
