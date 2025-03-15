
import { toast } from '@/components/ui/use-toast';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ConnectionManager {
  private baseUrl: string = '';
  private connectionStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
  private maxRetries: number = 2;
  private isOffline: boolean = false;

  constructor() {
    // Use the API URL from environment or fall back to a default
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    console.log('MongoDB connection URI:', import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/learnit');
  }

  /**
   * Check the connection to the API server
   */
  public async checkConnection(): Promise<boolean> {
    try {
      console.log(`Checking connection to: ${this.baseUrl}/health`);
      this.connectionStatus = 'checking';
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      this.connectionStatus = response.ok ? 'connected' : 'disconnected';
      console.log(`Connection check result: ${this.connectionStatus ? 'Connected' : 'Disconnected'}, status: ${response.status}`);
      console.log(`Health check response data:`, data);
      
      // Set offline mode if we can't connect
      this.isOffline = !response.ok;
      
      return response.ok;
    } catch (error) {
      console.error('Connection check failed:', error);
      this.connectionStatus = 'disconnected';
      this.isOffline = true;
      return false;
    }
  }

  /**
   * Get the current connection status
   */
  public getConnectionStatus(): 'connected' | 'disconnected' | 'checking' {
    return this.connectionStatus;
  }

  /**
   * Check if we're in offline mode
   */
  public isOfflineMode(): boolean {
    return this.isOffline;
  }

  /**
   * Set offline mode manually
   */
  public setOfflineMode(offline: boolean): void {
    this.isOffline = offline;
    this.connectionStatus = offline ? 'disconnected' : 'connected';
  }

  /**
   * Make an API request with retries
   */
  public async request<T>(endpoint: string, options: RequestInit, retryCount = 0): Promise<ApiResponse<T>> {
    try {
      // Check if we're already marked as offline
      if (this.isOffline && retryCount === 0) {
        console.log(`Skipping API request to ${endpoint} in offline mode`);
        return {
          data: null,
          error: 'Offline mode',
          status: 0
        };
      }
      
      // Prepare the full URL
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
      
      console.log(`API Request: ${options.method} ${url}`);
      
      // Make the request
      const response = await fetch(url, options);
      
      // Check if the response is ok
      if (response.ok) {
        // Parse the response as JSON
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return {
            data,
            error: null,
            status: response.status
          };
        } else {
          // Return a successful response but with null data
          return {
            data: null,
            error: null,
            status: response.status
          };
        }
      } else {
        // Try to parse the error as JSON
        try {
          const errorData = await response.json();
          return {
            data: null,
            error: errorData.message || 'API request failed',
            status: response.status
          };
        } catch (e) {
          return {
            data: null,
            error: `API request failed with status ${response.status}`,
            status: response.status
          };
        }
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Retry the request if we haven't reached the maximum number of retries
      if (retryCount < this.maxRetries) {
        console.log(`Retrying API request (${retryCount + 1}/${this.maxRetries})...`);
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      // Mark as offline after retries fail
      if (retryCount === this.maxRetries) {
        this.isOffline = true;
        this.connectionStatus = 'disconnected';
      }
      
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0
      };
    }
  }
  
  // Get the base URL
  public getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export a singleton instance
export const connectionManager = new ConnectionManager();
