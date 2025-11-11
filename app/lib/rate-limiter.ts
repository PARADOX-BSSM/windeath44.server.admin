// Rate limiting utility for API endpoints
import { NextRequest } from 'next/server';
import { logger } from './logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitData>();
  private defaultConfig: RateLimitConfig = {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    keyGenerator: (request: NextRequest) => {
      return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    }
  };

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }

  checkLimit(request: NextRequest, config?: Partial<RateLimitConfig>): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = finalConfig.keyGenerator!(request);
    const now = Date.now();
    
    let data = this.store.get(key);
    
    if (!data || now > data.resetTime) {
      // Create new window
      data = {
        count: 1,
        resetTime: now + finalConfig.windowMs
      };
      this.store.set(key, data);
      
      return {
        allowed: true,
        limit: finalConfig.maxRequests,
        remaining: finalConfig.maxRequests - 1,
        resetTime: data.resetTime
      };
    }
    
    // Check if limit exceeded
    if (data.count >= finalConfig.maxRequests) {
      logger.security('rate_limit_exceeded', {
        ip: key,
        count: data.count,
        limit: finalConfig.maxRequests,
        path: new URL(request.url).pathname
      });
      
      return {
        allowed: false,
        limit: finalConfig.maxRequests,
        remaining: 0,
        resetTime: data.resetTime
      };
    }
    
    // Increment counter
    data.count++;
    this.store.set(key, data);
    
    return {
      allowed: true,
      limit: finalConfig.maxRequests,
      remaining: finalConfig.maxRequests - data.count,
      resetTime: data.resetTime
    };
  }

  // Middleware helper
  middleware(config?: Partial<RateLimitConfig>) {
    return (request: NextRequest) => {
      const result = this.checkLimit(request, config);
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }
      
      return null; // Allow request to continue
    };
  }
}

export const rateLimiter = new RateLimiter();
export default rateLimiter;