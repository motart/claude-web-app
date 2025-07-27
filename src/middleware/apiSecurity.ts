import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { loggers } from '../utils/logger';
import { AuthRequest } from './auth';

// API Key authentication middleware
export interface ApiKeyRequest extends Request {
  apiKeyData?: {
    keyId: string;
    userId: string;
    permissions: string[];
    rateLimit: number;
  };
}

export const apiKeyAuth = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    // Hash the provided API key to compare with stored hash
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Here you would look up the API key in your database
    // For now, we'll simulate the lookup
    const apiKeyData = await validateApiKey(hashedKey);
    
    if (!apiKeyData) {
      loggers.security('Invalid API key attempted', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        hashedKey: hashedKey.substring(0, 8) + '...' // Log partial hash for debugging
      });
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check if API key is still active
    if (!apiKeyData.isActive) {
      loggers.security('Inactive API key attempted', {
        keyId: apiKeyData.keyId,
        userId: apiKeyData.userId,
        ip: req.ip,
        endpoint: req.originalUrl
      });
      return res.status(401).json({ error: 'API key inactive' });
    }

    // Log successful API key authentication
    loggers.auth('API key authentication successful', {
      keyId: apiKeyData.keyId,
      userId: apiKeyData.userId,
      ip: req.ip,
      endpoint: req.originalUrl
    });

    req.apiKeyData = apiKeyData;
    next();
  } catch (error) {
    loggers.error('API key validation error', error as Error, {
      ip: req.ip,
      endpoint: req.originalUrl
    });
    res.status(500).json({ error: 'Authentication service error' });
  }
};

// API permission middleware
export const requireApiPermission = (...permissions: string[]) => {
  return (req: ApiKeyRequest, res: Response, next: NextFunction) => {
    if (!req.apiKeyData) {
      return res.status(401).json({ error: 'API authentication required' });
    }

    const hasPermission = permissions.some(permission => 
      req.apiKeyData!.permissions.includes(permission) || 
      req.apiKeyData!.permissions.includes('admin')
    );

    if (!hasPermission) {
      loggers.security('API permission denied', {
        keyId: req.apiKeyData.keyId,
        userId: req.apiKeyData.userId,
        requiredPermissions: permissions,
        userPermissions: req.apiKeyData.permissions,
        endpoint: req.originalUrl,
        ip: req.ip
      });
      return res.status(403).json({ error: 'Insufficient API permissions' });
    }

    next();
  };
};

// Request signature validation (HMAC)
export const validateRequestSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.header('X-Signature');
  const timestamp = req.header('X-Timestamp');
  const apiKey = req.header('X-API-Key');

  if (!signature || !timestamp || !apiKey) {
    return res.status(401).json({ error: 'Missing signature headers' });
  }

  // Check timestamp to prevent replay attacks (5-minute window)
  const now = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp);
  
  if (Math.abs(now - requestTime) > 300) { // 5 minutes
    loggers.security('Request timestamp out of bounds', {
      requestTime: new Date(requestTime * 1000).toISOString(),
      currentTime: new Date(now * 1000).toISOString(),
      ip: req.ip,
      endpoint: req.originalUrl
    });
    return res.status(401).json({ error: 'Request timestamp invalid' });
  }

  try {
    // Reconstruct the request for signature validation
    const body = JSON.stringify(req.body || {});
    const method = req.method;
    const path = req.originalUrl;
    const stringToSign = `${method}\n${path}\n${timestamp}\n${body}`;

    // Get the API key secret (this would come from your database)
    const apiSecret = process.env.API_SECRET || 'default-secret';
    const expectedSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(stringToSign)
      .digest('hex');

    if (signature !== expectedSignature) {
      loggers.security('Invalid request signature', {
        ip: req.ip,
        endpoint: req.originalUrl,
        providedSignature: signature.substring(0, 8) + '...',
        expectedSignature: expectedSignature.substring(0, 8) + '...'
      });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  } catch (error) {
    loggers.error('Signature validation error', error as Error, {
      ip: req.ip,
      endpoint: req.originalUrl
    });
    res.status(500).json({ error: 'Signature validation failed' });
  }
};

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    // Support for CIDR notation and specific IPs
    const isAllowed = allowedIPs.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR notation - simplified check (production should use proper CIDR library)
        const [network, maskBits] = allowedIP.split('/');
        return clientIP.startsWith(network.split('.').slice(0, Math.floor(parseInt(maskBits) / 8)).join('.'));
      }
      return clientIP === allowedIP;
    });

    if (!isAllowed) {
      loggers.security('IP address not whitelisted', {
        ip: clientIP,
        allowedIPs: allowedIPs.length,
        endpoint: req.originalUrl,
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ error: 'IP address not authorized' });
    }

    next();
  };
};

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Check Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      loggers.security('Invalid content type', {
        contentType,
        method: req.method,
        endpoint: req.originalUrl,
        ip: req.ip
      });
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }

    // Check request size
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    if (contentLength > maxSize) {
      loggers.security('Request size too large', {
        contentLength,
        maxSize,
        endpoint: req.originalUrl,
        ip: req.ip
      });
      return res.status(413).json({ error: 'Request too large' });
    }
  }

  // Validate required headers
  const requiredHeaders = ['User-Agent'];
  const missingHeaders = requiredHeaders.filter(header => !req.get(header));

  if (missingHeaders.length > 0) {
    loggers.security('Missing required headers', {
      missingHeaders,
      endpoint: req.originalUrl,
      ip: req.ip
    });
    return res.status(400).json({ error: 'Missing required headers' });
  }

  next();
};

// API versioning middleware
export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  const acceptedVersion = req.header('Accept-Version') || req.query.version || '1.0';
  const supportedVersions = ['1.0', '1.1', '2.0'];

  if (!supportedVersions.includes(acceptedVersion as string)) {
    return res.status(400).json({ 
      error: 'Unsupported API version',
      supportedVersions,
      requestedVersion: acceptedVersion
    });
  }

  // Set the API version in the response header
  res.set('API-Version', acceptedVersion as string);
  
  // Add version to request object
  (req as any).apiVersion = acceptedVersion;

  next();
};

// Request ID middleware for tracking
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.header('X-Request-ID') || crypto.randomUUID();
  
  // Add request ID to request object
  (req as any).id = requestId;
  
  // Add to response headers
  res.set('X-Request-ID', requestId);
  
  // Add to logger context
  loggers.auth('Request started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next();
};

// Simulate API key validation (replace with actual database lookup)
async function validateApiKey(hashedKey: string): Promise<any> {
  // This is a simulation - in production, this would query your database
  const mockApiKeys: Record<string, any> = {
    'simulated_hash_1': {
      keyId: 'api_key_1',
      userId: 'user_1',
      permissions: ['read', 'write'],
      rateLimit: 100,
      isActive: true
    }
  };

  return mockApiKeys[hashedKey] || null;
}

// Security headers for API responses
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  });

  next();
};