import { apiService } from '../apiService';
import { BaseService } from './baseService';

export interface QuizQuestionData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizData {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  questions: QuizQuestionData[];
  passingScore: number;
  relatedMachineIds?: string[];
  relatedCourseId?: string;
  difficulty: string;
}

/**
 * Service that handles all quiz-related database operations.
 */
export class QuizDatabaseService extends BaseService {
  async getAllQuizzes(): Promise<any[]> {
    console.log('Fetching all quizzes from API');
    const quizzes = await this.apiRequest(
      async () => await apiService.request('quizzes', 'GET', undefined, true),
      'Could not get all quizzes'
    ) || [];
    
    console.log(`Retrieved ${quizzes.length} quizzes from API`);
    return quizzes;
  }

  async getQuizById(quizId: string): Promise<any> {
    console.log(`Fetching quiz ${quizId} from API`);
    try {
      const quiz = await this.apiRequest(
        async () => await apiService.request(`quizzes/${quizId}`, 'GET', undefined, true),
        `Could not get quiz ${quizId}`
      );
      
      if (quiz) {
        console.log(`Successfully retrieved quiz: ${quiz.title} (ID: ${quiz._id})`);
        return quiz;
      } else {
        console.log(`Quiz ${quizId} not found, trying alternative lookup methods`);
        
        // Try getting all quizzes and finding the one with matching ID
        const allQuizzes = await this.getAllQuizzes();
        const matchingQuiz = allQuizzes.find(q => 
          String(q._id) === String(quizId) || 
          String(q.id) === String(quizId)
        );
        
        if (matchingQuiz) {
          console.log(`Found quiz in all quizzes list: ${matchingQuiz.title}`);
          return matchingQuiz;
        }
        
        console.log(`Quiz ${quizId} not found after trying alternative methods`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching quiz ${quizId}:`, error);
      return null;
    }
  }

  async createQuiz(quizData: QuizData): Promise<any> {
    // Check if imageUrl is too large
    if (quizData.imageUrl && quizData.imageUrl.length > 2000000) { // Increased threshold for large images
      console.warn("Quiz image is very large, it may cause issues with the API");
    }
    
    console.log("Creating quiz with image:", quizData.imageUrl ? "Image present" : "No image");
    return this.apiRequest(
      async () => await apiService.request('quizzes', 'POST', quizData, true),
      'Could not create quiz'
    );
  }

  async updateQuiz(quizId: string, quizData: Partial<QuizData>): Promise<any> {
    // Handle the case where imageUrl is explicitly set to null or empty
    const payload = { ...quizData };
    
    // Check if we're trying to update with a large image
    if (payload.imageUrl && payload.imageUrl.length > 2000000) { // Increased threshold
      console.warn("Quiz image is very large, it may cause issues with the API");
    }
    
    if (payload.imageUrl === null || payload.imageUrl === "") {
      console.log("Removing image from quiz:", quizId);
      payload.imageUrl = null; // Explicitly set to null to indicate removal
    } else if (payload.imageUrl) {
      console.log("Updating quiz with new image");
    }
    
    // Split the request if the payload is too large
    const contentLength = JSON.stringify(payload).length;
    if (contentLength > 2000000) { // Increased threshold
      console.warn(`Payload is very large (${contentLength} bytes), splitting the request`);
      
      // Handle large payloads by splitting if needed
      if (payload.questions && payload.questions.length > 0) {
        const questionsBackup = [...payload.questions];
        delete payload.questions;
        
        // First update metadata without questions
        await this.apiRequest(
          async () => await apiService.request(`quizzes/${quizId}`, 'PUT', payload, true),
          `Could not update quiz ${quizId} metadata`
        );
        
        // Then update questions separately
        return this.apiRequest(
          async () => await apiService.request(`quizzes/${quizId}`, 'PUT', { questions: questionsBackup }, true),
          `Could not update quiz ${quizId} questions`
        );
      }
    }
    
    return this.apiRequest(
      async () => await apiService.request(`quizzes/${quizId}`, 'PUT', payload, true),
      `Could not update quiz ${quizId}`
    );
  }

  async deleteQuiz(quizId: string, permanent: boolean = false): Promise<boolean> {
    // Prepare URL with permanent flag if needed
    const deleteUrl = permanent 
      ? `quizzes/${quizId}?permanent=true`
      : `quizzes/${quizId}`;
    
    const result = await this.apiRequest(
      async () => await apiService.request(deleteUrl, 'DELETE', undefined, true),
      `Could not delete quiz ${quizId}`
    );
    
    return !!result;
  }
}

// Create a singleton instance
export const quizDatabaseService = new QuizDatabaseService();
