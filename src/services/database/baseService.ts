
import { apiService } from '../apiService';

/**
 * Base class for database services that provides common functionality
 * and uses MongoDB API exclusively.
 */
export class BaseService {
  protected async apiRequest<T>(
    apiCall: () => Promise<{ data: T | null; error: string | null; status: number }>,
    errorMessage: string
  ): Promise<T | null | undefined> {
    try {
      const response = await apiCall();
      if (response.data) {
        return response.data;
      }
      console.error(`${errorMessage}: ${response.error || 'Unknown error'}`);
      return null;
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return null;
    }
  }
}
