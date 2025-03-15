
/**
 * Unified logging system for client-side debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Environment-aware logging that can be easily toggled
const isDevEnvironment = () => {
  return process.env.NODE_ENV !== 'production';
};

// Log levels with color coding
const LOG_COLORS = {
  debug: '#9ca3af', // gray
  info: '#3b82f6',  // blue
  warn: '#f59e0b',  // amber 
  error: '#ef4444', // red
};

class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  /**
   * Internal logging method with consistent formatting
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!isDevEnvironment() && level === 'debug') {
      return; // Skip debug logs in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    
    // Add colors in browser console
    const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`;
    
    if (args.length > 0) {
      console.log(`%c${prefix} ${message}`, style, ...args);
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  // Create a child logger with a specific context
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`);
  }
}

// Create and export a default logger instance
export const logger = new Logger();

// Export the class to allow for context-specific logger instances
export default Logger;
