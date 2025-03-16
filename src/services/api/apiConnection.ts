
import { getEnv } from '@/utils/env';
import { toast } from '@/components/ui/use-toast';

/**
 * API Connection utility for handling base URL and connection status
 */
export class ApiConnection {
  private static instance: ApiConnection;
  private baseUrl: string;
  private isConnected: boolean = false;
  private connectionChecked: boolean = false;
  private connectionCheckTimestamp: number = 0;
  private connectionCheckInterval: number = 30000; // 30 seconds

  private constructor() {
    this.baseUrl = this.validateApiUrl(getEnv('API_URL', 'http://localhost:4000/api'));
    console.log(`API Connection initialized with base URL: ${this.baseUrl}`);
  }

  public static getInstance(): ApiConnection {
    if (!ApiConnection.instance) {
      ApiConnection.instance = new ApiConnection();
    }
    return ApiConnection.instance;
  }

  /**
   * Validate and normalize API URL
   */
  private validateApiUrl(url: string): string {
    // Verify the URL is an HTTP/HTTPS URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      console.error('Invalid API URL format. API URL must start with http:// or https://');
      // Default to a reasonable API URL
      return 'http://localhost:4000/api';
    }

    // Ensure URL doesn't end with slash for consistent concatenation
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  /**
   * Get the base URL for API requests
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set a new base URL
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = this.validateApiUrl(url);
    this.isConnected = false;
    this.connectionChecked = false;
    console.log(`API base URL changed to: ${this.baseUrl}`);
  }

  /**
   * Check if the server is reachable
   */
  public async checkConnection(force: boolean = false): Promise<boolean> {
    // Don't check too frequently unless forced
    const now = Date.now();
    if (!force && 
        this.connectionChecked && 
        (now - this.connectionCheckTimestamp < this.connectionCheckInterval)) {
      return this.isConnected;
    }
    
    try {
      const endpoint = `${this.baseUrl}/health`;
      console.log(`Checking API connection at: ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include'
      });
      
      clearTimeout(timeoutId);
      
      this.isConnected = response.ok;
      this.connectionChecked = true;
      this.connectionCheckTimestamp = now;
      
      if (this.isConnected) {
        console.log('API connection successful');
      } else {
        console.error(`API connection failed with status: ${response.status}`);
      }
      
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      this.connectionChecked = true;
      this.connectionCheckTimestamp = now;
      console.error('API connection check failed:', error);
      return false;
    }
  }

  /**
   * Check server with detailed information
   */
  public async getServerInfo(): Promise<any> {
    try {
      const endpoint = `${this.baseUrl}/health`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      this.isConnected = true;
      this.connectionChecked = true;
      this.connectionCheckTimestamp = Date.now();
      
      const data = await response.json();
      return data;
    } catch (error) {
      this.isConnected = false;
      console.error('Server info check failed:', error);
      return null;
    }
  }

  /**
   * Get connection status
   */
  public isServerConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Has connection been checked
   */
  public hasConnectionBeenChecked(): boolean {
    return this.connectionChecked;
  }

  /**
   * Build a full URL for an endpoint
   */
  public buildUrl(endpoint: string): string {
    // Clean endpoint to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }
}

// Export a singleton instance
export const apiConnection = ApiConnection.getInstance();
