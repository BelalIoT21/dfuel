import { toast } from "@/components/ui/use-toast";

interface ConnectionConfig {
  apiUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  keepAliveInterval: number;
}

// Default configuration
const defaultConfig: ConnectionConfig = {
  apiUrl: 'http://localhost:4000/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 2000,
  keepAliveInterval: 30000 // 30 seconds
};

class ConnectionManager {
  private config: ConnectionConfig;
  private isConnected: boolean = false;
  private connectionListeners: ((status: boolean) => void)[] = [];
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  
  constructor() {
    // Load config from localStorage if available, otherwise use defaults
    const savedConfig = localStorage.getItem('api_connection_config');
    this.config = savedConfig ? JSON.parse(savedConfig) : { ...defaultConfig };
    
    // Initialize with a connection check
    this.checkConnection();
    
    // Start keepalive
    this.startKeepAlive();
  }
  
  // Start the keepalive ping
  private startKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
    }
    
    this.keepAliveTimer = setInterval(() => {
      // Use the ping endpoint for keep-alive checks
      this.pingServer();
    }, this.config.keepAliveInterval);
    
    // Clean up on window unload
    window.addEventListener('beforeunload', () => {
      if (this.keepAliveTimer) {
        clearInterval(this.keepAliveTimer);
      }
    });
  }
  
  // Lightweight ping to keep the connection alive
  private async pingServer(): Promise<void> {
    try {
      const pingUrl = `${this.config.apiUrl.replace(/\/api\/?$/, '')}/ping`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Short timeout for pings
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn('Server ping failed, will check connection');
        this.checkConnection();
      } else {
        // If we were disconnected before, update the status
        if (!this.isConnected) {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyListeners();
          console.log('Server connection restored');
        }
      }
    } catch (error) {
      console.warn('Server ping failed:', error);
      if (this.isConnected) {
        // Only trigger a full connection check if we were previously connected
        this.checkConnection();
      }
    }
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
    this.reconnectAttempts = 0; // Reset reconnect attempts on manual URL change
    this.checkConnection();
  }
  
  // Reset to default configuration
  public resetToDefault(): void {
    this.config = { ...defaultConfig };
    this.saveConfig();
    this.reconnectAttempts = 0;
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
      
      const healthUrl = `${this.config.apiUrl.replace(/\/api\/?$/, '')}/health`;
      console.log(`Checking connection to: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
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
      
      // Reset reconnect attempts on successful connection
      if (this.isConnected) {
        this.reconnectAttempts = 0;
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
          
          // Schedule a reconnection attempt
          this.scheduleReconnect();
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
        
        // Schedule a reconnection attempt
        this.scheduleReconnect();
      }
      
      return false;
    }
  }
  
  // Schedule a reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      const delay = this.config.retryDelay * this.reconnectAttempts; // Exponential backoff
      console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.checkConnection();
      }, delay);
    } else {
      console.log(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up automatic reconnection.`);
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
        this.reconnectAttempts = 0;
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
        this.scheduleReconnect();
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
