
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
    return this.apiRequest(
      async () => await apiService.request('quizzes', 'GET', undefined, true),
      'Could not get all quizzes'
    ) || [];
  }

  async getQuizById(quizId: string): Promise<any> {
    return this.apiRequest(
      async () => await apiService.request(`quizzes/${quizId}`, 'GET', undefined, true),
      `Could not get quiz ${quizId}`
    );
  }

  async createQuiz(quizData: QuizData): Promise<any> {
    return this.apiRequest(
      async () => await apiService.request('quizzes', 'POST', quizData, true),
      'Could not create quiz'
    );
  }

  async updateQuiz(quizId: string, quizData: Partial<QuizData>): Promise<any> {
    return this.apiRequest(
      async () => await apiService.request(`quizzes/${quizId}`, 'PUT', quizData, true),
      `Could not update quiz ${quizId}`
    );
  }

  async deleteQuiz(quizId: string): Promise<boolean> {
    const result = await this.apiRequest(
      async () => await apiService.request(`quizzes/${quizId}`, 'DELETE', undefined, true),
      `Could not delete quiz ${quizId}`
    );
    
    return !!result;
  }
}

// Create a singleton instance
export const quizDatabaseService = new QuizDatabaseService();
