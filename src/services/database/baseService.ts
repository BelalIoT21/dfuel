
import { apiService } from '../apiService';
import { localStorageService } from '../localStorageService';

/**
 * Base class for database services that provides common functionality
 * and fallback mechanisms.
 */
export class BaseService {
  protected async apiRequest<T>(
    apiCall: () => Promise<{ data: T | null; error: string | null; status: number }>,
    fallbackCall: () => T | null | undefined,
    errorMessage: string
  ): Promise<T | null | undefined> {
    try {
      const response = await apiCall();
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error(`${errorMessage}, falling back to localStorage:`, error);
    }
    
    // Fallback to localStorage
    return fallbackCall();
  }
}
