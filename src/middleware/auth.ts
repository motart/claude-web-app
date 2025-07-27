import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { loggers } from '../utils/logger';
import { decryptData } from '../utils/encryption';

export interface AuthRequest extends Request {
  user?: IUser;
  sessionId?: string;
}

// Enhanced authentication with security logging
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    if (!token) {
      loggers.security('Authentication failed - No token provided', {
        ip: clientIP,
        userAgent,
        endpoint: req.originalUrl,
        method: req.method
      });
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Ensure JWT secret is properly configured
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'fallback-secret') {
      loggers.security('CRITICAL: JWT secret not configured properly', {
        environment: process.env.NODE_ENV
      });
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret) as { 
      userId: string; 
      sessionId?: string;
      iat: number;
      exp: number;
    };
    
    // Check token expiration (additional validation)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      loggers.auth('Token expired', {
        userId: decoded.userId,
        expiredAt: new Date(decoded.exp * 1000).toISOString(),
        ip: clientIP,
        userAgent
      });
      return res.status(401).json({ error: 'Token expired' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      loggers.security('Authentication failed - User not found', {
        userId: decoded.userId,
        ip: clientIP,
        userAgent,
        endpoint: req.originalUrl
      });
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Check if user account is active
    if (!user.isActive) {
      loggers.security('Authentication failed - Account disabled', {
        userId: user._id,
        email: user.email,
        ip: clientIP,
        userAgent
      });
      return res.status(401).json({ error: 'Account disabled' });
    }

    // Log successful authentication
    loggers.auth('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      ip: clientIP,
      userAgent,
      endpoint: req.originalUrl,
      method: req.method
    });

    req.user = user;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    loggers.security('Authentication failed - Invalid token', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    });
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      loggers.security('Authorization failed - No user in request', {
        ip: req.ip,
        endpoint: req.originalUrl,
        method: req.method
      });
      return res.status(401).json({ error: 'Access denied.' });
    }

    if (!roles.includes(req.user.role)) {
      loggers.security('Authorization failed - Insufficient permissions', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        endpoint: req.originalUrl,
        method: req.method
      });
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    loggers.auth('User authorized successfully', {
      userId: req.user._id,
      role: req.user.role,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip
    });

    next();
  };
};

// Enhanced session management
export const requireActiveSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.sessionId) {
    loggers.security('Session validation failed - No session ID', {
      userId: req.user?._id,
      ip: req.ip,
      endpoint: req.originalUrl
    });
    return res.status(401).json({ error: 'Invalid session' });
  }

  // Here you would check against a session store (Redis, database, etc.)
  // For now, we'll just validate the session exists in the token
  loggers.auth('Session validated', {
    userId: req.user?._id,
    sessionId: req.sessionId,
    ip: req.ip
  });

  next();
};

// Multi-factor authentication middleware
export const requireMFA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Access denied.' });
  }

  // Check if user has MFA enabled and verified for this session
  const mfaHeader = req.header('X-MFA-Token');
  
  if (req.user.mfaEnabled && !mfaHeader) {
    loggers.security('MFA required but not provided', {
      userId: req.user._id,
      ip: req.ip,
      endpoint: req.originalUrl
    });
    return res.status(401).json({ 
      error: 'Multi-factor authentication required',
      mfaRequired: true 
    });
  }

  if (req.user.mfaEnabled && mfaHeader) {
    // Here you would validate the MFA token
    // For now, we'll log the attempt
    loggers.auth('MFA token provided', {
      userId: req.user._id,
      ip: req.ip,
      endpoint: req.originalUrl
    });
  }

  next();
};