/**
 * API Logger for tracking requests and responses
 */
export class ApiLogger {
  private static instance: ApiLogger;
  private enabled: boolean = true;
  private logToConsole: boolean = true;
  private logHistory: Array<{type: string, timestamp: string, method: string, url: string, data?: any, status?: number, duration?: number}> = [];
  private maxLogHistory: number = 100;
  
  private constructor() {}

  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  /**
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Enable or disable console logging
   */
  public setLogToConsole(enabled: boolean): void {
    this.logToConsole = enabled;
  }

  /**
   * Get the log history
   */
  public getLogHistory(): Array<{type: string, timestamp: string, method: string, url: string, data?: any, status?: number, duration?: number}> {
    return [...this.logHistory];
  }

  /**
   * Clear the log history
   */
  public clearLogHistory(): void {
    this.logHistory = [];
  }

  /**
   * Log an API request
   */
  public logRequest(method: string, url: string, data?: any): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    
    if (this.logToConsole) {
      console.log(`[${timestamp}] 🚀 API Request: ${method} ${url}`);
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        console.log(`[${timestamp}] Request payload:`, 
          typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
      }
    }
    
    // Add to history
    this.addLogEntry({
      type: 'request',
      timestamp,
      method,
      url,
      data: data && (method === 'POST' || method === 'PUT' || method === 'PATCH') ? data : undefined
    });
  }

  /**
   * Log an API response
   */
  public logResponse(method: string, url: string, status: number, data?: any, duration?: number): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const durationText = duration ? `(${duration.toFixed(2)}ms)` : '';
    
    if (this.logToConsole) {
      if (status >= 200 && status < 300) {
        console.log(`[${timestamp}] ✅ API Response: ${method} ${url} - ${status} ${durationText}`);
      } else {
        console.error(`[${timestamp}] ❌ API Response: ${method} ${url} - ${status} ${durationText}`);
      }
      
      if (data) {
        console.log(`[${timestamp}] Response data:`, 
          typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
      }
    }
    
    // Add to history
    this.addLogEntry({
      type: 'response',
      timestamp,
      method,
      url,
      status,
      data,
      duration
    });
  }

  /**
   * Log an API error
   */
  public logError(method: string, url: string, error: any): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    
    if (this.logToConsole) {
      console.error(`[${timestamp}] ❌ API Error: ${method} ${url}`);
      console.error(`[${timestamp}] Error details:`, error);
    }
    
    // Add to history
    this.addLogEntry({
      type: 'error',
      timestamp,
      method,
      url,
      data: error
    });
  }

  /**
   * Add an entry to the log history
   */
  private addLogEntry(entry: {type: string, timestamp: string, method: string, url: string, data?: any, status?: number, duration?: number}): void {
    this.logHistory.push(entry);
    
    // Keep the history at the maximum size
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory.shift();
    }
  }
}

// Export a singleton instance
export const apiLogger = ApiLogger.getInstance();
