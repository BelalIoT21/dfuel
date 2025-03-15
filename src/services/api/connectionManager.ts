
import { toast } from "@/components/ui/use-toast";

interface ConnectionConfig {
  apiUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Default configuration
const defaultConfig: ConnectionConfig = {
  apiUrl: 'http://localhost:4000/api',
  timeout: 10000,
  retryAttempts: 2,
  retryDelay: 1000
};

class ConnectionManager {
  private config: ConnectionConfig;
  private isConnected: boolean = false;
  private connectionListeners: ((status: boolean) => void)[] = [];
  
  constructor() {
    // Load config from localStorage if available, otherwise use defaults
    const savedConfig = localStorage.getItem('api_connection_config');
    this.config = savedConfig ? JSON.parse(savedConfig) : { ...defaultConfig };
    
    // Initialize with a connection check
    this.checkConnection();
  }
  
  // Get the current connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  // Get the current API URL
  public getApiUrl(): string {
    return this.config.apiUrl;
  }
  
  // Update the API URL
  public setApiUrl(url: string): void {
    this.config.apiUrl = url;
    this.saveConfig();
    this.checkConnection();
  }
  
  // Reset to default configuration
  public resetToDefault(): void {
    this.config = { ...defaultConfig };
    this.saveConfig();
    this.checkConnection();
  }
  
  // Save configuration to localStorage
  private saveConfig(): void {
    localStorage.setItem('api_connection_config', JSON.stringify(this.config));
  }
  
  // Add a connection status listener
  public addConnectionListener(listener: (status: boolean) => void): () => void {
    this.connectionListeners.push(listener);
    // Return a function to remove this listener
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }
  
  // Notify all listeners about connection status changes
  private notifyListeners(): void {
    this.connectionListeners.forEach(listener => listener(this.isConnected));
  }
  
  // Check the server connection
  public async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      console.log(`Checking connection to: ${this.config.apiUrl}/health`);
      
      const response = await fetch(`${this.config.apiUrl.replace(/\/api\/?$/, '')}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const wasConnected = this.isConnected;
      this.isConnected = response.ok;
      
      console.log(`Connection check result: ${this.isConnected ? 'Connected' : 'Disconnected'}, status: ${response.status}`);
      
      // Parse the response JSON for better logging
      let responseData = null;
      try {
        responseData = await response.clone().json();
        console.log('Health check response data:', responseData);
      } catch (e) {
        console.log('Could not parse health check response as JSON');
      }
      
      // Only notify if the status changed
      if (wasConnected !== this.isConnected) {
        this.notifyListeners();
        
        if (this.isConnected) {
          toast({
            title: "Server Connected",
            description: `Successfully connected to ${this.config.apiUrl}`,
          });
        } else {
          toast({
            title: "Server Connection Issue",
            description: `Server responded with status ${response.status}`,
            variant: "destructive"
          });
        }
      }
      
      return this.isConnected;
    } catch (error) {
      console.error("Connection check failed:", error);
      
      const wasConnected = this.isConnected;
      this.isConnected = false;
      
      // Only notify if the status changed
      if (wasConnected !== this.isConnected) {
        this.notifyListeners();
        
        toast({
          title: "Server Connection Failed",
          description: error instanceof Error ? error.message : "Could not connect to the server",
          variant: "destructive"
        });
      }
      
      return false;
    }
  }
  
  // Make an API request with the current configuration
  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<{ data: T | null; error: string | null; status: number }> {
    try {
      const url = `${this.config.apiUrl}/${endpoint.replace(/^\//, '')}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      // Parse response based on content type
      let data: T | null = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json') && response.status !== 204) {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      }
      
      // Update connection status based on this request
      const wasConnected = this.isConnected;
      this.isConnected = true;
      if (!wasConnected) {
        this.notifyListeners();
      }
      
      // Handle error responses
      if (!response.ok) {
        const errorMessage = data && typeof data === 'object' && 'message' in data 
          ? String(data.message) 
          : `Error ${response.status}: ${response.statusText}`;
          
        console.error(`API error for ${url}: ${errorMessage}`);
        
        return {
          data: null,
          error: errorMessage,
          status: response.status
        };
      }
      
      return {
        data,
        error: null,
        status: response.status
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Handle retry logic
      if (retryCount < this.config.retryAttempts) {
        console.log(`Retrying API request (${retryCount + 1}/${this.config.retryAttempts})...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      // Update connection status if all retries failed
      const wasConnected = this.isConnected;
      this.isConnected = false;
      if (wasConnected) {
        this.notifyListeners();
      }
      
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        status: 0
      };
    }
  }
}

// Export a singleton instance
export const connectionManager = new ConnectionManager();
