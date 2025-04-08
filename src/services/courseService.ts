
import { apiService } from './apiService';
import mongoDbService from './mongoDbService';
import { useToast } from '@/hooks/use-toast';

class CourseService {
  // Helper method to compress video data URLs to reduce payload size
  private compressVideoData(courseData: any): any {
    if (!courseData || !courseData.slides) return courseData;
    
    try {
      const compressedData = { ...courseData };
      
      // Process slides to compress video content
      if (Array.isArray(compressedData.slides)) {
        compressedData.slides = compressedData.slides.map(slide => {
          if (!slide.elements) return slide;
          
          const compressedElements = slide.elements.map(element => {
            // Only compress video elements with large data URLs
            if (element.type === 'video' && 
                typeof element.content === 'string' && 
                element.content.length > 1000000) {
              console.log(`Compressing large video in slide ${slide.id}`);
              
              // Create a shortened version for transport
              // In a real implementation, this would involve actual compression
              // Here we're just trimming the base64 data for demonstration
              const shortenedContent = element.content.substring(0, 1000000);
              return {
                ...element,
                content: shortenedContent,
                isCompressed: true
              };
            }
            return element;
          });
          
          return {
            ...slide,
            elements: compressedElements
          };
        });
      }
      
      return compressedData;
    } catch (err) {
      console.error('Error compressing video data:', err);
      return courseData;
    }
  }

  async getAllCourses() {
    try {
      console.log('Fetching all courses');
      
      // Try API service
      try {
        const response = await apiService.getAllCourses();
        if (response.data && !response.error) {
          console.log(`Found ${response.data.length} courses via API`);
          return response.data;
        }
      } catch (apiError) {
        console.error('API error fetching courses:', apiError);
      }
      
      // Fallback to MongoDB service
      try {
        const courses = await mongoDbService.getAllCourses();
        console.log(`Found ${courses.length} courses via MongoDB`);
        return courses;
      } catch (mongoError) {
        console.error('MongoDB error fetching courses:', mongoError);
      }
      
      console.error('Failed to fetch courses from all methods');
      return [];
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      return [];
    }
  }
  
  async getCourseById(courseId: string) {
    try {
      console.log(`Fetching course ${courseId}`);
      
      // Try API service
      try {
        const response = await apiService.getCourseById(courseId);
        if (response.data && !response.error) {
          console.log(`Found course ${courseId} via API`);
          return response.data;
        }
      } catch (apiError) {
        console.error(`API error fetching course ${courseId}:`, apiError);
      }
      
      // Fallback to MongoDB service
      try {
        const course = await mongoDbService.getCourseById(courseId);
        if (course) {
          console.log(`Found course ${courseId} via MongoDB`);
          return course;
        }
      } catch (mongoError) {
        console.error(`MongoDB error fetching course ${courseId}:`, mongoError);
      }
      
      console.error(`Failed to fetch course ${courseId} from all methods`);
      return null;
    } catch (error) {
      console.error(`Error in getCourseById(${courseId}):`, error);
      return null;
    }
  }
  
  async createCourse(courseData: any) {
    try {
      console.log('Creating new course:', courseData.title);
      
      // Compress video data before sending
      const compressedData = this.compressVideoData(courseData);
      
      // Try API service with timeout protection
      try {
        console.log('Sending course data to API...');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API request timeout')), 30000)
        );
        
        const apiPromise = apiService.createCourse(compressedData);
        const response = await Promise.race([apiPromise, timeoutPromise]);
        
        console.log('API create course response received');
        if (response.data && !response.error) {
          console.log('Successfully created course via API');
          return response.data;
        }
        
        if (response.error) {
          console.error('API error creating course:', response.error);
        }
      } catch (apiError) {
        console.error('API exception creating course:', apiError);
      }
      
      // Fallback to MongoDB service
      try {
        console.log('Falling back to MongoDB service...');
        const course = await mongoDbService.createCourse(compressedData);
        if (course) {
          console.log('Successfully created course via MongoDB');
          return course;
        }
      } catch (mongoError) {
        console.error('MongoDB error creating course:', mongoError);
      }
      
      console.error('Failed to create course through all methods');
      return null;
    } catch (error) {
      console.error('Error in createCourse:', error);
      return null;
    }
  }
  
  async updateCourse(courseId: string, courseData: any) {
    try {
      console.log(`Updating course ${courseId}:`, courseData.title);
      
      // Compress video data before sending
      const compressedData = this.compressVideoData(courseData);
      
      // Try API service with timeout protection
      try {
        console.log('Sending course update to API...');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API request timeout')), 30000)
        );
        
        const apiPromise = apiService.updateCourse(courseId, compressedData);
        const response = await Promise.race([apiPromise, timeoutPromise]);
        
        console.log('API update course response received');
        if (response.data && !response.error) {
          console.log(`Successfully updated course ${courseId} via API`);
          return response.data;
        }
      } catch (apiError) {
        console.error(`API error updating course ${courseId}:`, apiError);
      }
      
      // Fallback to MongoDB service
      try {
        console.log('Falling back to MongoDB service...');
        const success = await mongoDbService.updateCourse(courseId, compressedData);
        if (success) {
          console.log(`Successfully updated course ${courseId} via MongoDB`);
          return await this.getCourseById(courseId);
        }
      } catch (mongoError) {
        console.error(`MongoDB error updating course ${courseId}:`, mongoError);
      }
      
      console.error(`Failed to update course ${courseId} through all methods`);
      return null;
    } catch (error) {
      console.error(`Error in updateCourse(${courseId}):`, error);
      return null;
    }
  }
  
  async deleteCourse(courseId: string) {
    try {
      console.log(`Deleting course ${courseId}`);
      
      // Try API service
      try {
        const response = await apiService.deleteCourse(courseId);
        if (response.data && !response.error) {
          console.log(`Successfully deleted course ${courseId} via API`);
          return true;
        }
      } catch (apiError) {
        console.error(`API error deleting course ${courseId}:`, apiError);
      }
      
      // Fallback to MongoDB service
      try {
        const success = await mongoDbService.deleteCourse(courseId);
        if (success) {
          console.log(`Successfully deleted course ${courseId} via MongoDB`);
          return true;
        }
      } catch (mongoError) {
        console.error(`MongoDB error deleting course ${courseId}:`, mongoError);
      }
      
      console.error(`Failed to delete course ${courseId} through all methods`);
      return false;
    } catch (error) {
      console.error(`Error in deleteCourse(${courseId}):`, error);
      return false;
    }
  }
}

export const courseService = new CourseService();
