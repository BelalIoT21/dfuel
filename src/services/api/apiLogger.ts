
/**
 * API Logger for tracking requests and responses
 */
export class ApiLogger {
  private static instance: ApiLogger;
  
  private constructor() {}

  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  /**
   * Log an API request
   */
  public logRequest(method: string, url: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🚀 API Request: ${method} ${url}`);
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      console.log(`[${timestamp}] Request payload:`, 
        typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    }
  }

  /**
   * Log an API response
   */
  public logResponse(method: string, url: string, status: number, data?: any, duration?: number): void {
    const timestamp = new Date().toISOString();
    const durationText = duration ? `(${duration.toFixed(2)}ms)` : '';
    
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

  /**
   * Log an API error
   */
  public logError(method: string, url: string, error: any): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ API Error: ${method} ${url}`);
    console.error(`[${timestamp}] Error details:`, error);
  }
}

// Export a singleton instance
export const apiLogger = ApiLogger.getInstance();
