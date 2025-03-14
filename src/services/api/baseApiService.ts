
import { getEnv } from '../../utils/env';
import { toast } from '../../components/ui/use-toast';

// Define the base URL for the API, with a fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export class BaseApiService {
  protected async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any,
    authRequired: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/${endpoint}`;
      const token = localStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (authRequired && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      console.log(`Making API request: ${method} ${url}`, data ? 'with data' : '');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      options.signal = controller.signal;
      
      try {
        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        
        // Handle empty responses gracefully
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json') && response.status !== 204) {
          const text = await response.text();
          responseData = text ? JSON.parse(text) : null;
        } else {
          responseData = null;
        }
        
        if (!response.ok) {
          const errorMessage = responseData?.message || 'API request failed';
          console.error(`API error: ${response.status} - ${errorMessage}`);
          throw new Error(errorMessage);
        }
        
        return {
          data: responseData,
          error: null,
          status: response.status
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error('API request timed out:', endpoint);
          throw new Error('Request timed out');
        }
        throw error;
      }
    } catch (error) {
      console.error('API request failed:', error);
      
      // Don't show toast for health check failures, they're expected when backend is not running
      if (!endpoint.includes('health')) {
        toast({
          title: 'API Error',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: 'destructive'
        });
      }
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }
}
