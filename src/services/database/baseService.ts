
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
      
      // For 404 errors, don't log as errors since these might be expected in some cases
      if (response.status === 404) {
        console.log(`${errorMessage}: Endpoint not found (404)`);
      } else {
        console.error(`${errorMessage}: ${response.error || 'Unknown error'}`);
      }
      
      return null;
    } catch (error) {
      // Check if this is a "not found" error, which might be expected
      const isNotFoundError = error instanceof Error && 
        (error.message.includes('404') || error.message.includes('not found'));
      
      if (isNotFoundError) {
        console.log(`${errorMessage}: Resource not found`);
      } else {
        console.error(`${errorMessage}:`, error);
      }
      
      return null;
    }
  }
}
