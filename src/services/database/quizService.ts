
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
    // Check if this is a user-created quiz (ID > 6)
    const isUserQuiz = !isNaN(Number(quizId)) && Number(quizId) > 6;
    
    // For non-core quizzes (ID > 6), always use permanent deletion
    if (isUserQuiz) {
      console.log(`Quiz ${quizId} is a user-created quiz, using permanent deletion`);
      permanent = true;
    }
    
    // Prepare URL with permanent flag if needed
    const deleteUrl = permanent 
      ? `quizzes/${quizId}?permanent=true`
      : `quizzes/${quizId}`;
    
    try {
      console.log(`Deleting quiz ${quizId}, permanent: ${permanent}`);
      const result = await this.apiRequest(
        async () => await apiService.request(deleteUrl, 'DELETE', undefined, true),
        `Could not delete quiz ${quizId}`
      );
      
      console.log(`Delete quiz result:`, result);
      
      // If the API call succeeds but doesn't confirm permanent deletion for user quizzes
      if (isUserQuiz && result && !result.permanentlyDeleted) {
        // Make a follow-up request to ensure it's marked as permanently deleted
        try {
          await apiService.request(`mongodb/delete-quiz`, 'POST', {
            quizId,
            permanent: true
          }, true);
          console.log(`Successfully force-deleted quiz ${quizId} via MongoDB`);
          return true;
        } catch (forceError) {
          console.error(`MongoDB force-delete failed for quiz ${quizId}:`, forceError);
        }
      }
      
      return !!result;
    } catch (error) {
      console.error(`Error deleting quiz ${quizId}:`, error);
      
      // If the API call fails for user quizzes, try a direct MongoDB delete
      if (isUserQuiz) {
        try {
          const forceDeletionResult = await apiService.request('mongodb/delete-quiz', 'POST', {
            quizId,
            permanent: true
          }, true);
          
          if (forceDeletionResult.data?.success) {
            console.log(`Successfully force-deleted quiz ${quizId} via MongoDB`);
            return true;
          }
        } catch (mongoError) {
          console.error(`MongoDB force-delete failed for quiz ${quizId}:`, mongoError);
        }
      }
      
      return false;
    }
  }
}

// Create a singleton instance
export const quizDatabaseService = new QuizDatabaseService();
