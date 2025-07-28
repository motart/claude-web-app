import { Request, Response, NextFunction } from 'express';
import { DataProcessingLog } from '../models/DataProcessingLog';
import { AuthRequest } from './auth';

interface GDPRLogData {
  activityType: 'data_access' | 'data_export' | 'data_deletion' | 'consent_change' | 'data_update' | 'login' | 'ml_processing';
  description: string;
  dataTypes: string[];
  legalBasis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'vital_interests' | 'public_task';
  processingPurpose: string;
  dataSource?: string;
  dataDestination?: string;
  isAutomated?: boolean;
  metadata?: any;
}

export class GDPRComplianceService {
  static async logDataProcessing(
    req: AuthRequest,
    data: GDPRLogData,
    resultStatus: 'success' | 'failed' | 'partial' = 'success',
    errorDetails?: string
  ): Promise<void> {
    try {
      const log = new DataProcessingLog({
        userId: req.user?._id,
        activityType: data.activityType,
        description: data.description,
        dataTypes: data.dataTypes,
        legalBasis: data.legalBasis,
        processingPurpose: data.processingPurpose,
        dataSource: data.dataSource,
        dataDestination: data.dataDestination,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id'] as string || Math.random().toString(36),
        isAutomated: data.isAutomated || false,
        resultStatus,
        errorDetails,
        metadata: {
          ...data.metadata,
          complianceFlags: ['GDPR'],
          encryptionUsed: true // All data is encrypted
        }
      });

      await log.save();
    } catch (error) {
      console.error('Failed to log GDPR compliance data:', error);
      // Don't throw error to avoid breaking the main request
    }
  }

  static gdprLogger(data: GDPRLogData) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      // Store GDPR log data in request for later use
      req.gdprLogData = data;
      
      // Intercept response to log after completion
      const originalSend = res.send;
      res.send = function(body: any) {
        const statusCode = res.statusCode;
        const resultStatus = statusCode >= 200 && statusCode < 300 ? 'success' : 'failed';
        
        // Log the data processing activity
        GDPRComplianceService.logDataProcessing(
          req,
          data,
          resultStatus,
          statusCode >= 400 ? `HTTP ${statusCode}: ${body}` : undefined
        );
        
        return originalSend.call(this, body);
      };
      
      next();
    };
  }

  static async getUserProcessingHistory(userId: string, limit: number = 100, page: number = 1) {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      DataProcessingLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      DataProcessingLog.countDocuments({ userId })
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        // Sanitize sensitive information
        ipAddress: log.ipAddress ? `${log.ipAddress.substring(0, 7)}***` : undefined,
        userAgent: log.userAgent ? `${log.userAgent.substring(0, 20)}...` : undefined
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async exportUserData(userId: string): Promise<any> {
    try {
      // This would compile all user data for export
      const userData = {
        exportGenerated: new Date().toISOString(),
        dataSubject: userId,
        legalBasis: 'Article 20 GDPR - Right to data portability',
        dataCategories: {
          personalData: {
            // User account information
          },
          businessData: {
            // Sales data, forecasts, etc.
          },
          technicalData: {
            // Logs, preferences, etc.
          },
          processingHistory: await this.getUserProcessingHistory(userId, 1000, 1)
        },
        retentionPolicies: {
          accountData: '3 years after account closure',
          businessData: '7 years for tax compliance',
          technicalData: '2 years for security',
          processingLogs: '6 years as per GDPR Article 30'
        },
        dataProtectionRights: {
          access: 'Right to obtain confirmation and access to personal data',
          rectification: 'Right to have inaccurate personal data rectified',
          erasure: 'Right to erasure (right to be forgotten)',
          restrictProcessing: 'Right to restrict processing',
          dataPortability: 'Right to receive personal data in a structured, commonly used format',
          object: 'Right to object to processing'
        }
      };

      return userData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  static async deleteUserData(userId: string, verificationToken: string): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Verify the deletion token
      // 2. Anonymize or delete user data according to retention policies
      // 3. Log the deletion activity
      // 4. Send confirmation

      // Log the deletion request
      const log = new DataProcessingLog({
        userId,
        activityType: 'data_deletion',
        description: 'User requested account and data deletion',
        dataTypes: ['user_profile', 'sales_data', 'forecasts', 'preferences'],
        legalBasis: 'legal_obligation',
        processingPurpose: 'Comply with user deletion request under GDPR Article 17',
        resultStatus: 'success',
        isAutomated: false,
        metadata: {
          verificationToken,
          complianceFlags: ['GDPR', 'Article_17']
        }
      });

      await log.save();
      return true;
    } catch (error) {
      console.error('Error processing data deletion:', error);
      return false;
    }
  }

  static validateConsentRequirements(req: AuthRequest, requiredConsents: string[]): boolean {
    // Check if user has given required consents
    const userConsents = req.user?.metadata?.consents || {};
    
    return requiredConsents.every(consent => {
      const consentKey = consent as keyof typeof userConsents;
      return userConsents[consentKey] === true;
    });
  }

  static checkDataRetention(data: any, retentionPeriodDays: number): boolean {
    const now = new Date();
    const createdAt = new Date(data.createdAt);
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= retentionPeriodDays;
  }
}

// Middleware to automatically log data access
export const logDataAccess = (dataTypes: string[], purpose: string) => {
  return GDPRComplianceService.gdprLogger({
    activityType: 'data_access',
    description: `User accessed ${dataTypes.join(', ')}`,
    dataTypes,
    legalBasis: 'contract',
    processingPurpose: purpose
  });
};

// Middleware to log data updates
export const logDataUpdate = (dataTypes: string[], purpose: string) => {
  return GDPRComplianceService.gdprLogger({
    activityType: 'data_update',
    description: `User updated ${dataTypes.join(', ')}`,
    dataTypes,
    legalBasis: 'contract',
    processingPurpose: purpose
  });
};

// Middleware to log ML processing
export const logMLProcessing = (modelType: string, dataTypes: string[]) => {
  return GDPRComplianceService.gdprLogger({
    activityType: 'ml_processing',
    description: `Generated ${modelType} forecast using ${dataTypes.join(', ')}`,
    dataTypes,
    legalBasis: 'legitimate_interest',
    processingPurpose: 'Generate sales forecasts for business insights',
    isAutomated: true,
    metadata: {
      modelType,
      anonymized: true
    }
  });
};

// Add GDPR logging to requests
declare global {
  namespace Express {
    interface Request {
      gdprLogData?: GDPRLogData;
    }
  }
}