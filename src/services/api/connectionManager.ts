
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ConnectionManager {
  private baseUrl: string = '';
  private connectionStatus: 'connected' | 'disconnected' | 'checking' = 'checking';
  private maxRetries: number = 2;
  private lastConnectionCheck: number = 0;
  private connectionCheckInterval: number = 10000; // 10 seconds

  constructor() {
    // Use the API URL from environment or fall back to a default
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    console.log('API URL:', this.baseUrl);
    
    // Initial connection check
    this.checkConnection().catch(() => {
      console.log('Initial connection check failed');
      this.connectionStatus = 'disconnected';
    });
  }

  /**
   * Check the connection to the API server
   */
  public async checkConnection(): Promise<boolean> {
    try {
      // Only check if we haven't checked in the last interval
      const now = Date.now();
      if (now - this.lastConnectionCheck < this.connectionCheckInterval) {
        return this.connectionStatus === 'connected';
      }
      
      this.lastConnectionCheck = now;
      this.connectionStatus = 'checking';
      console.log(`Checking connection to: ${this.baseUrl}/health`);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Add a timeout to the fetch request
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const data = await response.json();
      
      this.connectionStatus = response.ok ? 'connected' : 'disconnected';
      
      console.log(`Connection check result: ${response.ok ? 'Connected' : 'Disconnected'}, status: ${response.status}`);
      console.log(`Health check response data:`, data);
      
      return response.ok;
    } catch (error) {
      console.error('Connection check failed:', error);
      this.connectionStatus = 'disconnected';
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
   * Make an API request with retries
   */
  public async request<T>(endpoint: string, options: RequestInit, retryCount = 0): Promise<ApiResponse<T>> {
    try {
      // Prepare the full URL
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
      
      console.log(`API Request: ${options.method} ${url}`);
      
      // Add timeout to the request
      options.signal = options.signal || AbortSignal.timeout(10000); // 10 second timeout
      
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
