import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Custom log levels for security and compliance
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    audit: 3,
    security: 4,
    debug: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    audit: 'blue',
    security: 'magenta',
    debug: 'gray',
  },
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format for structured logging (SOC 2 requirement)
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: any) => {
    const { timestamp, level, message, ...meta } = info;
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
      environment: process.env.NODE_ENV || 'development',
      service: 'OrderNimbus-API',
      version: process.env.APP_VERSION || '1.0.0'
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf((info: any) => {
    const { timestamp, level, message, ...meta } = info;
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// File rotation configuration for compliance
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(process.env.LOG_DIR || '/app/logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '90d', // Keep logs for 90 days (SOC 2 requirement)
  zippedArchive: true,
  auditFile: path.join(process.env.LOG_DIR || '/app/logs', 'audit.json'),
});

// Security log file (separate for security events)
const securityFileTransport = new DailyRotateFile({
  filename: path.join(process.env.LOG_DIR || '/app/logs', 'security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '365d', // Keep security logs for 1 year
  zippedArchive: true,
  level: 'security',
  auditFile: path.join(process.env.LOG_DIR || '/app/logs', 'security-audit.json'),
});

// Audit log file (separate for audit trail)
const auditFileTransport = new DailyRotateFile({
  filename: path.join(process.env.LOG_DIR || '/app/logs', 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '2555d', // Keep audit logs for 7 years (compliance requirement)
  zippedArchive: true,
  level: 'audit',
  auditFile: path.join(process.env.LOG_DIR || '/app/logs', 'audit-trail.json'),
});

// Create logger instance
export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'OrderNimbus-API',
    hostname: require('os').hostname(),
    pid: process.pid
  },
  transports: [
    // Application logs
    fileRotateTransport,
    
    // Security logs
    securityFileTransport,
    
    // Audit logs
    auditFileTransport,
    
    // Error logs (separate file for easier monitoring)
    new DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || '/app/logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '100m',
      maxFiles: '365d',
      zippedArchive: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || '/app/logs', 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || '/app/logs', 'rejections.log')
    })
  ],
  exitOnError: false
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Helper methods for different log types
export const loggers = {
  // Security events logging
  security: (message: string, meta?: any) => {
    logger.log('security', message, {
      ...meta,
      category: 'security',
      alertLevel: 'high'
    });
  },

  // Audit trail logging (for SOC 2 compliance)
  audit: (message: string, meta?: any) => {
    logger.log('audit', message, {
      ...meta,
      category: 'audit',
      compliance: 'SOC2'
    });
  },

  // Authentication events
  auth: (message: string, meta?: any) => {
    logger.log('audit', message, {
      ...meta,
      category: 'authentication',
      compliance: 'SOC2'
    });
  },

  // Data access logging
  dataAccess: (message: string, meta?: any) => {
    logger.log('audit', message, {
      ...meta,
      category: 'data-access',
      compliance: 'SOC2'
    });
  },

  // Configuration changes
  configChange: (message: string, meta?: any) => {
    logger.log('audit', message, {
      ...meta,
      category: 'configuration',
      compliance: 'SOC2',
      alertLevel: 'medium'
    });
  },

  // User access events
  userAccess: (message: string, meta?: any) => {
    logger.log('audit', message, {
      ...meta,
      category: 'user-access',
      compliance: 'SOC2'
    });
  },

  // API access logging
  apiAccess: (message: string, meta?: any) => {
    logger.log('audit', message, {
      ...meta,
      category: 'api-access',
      compliance: 'SOC2'
    });
  },

  // Error tracking
  error: (message: string, error?: Error, meta?: any) => {
    logger.error(message, {
      ...meta,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      category: 'error'
    });
  },

  // Performance monitoring
  performance: (message: string, meta?: any) => {
    logger.info(message, {
      ...meta,
      category: 'performance'
    });
  }
};

// Stream for Morgan HTTP logging middleware
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim(), { category: 'http' });
  }
};

export default logger;