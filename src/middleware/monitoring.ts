import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { loggers } from '../utils/logger';
import { AuthRequest } from './auth';

// Performance monitoring middleware
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  // Override res.end to capture response time and memory usage
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;

    loggers.performance('Request performance metrics', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
      memoryUsed: Math.round(memoryUsed / 1024), // Convert to KB
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Alert on slow requests (> 5 seconds)
    if (responseTime > 5000) {
      loggers.security('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime,
        statusCode: res.statusCode,
        ip: req.ip,
        severity: 'medium'
      });
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Real-time audit logging middleware
export const auditMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody: any;

  // Override response methods to capture response data
  res.send = function(data) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  res.json = function(data) {
    responseBody = data;
    return originalJson.call(this, data);
  };

  // Wait for response to complete
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;

    try {
      // Determine action based on HTTP method and path
      const action = determineAction(req.method, req.originalUrl);
      const resource = determineResource(req.originalUrl);
      const category = determineCategory(req.method, req.originalUrl, res.statusCode);
      const severity = determineSeverity(req.method, res.statusCode, responseTime);

      // Create audit log entry
      await AuditLog.create({
        userId: req.user?._id,
        sessionId: req.sessionId,
        action,
        resource,
        resourceId: extractResourceId(req.originalUrl, req.params),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        timestamp: new Date(),
        severity,
        category,
        compliance: ['SOC2'],
        metadata: {
          responseTime,
          requestSize: req.get('Content-Length') || 0,
          responseSize: res.get('Content-Length') || 0,
          requestBody: sanitizeRequestBody(req.body),
          responseBody: sanitizeResponseBody(responseBody),
          queryParams: req.query,
          headers: sanitizeHeaders(req.headers)
        },
        risk_level: assessRiskLevel(req, res, responseTime)
      });

      // Log high-risk activities
      if (severity === 'high' || severity === 'critical') {
        loggers.security('High-risk activity detected', {
          userId: req.user?._id,
          action,
          resource,
          statusCode: res.statusCode,
          ip: req.ip,
          endpoint: req.originalUrl,
          responseTime
        });
      }

    } catch (error) {
      loggers.error('Failed to create audit log', error as Error, {
        endpoint: req.originalUrl,
        method: req.method,
        userId: req.user?._id
      });
    }
  });

  next();
};

// Helper functions
function determineAction(method: string, path: string): string {
  if (path.includes('/auth/login')) return 'login';
  if (path.includes('/auth/logout')) return 'logout';
  if (path.includes('/auth/register')) return 'register';
  
  switch (method) {
    case 'GET': return 'read';
    case 'POST': return 'create';
    case 'PUT': return 'update';
    case 'PATCH': return 'modify';
    case 'DELETE': return 'delete';
    default: return 'unknown';
  }
}

function determineResource(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'root';
  
  // Extract main resource from path
  if (segments[0] === 'api') {
    return segments[1] || 'api';
  }
  return segments[0];
}

function determineCategory(method: string, path: string, statusCode: number): string {
  if (path.includes('/auth/')) return 'authentication';
  if (statusCode >= 400) return 'error';
  if (method === 'GET') return 'data-access';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return 'data-modification';
  return 'system-access';
}

function determineSeverity(method: string, statusCode: number, responseTime: number): 'low' | 'medium' | 'high' | 'critical' {
  if (statusCode >= 500) return 'critical';
  if (statusCode >= 400) return 'high';
  if (responseTime > 10000) return 'medium'; // > 10 seconds
  if (['DELETE', 'PUT'].includes(method)) return 'medium';
  return 'low';
}

function assessRiskLevel(req: AuthRequest, res: Response, responseTime: number): 'low' | 'medium' | 'high' | 'critical' {
  let riskScore = 0;

  // High-risk operations
  if (['DELETE', 'PUT'].includes(req.method)) riskScore += 2;
  if (req.originalUrl.includes('/admin/')) riskScore += 3;
  if (res.statusCode >= 400) riskScore += 2;
  if (responseTime > 5000) riskScore += 1;
  
  // High-risk endpoints
  const highRiskPaths = ['/auth/', '/admin/', '/config/', '/users/'];
  if (highRiskPaths.some(path => req.originalUrl.includes(path))) riskScore += 2;

  // Multiple failed attempts from same IP
  // (This would require checking recent logs - simplified for now)
  if (res.statusCode === 401 || res.statusCode === 403) riskScore += 2;

  if (riskScore >= 6) return 'critical';
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

function extractResourceId(path: string, params: any): string | undefined {
  // Try to extract ID from path parameters
  if (params && params.id) return params.id;
  
  // Try to extract from path segments
  const segments = path.split('/');
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    // Look for MongoDB ObjectId pattern or UUID pattern
    if (segment.match(/^[0-9a-fA-F]{24}$/) || segment.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      return segment;
    }
  }
  
  return undefined;
}

function sanitizeRequestBody(body: any): any {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'auth'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

function sanitizeResponseBody(body: any): any {
  if (!body) return undefined;
  
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    const sanitized = { ...parsed };
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'auth'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  } catch {
    return '[UNPARSEABLE]';
  }
}

function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  
  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Health check endpoint monitoring
export const healthCheckMonitoring = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path === '/healthz') {
    const healthData = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      env: process.env.NODE_ENV,
      version: process.env.APP_VERSION || '1.0.0'
    };

    loggers.performance('Health check performed', healthData);
    
    res.json({
      status: 'healthy',
      ...healthData
    });
    return;
  }
  
  next();
};