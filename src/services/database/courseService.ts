
import { apiService } from '../apiService';
import { BaseService } from './baseService';

interface CourseData {
  title: string;
  description: string;
  duration?: string;
  difficulty?: string;
  author?: string;
  slides?: Array<{
    title?: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
  }>;
  status?: string;
  category?: string;
  startingId?: number; // Optional parameter to specify a starting ID
}

export class CourseDatabaseService extends BaseService {
  async createCourse(courseData: CourseData): Promise<any> {
    try {
      console.log("Creating course with data:", courseData);
      
      // Set a default starting ID of 5 if not specified
      // This ensures new courses don't start from 9
      const dataWithStartingId = {
        ...courseData,
        startingId: courseData.startingId || 5
      };
      
      const response = await apiService.request('courses', 'POST', dataWithStartingId, true);
      console.log("Create course response:", response);
      
      return response.data;
    } catch (error) {
      console.error("API error, could not create course:", error);
      throw new Error(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCourse(courseId: string, courseData: Partial<CourseData>): Promise<any> {
    try {
      console.log(`Updating course ${courseId} with data:`, courseData);
      const response = await apiService.request(`courses/${courseId}`, 'PUT', courseData, true);
      console.log(`Update response for course ${courseId}:`, response);
      return response.data;
    } catch (error) {
      console.error(`API error, could not update course ${courseId}:`, error);
      throw new Error(`Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCourse(courseId: string, permanent: boolean = false): Promise<boolean> {
    try {
      console.log(`Deleting course ${courseId}, permanent: ${permanent}`);
      
      // Check if this is a user-created course (ID > 6)
      const isUserCourse = !isNaN(Number(courseId)) && Number(courseId) > 6;
      
      // For non-core courses (ID > 6), always use permanent deletion
      if (isUserCourse) {
        console.log(`Course ${courseId} is a user-created course, using permanent deletion`);
        permanent = true;
      }
      
      // Prepare URL with permanent flag if needed
      const deleteUrl = permanent 
        ? `courses/${courseId}?permanent=true`
        : `courses/${courseId}`;
      
      // Try the API with appropriate parameters
      try {
        console.log(`Sending DELETE request to ${deleteUrl}`);
        const response = await apiService.request(deleteUrl, 'DELETE', undefined, true);
        console.log(`Delete course response:`, response);
        
        if (response.data && (response.data.permanentlyDeleted || !response.error)) {
          return true;
        }
        
        // If the API call succeeds but doesn't confirm permanent deletion for user courses
        if (isUserCourse && response.data && !response.data.permanentlyDeleted) {
          // Make a follow-up request to ensure it's marked as permanently deleted
          try {
            await apiService.request(`mongodb/delete-course`, 'POST', {
              courseId,
              permanent: true
            }, true);
            console.log(`Successfully force-deleted course ${courseId} via MongoDB`);
            return true;
          } catch (forceError) {
            console.error(`MongoDB force-delete failed for course ${courseId}:`, forceError);
          }
        }
        
        return !response.error;
      } catch (apiError) {
        console.error(`API error deleting course ${courseId}:`, apiError);
        
        // If the API call fails for user courses, try a direct MongoDB delete
        if (isUserCourse) {
          try {
            const forceDeletionResult = await apiService.request('mongodb/delete-course', 'POST', {
              courseId,
              permanent: true
            }, true);
            
            if (forceDeletionResult.data?.success) {
              console.log(`Successfully force-deleted course ${courseId} via MongoDB`);
              return true;
            }
          } catch (mongoError) {
            console.error(`MongoDB force-delete failed for course ${courseId}:`, mongoError);
          }
        }
        
        return false;
      }
    } catch (error) {
      console.error(`API error, could not delete course ${courseId}:`, error);
      return false;
    }
  }

  async getAllCourses(): Promise<any[]> {
    try {
      const response = await apiService.request('courses', 'GET', undefined, true);
      console.log("Course response in service:", response);
      return response.data || [];
    } catch (error) {
      console.error("API error, could not get all courses:", error);
      return [];
    }
  }

  async getCourseById(courseId: string): Promise<any> {
    try {
      const response = await apiService.request(`courses/${courseId}`, 'GET', undefined, true);
      return response.data;
    } catch (error) {
      console.error(`API error, could not get course ${courseId}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const courseDatabaseService = new CourseDatabaseService();
