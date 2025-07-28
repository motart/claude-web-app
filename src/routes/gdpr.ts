import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { GDPRComplianceService, logDataAccess } from '../middleware/gdprCompliance';
import { User } from '../models/User';
import { SalesData } from '../models/SalesData';
import { Forecast } from '../models/Forecast';
import crypto from 'crypto';
import archiver from 'archiver';
import { Readable } from 'stream';

const router = express.Router();

// Get user's data processing history
router.get('/processing-history', 
  authenticate, 
  logDataAccess(['processing_logs'], 'View data processing history'),
  async (req: AuthRequest, res, next) => {
    try {
      const { limit = 50, page = 1 } = req.query;
      
      const history = await GDPRComplianceService.getUserProcessingHistory(
        req.user!._id.toString(),
        Number(limit),
        Number(page)
      );

      res.json({
        message: 'Data processing history retrieved',
        ...history
      });
    } catch (error) {
      next(error);
    }
  }
);

// Request data export (Right to data portability - Article 20)
router.post('/data-export', 
  authenticate,
  logDataAccess(['user_profile', 'sales_data', 'forecasts', 'processing_logs'], 'Export all user data'),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!._id.toString();
      
      // Generate comprehensive data export
      const [user, salesData, forecasts] = await Promise.all([
        User.findById(userId).select('-password').lean(),
        SalesData.find({ userId }).lean(),
        Forecast.find({ userId }).lean()
      ]);

      const exportData = {
        exportInfo: {
          generatedAt: new Date().toISOString(),
          dataSubject: userId,
          legalBasis: 'GDPR Article 20 - Right to data portability',
          format: 'JSON',
          retention: 'This export will be available for 30 days'
        },
        personalData: {
          account: {
            id: user?._id,
            email: user?.email,
            name: user?.name,
            company: user?.company,
            role: user?.role,
            createdAt: user?.createdAt,
            updatedAt: user?.updatedAt
          },
          preferences: user?.metadata || {}
        },
        businessData: {
          salesRecords: salesData.map(record => ({
            ...record,
            _id: record._id?.toString(),
            userId: record.userId?.toString()
          })),
          forecasts: forecasts.map(forecast => ({
            ...forecast,
            _id: forecast._id?.toString(),
            userId: forecast.userId?.toString()
          }))
        },
        processingHistory: await GDPRComplianceService.getUserProcessingHistory(userId, 1000, 1),
        dataProtectionInfo: {
          controller: 'OrderNimbus Inc.',
          dpoEmail: 'dpo@ordernimbus.com',
          retentionPolicies: {
            accountData: '3 years after account closure',
            businessData: '7 years for regulatory compliance',
            processingLogs: '6 years as per GDPR Article 30'
          },
          yourRights: {
            access: 'Article 15 - Right of access',
            rectification: 'Article 16 - Right to rectification',
            erasure: 'Article 17 - Right to erasure',
            restrictProcessing: 'Article 18 - Right to restrict processing',
            dataPortability: 'Article 20 - Right to data portability',
            object: 'Article 21 - Right to object'
          }
        }
      };

      // In production, this would be saved to a secure temporary location
      // and the user would receive a download link
      const exportToken = crypto.randomUUID();
      
      // Store export data temporarily (in production, use secure cloud storage)
      // For demo purposes, we'll return the data directly with a simulated delay
      setTimeout(() => {
        res.json({
          message: 'Data export generated successfully',
          exportToken,
          downloadUrl: `/api/gdpr/download-export/${exportToken}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          dataSize: JSON.stringify(exportData).length,
          recordCounts: {
            salesRecords: salesData.length,
            forecasts: forecasts.length,
            processingLogs: exportData.processingHistory.logs.length
          }
        });
      }, 2000); // Simulate processing time

    } catch (error) {
      next(error);
    }
  }
);

// Download data export
router.get('/download-export/:token', 
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { token } = req.params;
      
      // In production, verify the token and retrieve the export data
      // For demo purposes, regenerate the data
      const userId = req.user!._id.toString();
      const exportData = await GDPRComplianceService.exportUserData(userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ordernimbus-data-export-${Date.now()}.json"`);
      
      res.send(JSON.stringify(exportData, null, 2));
      
      // Log the download
      await GDPRComplianceService.logDataProcessing(req, {
        activityType: 'data_export',
        description: 'User downloaded data export',
        dataTypes: ['user_profile', 'sales_data', 'forecasts'],
        legalBasis: 'legal_obligation',
        processingPurpose: 'Fulfill data portability request under GDPR Article 20',
        metadata: { exportToken: token }
      });

    } catch (error) {
      next(error);
    }
  }
);

// Update privacy preferences
router.put('/privacy-preferences', 
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { analytics, marketing, dataProcessing, emailNotifications } = req.body;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user!._id,
        {
          $set: {
            'metadata.consents': {
              analytics: Boolean(analytics),
              marketing: Boolean(marketing),
              dataProcessing: Boolean(dataProcessing),
              emailNotifications: Boolean(emailNotifications),
              updatedAt: new Date()
            }
          }
        },
        { new: true }
      );

      // Log consent changes
      await GDPRComplianceService.logDataProcessing(req, {
        activityType: 'consent_change',
        description: 'User updated privacy preferences',
        dataTypes: ['user_preferences'],
        legalBasis: 'consent',
        processingPurpose: 'Update user consent preferences',
        metadata: {
          previousConsents: req.user?.metadata?.consents,
          newConsents: { analytics, marketing, dataProcessing, emailNotifications }
        }
      });

      res.json({
        message: 'Privacy preferences updated successfully',
        consents: updatedUser?.metadata?.consents
      });
    } catch (error) {
      next(error);
    }
  }
);

// Request account deletion (Right to erasure - Article 17)
router.post('/delete-account', 
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { confirmation } = req.body;
      
      if (confirmation !== 'DELETE MY ACCOUNT') {
        return res.status(400).json({
          error: 'Invalid confirmation. Please type "DELETE MY ACCOUNT" exactly.'
        });
      }

      const userId = req.user!._id.toString();
      const deletionToken = crypto.randomUUID();
      
      // In production, this would:
      // 1. Send confirmation email with deletion link
      // 2. Set account for deletion after 30-day grace period
      // 3. Immediately anonymize non-essential data
      
      // Log deletion request
      await GDPRComplianceService.logDataProcessing(req, {
        activityType: 'data_deletion',
        description: 'User requested account deletion',
        dataTypes: ['user_profile', 'sales_data', 'forecasts'],
        legalBasis: 'legal_obligation',
        processingPurpose: 'Process deletion request under GDPR Article 17',
        metadata: { deletionToken, gracePeriodDays: 30 }
      });

      res.json({
        message: 'Account deletion request received',
        deletionToken,
        gracePeriod: '30 days',
        note: 'You will receive a confirmation email. Account deletion can be cancelled within 30 days.',
        contactInfo: 'To cancel deletion or for questions, contact dpo@ordernimbus.com'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Confirm account deletion
router.post('/confirm-deletion/:token', 
  async (req, res, next) => {
    try {
      const { token } = req.params;
      
      // In production, verify the token and proceed with deletion
      const success = await GDPRComplianceService.deleteUserData('user-id', token);
      
      if (success) {
        res.json({
          message: 'Account deletion completed successfully',
          note: 'All personal data has been permanently deleted in compliance with GDPR Article 17'
        });
      } else {
        res.status(400).json({
          error: 'Invalid or expired deletion token'
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Data rectification request (Right to rectification - Article 16)
router.post('/rectification-request', 
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { dataType, currentValue, requestedValue, reason } = req.body;
      
      // Log rectification request
      await GDPRComplianceService.logDataProcessing(req, {
        activityType: 'data_update',
        description: `User requested data rectification for ${dataType}`,
        dataTypes: [dataType],
        legalBasis: 'legal_obligation',
        processingPurpose: 'Process rectification request under GDPR Article 16',
        metadata: { 
          currentValue: currentValue?.substring(0, 50), // Truncate for privacy
          requestedValue: requestedValue?.substring(0, 50),
          reason 
        }
      });

      res.json({
        message: 'Rectification request submitted successfully',
        requestId: crypto.randomUUID(),
        processingTime: 'Within 30 days',
        note: 'We will review your request and update your data if the correction is valid'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current consent status
router.get('/consent-status', 
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const consents = req.user?.metadata?.consents || {
        analytics: false,
        marketing: false,
        dataProcessing: false,
        emailNotifications: true
      };
      
      res.json({
        consents: {
          analytics: consents.analytics || false,
          marketing: consents.marketing || false,
          dataProcessing: consents.dataProcessing || false,
          emailNotifications: consents.emailNotifications !== undefined ? consents.emailNotifications : true
        },
        legalBasis: {
          analytics: 'Consent (Article 6(1)(a))',
          marketing: 'Consent (Article 6(1)(a))',
          dataProcessing: 'Legitimate interest (Article 6(1)(f))',
          emailNotifications: 'Contract performance (Article 6(1)(b))'
        },
        lastUpdated: consents.updatedAt || req.user?.createdAt
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as gdprRoutes };