
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
    return this.apiRequest(
      async () => await apiService.request('courses', 'POST', courseData, true),
      'Could not create course'
    );
  }

  async updateCourse(courseId: string, courseData: Partial<CourseData>): Promise<any> {
    return this.apiRequest(
      async () => await apiService.request(`courses/${courseId}`, 'PUT', courseData, true),
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
