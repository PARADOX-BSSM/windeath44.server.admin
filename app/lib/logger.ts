// Secure logging utility
// Prevents sensitive information from being logged

interface LogContext {
  [key: string]: any;
}

interface SensitiveFields {
  [key: string]: string | string[];
}

class SecureLogger {
  private isDevelopment: boolean;
  private logLevel: string;
  private sensitiveFields: SensitiveFields = {
    password: '***REDACTED***',
    secret: '***REDACTED***',
    jwt: '***REDACTED***', 
    token: '***REDACTED***',
    key: '***REDACTED***',
    auth: '***REDACTED***',
    cookie: '***REDACTED***',
    session: '***REDACTED***',
    credential: '***REDACTED***',
    authorization: '***REDACTED***'
  };

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        
        // Check if key contains sensitive information
        const isSensitive = Object.keys(this.sensitiveFields).some(
          sensitive => lowerKey.includes(sensitive)
        );
        
        if (isSensitive) {
          sanitized[key] = '***REDACTED***';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private sanitizeString(str: string): string {
    // Remove JWT tokens
    str = str.replace(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*/g, '***JWT_TOKEN***');
    
    // Remove API keys
    str = str.replace(/[a-zA-Z0-9]{32,}/g, (match) => {
      if (match.length >= 32) {
        return '***API_KEY***';
      }
      return match;
    });
    
    // Remove bearer tokens
    str = str.replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer ***TOKEN***');
    
    return str;
  }

  private formatMessage(level: string, message: string, context?: LogContext): any {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? this.sanitizeData(context) : {};
    
    if (process.env.LOG_FORMAT === 'json') {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message: this.sanitizeString(message),
        ...sanitizedContext,
        env: this.isDevelopment ? 'development' : 'production'
      });
    } else {
      const contextStr = Object.keys(sanitizedContext).length > 0 
        ? ` ${JSON.stringify(sanitizedContext)}` 
        : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${this.sanitizeString(message)}${contextStr}`;
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = error instanceof Error 
        ? { 
            error: error.message, 
            stack: this.isDevelopment ? error.stack : '***REDACTED***',
            name: error.name 
          }
        : { error };
      
      const fullContext = { ...context, ...errorContext };
      console.error(this.formatMessage('error', message, fullContext));
    }
  }

  // Security event logging
  security(event: string, details?: LogContext): void {
    const securityContext = {
      event,
      ...details,
      timestamp: new Date().toISOString(),
      level: 'SECURITY'
    };
    
    console.warn(this.formatMessage('warn', `Security Event: ${event}`, securityContext));
  }
}

export const logger = new SecureLogger();
export default logger;