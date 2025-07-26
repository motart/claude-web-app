import { SalesData } from '../models/SalesData';
import { ShopifyConnector } from './connectors/ShopifyConnector';
import { AmazonConnector } from './connectors/AmazonConnector';
import { DataProcessor } from './DataProcessor';
import { subDays } from 'date-fns';

export interface SyncRequest {
  userId: string;
  store: {
    platform: 'shopify' | 'amazon' | 'custom';
    storeId: string;
    storeName: string;
    credentials: any;
  };
  startDate?: Date;
  endDate?: Date;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  errors: any[];
  lastSyncDate: Date;
}

export class DataSyncService {
  private shopifyConnector: ShopifyConnector;
  private amazonConnector: AmazonConnector;
  private dataProcessor: DataProcessor;

  constructor() {
    this.shopifyConnector = new ShopifyConnector();
    this.amazonConnector = new AmazonConnector();
    this.dataProcessor = new DataProcessor();
  }

  async syncStoreData(request: SyncRequest): Promise<SyncResult> {
    try {
      const startDate = request.startDate || subDays(new Date(), 30);
      const endDate = request.endDate || new Date();

      let rawData: any[] = [];

      switch (request.store.platform) {
        case 'shopify':
          rawData = await this.syncShopifyData(request.store, startDate, endDate);
          break;
        case 'amazon':
          rawData = await this.syncAmazonData(request.store, startDate, endDate);
          break;
        default:
          throw new Error(`Unsupported platform: ${request.store.platform}`);
      }

      const { cleanedData, errors } = await this.dataProcessor.validateAndCleanData(rawData);

      let importedCount = 0;
      if (cleanedData.length > 0) {
        await this.bulkInsertSalesData(cleanedData);
        importedCount = cleanedData.length;
      }

      return {
        success: true,
        recordsProcessed: rawData.length,
        recordsImported: importedCount,
        errors,
        lastSyncDate: new Date()
      };
    } catch (error) {
      console.error('Data sync failed:', error);
      return {
        success: false,
        recordsProcessed: 0,
        recordsImported: 0,
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
        lastSyncDate: new Date()
      };
    }
  }

  private async syncShopifyData(store: any, startDate: Date, endDate: Date) {
    const { shopDomain, accessToken } = store.credentials;
    
    const orders = await this.shopifyConnector.getAllOrdersPaginated(
      shopDomain,
      accessToken,
      startDate,
      endDate
    );

    return this.shopifyConnector.transformOrdersToSalesData(
      orders,
      store.storeId,
      store.userId
    );
  }

  private async syncAmazonData(store: any, startDate: Date, endDate: Date) {
    const orders = await this.amazonConnector.getOrders(
      store.credentials,
      startDate,
      endDate
    );

    return this.amazonConnector.transformOrdersToSalesData(
      orders,
      store.storeId,
      store.userId
    );
  }

  private async bulkInsertSalesData(salesData: any[]) {
    const batchSize = 1000;
    const batches = [];

    for (let i = 0; i < salesData.length; i += batchSize) {
      batches.push(salesData.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        await SalesData.insertMany(batch, { ordered: false });
      } catch (error: any) {
        if (error.code === 11000) {
          console.log('Duplicate records found, continuing with unique records');
          
          for (const record of batch) {
            try {
              await SalesData.create(record);
            } catch (duplicateError) {
              // Skip duplicate records
            }
          }
        } else {
          throw error;
        }
      }
    }
  }

  async getLastSyncDate(userId: string, storeId: string): Promise<Date | null> {
    const lastRecord = await SalesData.findOne({
      userId,
      storeId
    }).sort({ createdAt: -1 });

    return lastRecord ? lastRecord.createdAt : null;
  }

  async schedulePeriodicSync(userId: string, storeId: string, intervalHours: number = 24) {
    // This would integrate with a job scheduler like Bull or Agenda
    console.log(`Scheduling sync for store ${storeId} every ${intervalHours} hours`);
    
    return {
      scheduled: true,
      nextRun: new Date(Date.now() + intervalHours * 60 * 60 * 1000)
    };
  }

  async getSyncHistory(userId: string, storeId?: string, limit: number = 10) {
    const filter: any = { 
      userId,
      'metadata.syncOperation': { $exists: true }
    };
    
    if (storeId) {
      filter.storeId = storeId;
    }

    return await SalesData.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            storeId: '$storeId',
            syncDate: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          recordCount: { $sum: 1 },
          lastSync: { $max: '$createdAt' }
        }
      },
      { $sort: { lastSync: -1 } },
      { $limit: limit }
    ]);
  }
}