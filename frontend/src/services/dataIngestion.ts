import { apiClient } from './api';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  dataQuality: {
    completeness: number;
    consistency: number;
    accuracy: number;
    overall: number;
  };
  detectedColumns: {
    date: string;
    revenue: string;
    quantity: string;
    product: string;
    category: string;
  };
}

export interface ExternalDataSource {
  name: string;
  type: 'weather' | 'economic' | 'social' | 'competitor' | 'supply_chain';
  apiEndpoint: string;
  dataMapping: Record<string, string>;
  refreshInterval: number; // minutes
  isActive: boolean;
}

export class AdvancedDataIngestion {
  private externalSources: ExternalDataSource[] = [
    {
      name: 'Weather API',
      type: 'weather',
      apiEndpoint: 'https://api.openweathermap.org/data/2.5',
      dataMapping: {
        'weather.main': 'weather_condition',
        'main.temp': 'temperature',
        'main.humidity': 'humidity',
        'wind.speed': 'wind_speed'
      },
      refreshInterval: 60,
      isActive: true
    },
    {
      name: 'Economic Indicators',
      type: 'economic',
      apiEndpoint: 'https://api.stlouisfed.org/fred/series',
      dataMapping: {
        'GDP': 'gdp_growth',
        'UNRATE': 'unemployment_rate',
        'CPIAUCSL': 'inflation_rate'
      },
      refreshInterval: 1440, // daily
      isActive: true
    }
  ];

  async validateCSVData(file: File): Promise<DataValidationResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/data/validate-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to validate file'],
        warnings: [],
        suggestions: [],
        dataQuality: { completeness: 0, consistency: 0, accuracy: 0, overall: 0 },
        detectedColumns: { date: '', revenue: '', quantity: '', product: '', category: '' }
      };
    }
  }

  async enhanceDataWithExternalSources(
    storeId: string, 
    startDate: string, 
    endDate: string,
    sources: string[] = ['weather', 'economic']
  ): Promise<any> {
    try {
      const response = await apiClient.post('/data/enhance-external', {
        storeId,
        startDate,
        endDate,
        sources
      });
      return response.data;
    } catch (error) {
      console.error('Failed to enhance data with external sources:', error);
      throw error;
    }
  }

  async processShopifyData(storeCredentials: {
    shopName: string;
    accessToken: string;
    includeCustomers?: boolean;
    includeProducts?: boolean;
    includeInventory?: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/connectors/shopify/process-advanced', {
        ...storeCredentials,
        includeAnalytics: true,
        includeMetrics: true,
        dateRange: 'all'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to process Shopify data:', error);
      throw error;
    }
  }

  async processAmazonData(sellerCredentials: {
    sellerId: string;
    accessKey: string;
    secretKey: string;
    marketplace: string;
    includeAdvertising?: boolean;
    includeFBA?: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/connectors/amazon/process-advanced', {
        ...sellerCredentials,
        includeKeywordData: true,
        includeCompetitorAnalysis: true,
        includeBuyBoxData: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to process Amazon data:', error);
      throw error;
    }
  }

  async cleanAndTransformData(storeId: string, options: {
    removeOutliers?: boolean;
    fillMissingValues?: boolean;
    aggregationLevel?: 'daily' | 'weekly' | 'monthly';
    seasonalAdjustment?: boolean;
    trendDecomposition?: boolean;
  } = {}): Promise<any> {
    try {
      const response = await apiClient.post('/data/clean-transform', {
        storeId,
        options: {
          removeOutliers: true,
          fillMissingValues: true,
          aggregationLevel: 'daily',
          seasonalAdjustment: true,
          trendDecomposition: true,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to clean and transform data:', error);
      throw error;
    }
  }

  async detectDataAnomalies(storeId: string, sensitivity: 'low' | 'medium' | 'high' = 'medium'): Promise<{
    anomalies: Array<{
      date: string;
      metric: string;
      value: number;
      expectedValue: number;
      anomalyScore: number;
      severity: 'low' | 'medium' | 'high';
      reason: string;
    }>;
    summary: {
      totalAnomalies: number;
      severityBreakdown: Record<string, number>;
      affectedMetrics: string[];
    };
  }> {
    try {
      const response = await apiClient.post('/data/detect-anomalies', {
        storeId,
        sensitivity,
        algorithms: ['isolation_forest', 'one_class_svm', 'local_outlier_factor']
      });
      return response.data;
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      throw error;
    }
  }

  async getDataQualityReport(storeId: string): Promise<{
    overall_score: number;
    metrics: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      validity: number;
    };
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
      affected_records: number;
    }>;
    trends: Array<{
      date: string;
      quality_score: number;
    }>;
  }> {
    try {
      const response = await apiClient.get(`/data/quality-report/${storeId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get data quality report:', error);
      throw error;
    }
  }

  async setupRealTimeDataSync(storeId: string, config: {
    syncInterval: number; // minutes
    webhook_url?: string;
    filters: {
      min_order_value?: number;
      product_categories?: string[];
      customer_segments?: string[];
    };
    transformations: {
      currency_normalization?: boolean;
      timezone_adjustment?: boolean;
      data_enrichment?: boolean;
    };
  }): Promise<{ sync_id: string; status: string }> {
    try {
      const response = await apiClient.post('/data/setup-realtime-sync', {
        storeId,
        config
      });
      return response.data;
    } catch (error) {
      console.error('Failed to setup real-time sync:', error);
      throw error;
    }
  }

  async enrichDataWithAI(storeId: string, enrichmentTypes: string[] = [
    'customer_segmentation',
    'product_categorization',
    'sentiment_analysis',
    'price_optimization',
    'demand_classification'
  ]): Promise<any> {
    try {
      const response = await apiClient.post('/data/ai-enrichment', {
        storeId,
        enrichmentTypes,
        models: {
          customer_segmentation: 'kmeans_enhanced',
          product_categorization: 'bert_classifier',
          sentiment_analysis: 'transformer_sentiment',
          price_optimization: 'reinforcement_learning',
          demand_classification: 'gradient_boost'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to enrich data with AI:', error);
      throw error;
    }
  }

  private async fetchExternalData(source: ExternalDataSource, params: Record<string, any>): Promise<any> {
    // Implementation would depend on specific external API
    // This is a placeholder for the actual implementation
    console.log(`Fetching data from ${source.name}...`);
    return {};
  }

  async startAutomatedDataPipeline(storeId: string, pipelineConfig: {
    dataValidation: boolean;
    anomalyDetection: boolean;
    externalEnrichment: boolean;
    aiEnrichment: boolean;
    qualityMonitoring: boolean;
    realtimeSync: boolean;
  }): Promise<{ pipeline_id: string; status: string }> {
    try {
      const response = await apiClient.post('/data/start-pipeline', {
        storeId,
        config: pipelineConfig,
        schedule: {
          validation: '0 */6 * * *',      // Every 6 hours
          enrichment: '0 2 * * *',        // Daily at 2 AM
          quality_check: '0 */2 * * *',   // Every 2 hours
          anomaly_detection: '0 */4 * * *' // Every 4 hours
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start automated pipeline:', error);
      throw error;
    }
  }
}

export const dataIngestion = new AdvancedDataIngestion();