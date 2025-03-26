
import { apiService } from '../apiService';
import { BaseService } from './baseService';

export interface CourseData {
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl?: string;
  relatedMachineIds?: string[];
  quizId?: string;
  difficulty: string;
}

/**
 * Service that handles all course-related database operations.
 */
export class CourseDatabaseService extends BaseService {
  async getAllCourses(): Promise<any[]> {
    return this.apiRequest(
      async () => await apiService.request('courses', 'GET', undefined, true),
      'Could not get all courses'
    ) || [];
  }

  async getCourseById(courseId: string): Promise<any> {
    return this.apiRequest(
      async () => await apiService.request(`courses/${courseId}`, 'GET', undefined, true),
      `Could not get course ${courseId}`
    );
  }

  async createCourse(courseData: CourseData): Promise<any> {
    // Check if imageUrl is too large
    if (courseData.imageUrl && courseData.imageUrl.length > 2000000) { // Increased threshold for large images
      console.warn("Course image is very large, it may cause issues with the API");
      
      // Extract base64 data without metadata
      if (courseData.imageUrl.startsWith('data:')) {
        // Compress or resize the image here if needed
        console.log("Course image is in base64 format with metadata");
      }
    }
    
    console.log("Creating course with image:", courseData.imageUrl ? "Image present" : "No image");
    
    return this.apiRequest(
      async () => await apiService.request('courses', 'POST', courseData, true),
      'Could not create course'
    );
  }

  async updateCourse(courseId: string, courseData: Partial<CourseData>): Promise<any> {
    // Handle the case where imageUrl is explicitly set to null or empty
    const payload = { ...courseData };
    
    // Check if we're trying to update with a large image
    if (payload.imageUrl && payload.imageUrl.length > 2000000) { // Increased threshold
      console.warn("Course image is very large, it may cause issues with the API");
    }
    
    if (payload.imageUrl === null || payload.imageUrl === "") {
      console.log("Removing image from course:", courseId);
      payload.imageUrl = null; // Explicitly set to null to indicate removal
    } else if (payload.imageUrl) {
      console.log("Updating course with new image");
    }
    
    // Split the request if the payload is too large
    const contentLength = JSON.stringify(payload).length;
    if (contentLength > 2000000) { // Increased threshold
      console.warn(`Payload is very large (${contentLength} bytes), splitting the request`);
      
      // First, try updating without content if it exists
      if (payload.content) {
        const contentBackup = payload.content;
        delete payload.content;
        
        // First update metadata without content
        await this.apiRequest(
          async () => await apiService.request(`courses/${courseId}`, 'PUT', payload, true),
          `Could not update course ${courseId} metadata`
        );
        
        // Then update content separately
        return this.apiRequest(
          async () => await apiService.request(`courses/${courseId}`, 'PUT', { content: contentBackup }, true),
          `Could not update course ${courseId} content`
        );
      }
    }
    
    // Regular update if payload isn't too large
    return this.apiRequest(
      async () => await apiService.request(`courses/${courseId}`, 'PUT', payload, true),
      `Could not update course ${courseId}`
    );
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    const result = await this.apiRequest(
      async () => await apiService.request(`courses/${courseId}`, 'DELETE', undefined, true),
      `Could not delete course ${courseId}`
    );
    
    return !!result;
  }
}

// Create a singleton instance
export const courseDatabaseService = new CourseDatabaseService();
