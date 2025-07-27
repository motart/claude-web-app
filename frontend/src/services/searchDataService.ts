import { SearchDocument, EnterpriseSearchEngine } from './searchEngine';
import { SearchResultType } from '../types/search';

export interface BusinessData {
  dashboardMetrics: any[];
  products: any[];
  orders: any[];
  customers: any[];
  dataSources: any[];
  uploads: any[];
  forecasts: any[];
  insights: any[];
  conversations: any[];
  helpArticles: any[];
}

export class SearchDataService {
  private searchEngine: EnterpriseSearchEngine;

  constructor(searchEngine: EnterpriseSearchEngine) {
    this.searchEngine = searchEngine;
  }

  /**
   * Index all business data for search
   */
  async indexAllData(): Promise<void> {
    const businessData = this.generateMockBusinessData();
    const documents = this.convertToSearchDocuments(businessData);
    
    this.searchEngine.rebuildIndex(documents);
  }

  /**
   * Generate comprehensive mock business data
   */
  private generateMockBusinessData(): BusinessData {
    return {
      dashboardMetrics: [
        {
          id: 'metric_revenue',
          name: 'Total Revenue',
          value: 1257500,
          description: 'Total revenue across all sales channels including online, retail, and wholesale',
          category: 'Sales',
          change: '+12.5%',
          period: 'last 30 days'
        },
        {
          id: 'metric_orders',
          name: 'Total Orders',
          value: 8947,
          description: 'Number of completed orders from all platforms',
          category: 'Orders',
          change: '+8.2%',
          period: 'last 30 days'
        },
        {
          id: 'metric_customers',
          name: 'Active Customers',
          value: 3245,
          description: 'Unique customers who made purchases in the last 30 days',
          category: 'Customers',
          change: '+15.3%',
          period: 'last 30 days'
        },
        {
          id: 'metric_aov',
          name: 'Average Order Value',
          value: 140.50,
          description: 'Average value per order across all sales channels',
          category: 'Sales',
          change: '+3.7%',
          period: 'last 30 days'
        },
        {
          id: 'metric_conversion',
          name: 'Conversion Rate',
          value: 3.2,
          description: 'Percentage of website visitors who complete a purchase',
          category: 'Marketing',
          change: '+0.5%',
          period: 'last 30 days'
        }
      ],

      products: [
        {
          id: 'prod_1',
          name: 'Wireless Bluetooth Headphones',
          sku: 'WBH-001',
          category: 'Electronics',
          price: 99.99,
          inventory: 245,
          sales: 1230,
          revenue: 122970,
          description: 'Premium wireless headphones with noise cancellation and 30-hour battery life'
        },
        {
          id: 'prod_2',
          name: 'Organic Cotton T-Shirt',
          sku: 'OCT-002',
          category: 'Apparel',
          price: 29.99,
          inventory: 512,
          sales: 890,
          revenue: 26691,
          description: 'Soft organic cotton t-shirt available in multiple colors and sizes'
        },
        {
          id: 'prod_3',
          name: 'Smart Home Security Camera',
          sku: 'SHSC-003',
          category: 'Electronics',
          price: 149.99,
          inventory: 89,
          sales: 456,
          revenue: 68395,
          description: '1080p HD security camera with night vision and mobile app integration'
        },
        {
          id: 'prod_4',
          name: 'Stainless Steel Water Bottle',
          sku: 'SSWB-004',
          category: 'Home & Garden',
          price: 24.99,
          inventory: 325,
          sales: 678,
          revenue: 16943,
          description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours'
        }
      ],

      customers: [
        {
          id: 'cust_1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          totalOrders: 12,
          totalSpent: 1890.50,
          lastOrder: new Date('2024-01-25'),
          segment: 'VIP',
          location: 'New York, NY'
        },
        {
          id: 'cust_2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          totalOrders: 8,
          totalSpent: 1245.00,
          lastOrder: new Date('2024-01-24'),
          segment: 'Regular',
          location: 'San Francisco, CA'
        }
      ],

      dataSources: [
        {
          id: 'ds_shopify',
          name: 'Shopify Store Data',
          type: 'api',
          source: 'Shopify',
          status: 'active',
          recordCount: 25420,
          lastSync: new Date('2024-01-26T10:30:00'),
          description: 'Real-time synchronization with Shopify store for orders, products, and customer data'
        },
        {
          id: 'ds_amazon',
          name: 'Amazon Marketplace Orders',
          type: 'api',
          source: 'Amazon',
          status: 'active',
          recordCount: 18932,
          lastSync: new Date('2024-01-26T09:15:00'),
          description: 'Amazon marketplace integration for order management and inventory tracking'
        },
        {
          id: 'ds_pos',
          name: 'Square POS System',
          type: 'api',
          source: 'Square',
          status: 'error',
          recordCount: 5234,
          lastSync: new Date('2024-01-25T16:45:00'),
          description: 'Point of sale system integration for in-store transactions and inventory'
        }
      ],

      forecasts: [
        {
          id: 'forecast_q1_revenue',
          name: 'Q1 2024 Revenue Forecast',
          type: 'revenue',
          accuracy: 94.5,
          prediction: 3800000,
          confidence: 'high',
          algorithm: 'ARIMA',
          createdDate: new Date('2024-01-20'),
          description: 'Quarterly revenue prediction based on historical sales data and market trends'
        },
        {
          id: 'forecast_inventory_demand',
          name: 'Product Demand Forecast',
          type: 'demand',
          accuracy: 87.2,
          prediction: null,
          confidence: 'medium',
          algorithm: 'LSTM',
          createdDate: new Date('2024-01-18'),
          description: 'AI-powered demand forecasting for inventory optimization and stock management'
        }
      ],

      insights: [
        {
          id: 'insight_1',
          title: 'Peak Sales Hours',
          message: 'Sales peak between 2-4 PM on weekdays, consider targeted promotions during this time',
          type: 'opportunity',
          category: 'sales_optimization',
          confidence: 0.89,
          impact: 'medium'
        },
        {
          id: 'insight_2',
          title: 'Inventory Alert',
          message: 'Wireless headphones are running low in stock (45 units remaining), reorder recommended',
          type: 'warning',
          category: 'inventory_management',
          confidence: 1.0,
          impact: 'high'
        }
      ],

      conversations: [
        {
          id: 'conv_1',
          userId: 'user_123',
          userName: 'John Doe',
          subject: 'Pricing and Plan Questions',
          status: 'resolved',
          satisfaction: 5,
          startTime: new Date('2024-01-26T10:30:00'),
          messages: 8,
          intent: 'pricing_inquiry',
          summary: 'Customer inquired about enterprise pricing and features, provided detailed comparison'
        },
        {
          id: 'conv_2',
          userId: 'user_456',
          userName: 'Jane Smith',
          subject: 'Integration Help',
          status: 'active',
          satisfaction: null,
          startTime: new Date('2024-01-26T09:15:00'),
          messages: 12,
          intent: 'technical_support',
          summary: 'Customer needs help setting up Shopify integration, provided step-by-step guide'
        }
      ],

      uploads: [
        {
          id: 'upload_1',
          filename: 'Q4_2023_sales_data.csv',
          uploadDate: new Date('2024-01-26T08:30:00'),
          status: 'completed',
          recordCount: 8420,
          fileSize: '2.3 MB',
          description: 'Fourth quarter sales data import with product performance metrics'
        },
        {
          id: 'upload_2',
          filename: 'customer_feedback_survey.xlsx',
          uploadDate: new Date('2024-01-25T15:22:00'),
          status: 'processing',
          recordCount: 1850,
          fileSize: '890 KB',
          description: 'Customer satisfaction survey responses and feedback analysis'
        }
      ],

      orders: [
        {
          id: 'order_1001',
          orderNumber: 'ORD-2024-001001',
          customerId: 'cust_1',
          customerName: 'Sarah Johnson',
          total: 159.98,
          status: 'shipped',
          orderDate: new Date('2024-01-25T14:30:00'),
          items: ['Wireless Bluetooth Headphones', 'Organic Cotton T-Shirt'],
          description: 'Two-item order including electronics and apparel'
        },
        {
          id: 'order_1002',
          orderNumber: 'ORD-2024-001002',
          customerId: 'cust_2',
          customerName: 'Michael Chen',
          total: 174.98,
          status: 'delivered',
          orderDate: new Date('2024-01-24T11:15:00'),
          items: ['Smart Home Security Camera', 'Stainless Steel Water Bottle'],
          description: 'Electronics and home goods combination order'
        }
      ],

      helpArticles: [
        {
          id: 'help_1',
          title: 'How to Connect Your Shopify Store',
          category: 'Integrations',
          content: 'Step-by-step guide to connect your Shopify store to OrderNimbus for automated data sync',
          views: 1245,
          helpful: 89,
          lastUpdated: new Date('2024-01-20'),
          tags: ['shopify', 'integration', 'setup']
        },
        {
          id: 'help_2',
          title: 'Understanding Forecast Accuracy',
          category: 'Forecasting',
          content: 'Learn how to interpret forecast accuracy metrics and improve prediction quality',
          views: 892,
          helpful: 76,
          lastUpdated: new Date('2024-01-18'),
          tags: ['forecasting', 'accuracy', 'ai']
        }
      ]
    };
  }

  /**
   * Convert business data to searchable documents
   */
  private convertToSearchDocuments(data: BusinessData): SearchDocument[] {
    const documents: SearchDocument[] = [];

    // Dashboard Metrics
    data.dashboardMetrics.forEach(metric => {
      documents.push({
        id: metric.id,
        title: metric.name,
        description: metric.description,
        content: `${metric.name} ${metric.description} ${metric.category} ${metric.change} ${metric.period}`,
        type: 'dashboard_metric' as SearchResultType,
        category: 'Dashboard',
        url: '/dashboard',
        tags: ['metric', 'dashboard', metric.category.toLowerCase()],
        metadata: {
          value: metric.value,
          change: metric.change,
          period: metric.period,
          category: metric.category
        }
      });
    });

    // Products
    data.products.forEach(product => {
      documents.push({
        id: product.id,
        title: product.name,
        description: product.description,
        content: `${product.name} ${product.description} ${product.category} ${product.sku}`,
        type: 'product' as SearchResultType,
        category: 'Products',
        url: '/dashboard',
        tags: ['product', product.category.toLowerCase(), 'inventory'],
        metadata: {
          sku: product.sku,
          price: product.price,
          inventory: product.inventory,
          sales: product.sales,
          revenue: product.revenue,
          category: product.category
        }
      });
    });

    // Customers
    data.customers.forEach(customer => {
      documents.push({
        id: customer.id,
        title: customer.name,
        description: `Customer from ${customer.location} - ${customer.segment} segment`,
        content: `${customer.name} ${customer.email} ${customer.location} ${customer.segment}`,
        type: 'customer' as SearchResultType,
        category: 'Customers',
        url: '/dashboard',
        tags: ['customer', customer.segment.toLowerCase()],
        metadata: {
          email: customer.email,
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          segment: customer.segment,
          location: customer.location
        },
        timestamp: customer.lastOrder
      });
    });

    // Data Sources
    data.dataSources.forEach(source => {
      documents.push({
        id: source.id,
        title: source.name,
        description: source.description,
        content: `${source.name} ${source.description} ${source.source} ${source.type}`,
        type: 'data_source' as SearchResultType,
        category: 'Data Sources',
        url: '/data',
        tags: ['data', source.type, source.source.toLowerCase()],
        metadata: {
          source: source.source,
          type: source.type,
          status: source.status,
          recordCount: source.recordCount
        },
        timestamp: source.lastSync
      });
    });

    // Forecasts
    data.forecasts.forEach(forecast => {
      documents.push({
        id: forecast.id,
        title: forecast.name,
        description: forecast.description,
        content: `${forecast.name} ${forecast.description} ${forecast.type} ${forecast.algorithm}`,
        type: 'forecast' as SearchResultType,
        category: 'Forecasting',
        url: '/forecasting',
        tags: ['forecast', forecast.type, forecast.algorithm.toLowerCase()],
        metadata: {
          type: forecast.type,
          accuracy: forecast.accuracy,
          confidence: forecast.confidence,
          algorithm: forecast.algorithm,
          prediction: forecast.prediction
        },
        timestamp: forecast.createdDate
      });
    });

    // Business Insights
    data.insights.forEach(insight => {
      documents.push({
        id: insight.id,
        title: insight.title,
        description: insight.message,
        content: `${insight.title} ${insight.message} ${insight.category}`,
        type: 'insight' as SearchResultType,
        category: 'Insights',
        url: '/dashboard',
        tags: ['insight', insight.type, insight.category],
        metadata: {
          type: insight.type,
          category: insight.category,
          confidence: insight.confidence,
          impact: insight.impact
        }
      });
    });

    // Customer Conversations
    data.conversations.forEach(conversation => {
      documents.push({
        id: conversation.id,
        title: `Conversation with ${conversation.userName}`,
        description: conversation.summary,
        content: `${conversation.userName} ${conversation.subject} ${conversation.summary} ${conversation.intent}`,
        type: 'conversation' as SearchResultType,
        category: 'Customer Service',
        url: '/customer-service',
        tags: ['conversation', conversation.intent, conversation.status],
        metadata: {
          userId: conversation.userId,
          userName: conversation.userName,
          status: conversation.status,
          satisfaction: conversation.satisfaction,
          intent: conversation.intent,
          messages: conversation.messages
        },
        timestamp: conversation.startTime
      });
    });

    // File Uploads
    data.uploads.forEach(upload => {
      documents.push({
        id: upload.id,
        title: upload.filename,
        description: upload.description,
        content: `${upload.filename} ${upload.description}`,
        type: 'data_source' as SearchResultType,
        category: 'Uploads',
        url: '/data',
        tags: ['upload', upload.status, 'file'],
        metadata: {
          status: upload.status,
          recordCount: upload.recordCount,
          fileSize: upload.fileSize
        },
        timestamp: upload.uploadDate
      });
    });

    // Orders
    data.orders.forEach(order => {
      documents.push({
        id: order.id,
        title: `Order ${order.orderNumber}`,
        description: order.description,
        content: `${order.orderNumber} ${order.customerName} ${order.items.join(' ')} ${order.description}`,
        type: 'order' as SearchResultType,
        category: 'Orders',
        url: '/dashboard',
        tags: ['order', order.status],
        metadata: {
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          items: order.items
        },
        timestamp: order.orderDate
      });
    });

    // Help Articles
    data.helpArticles.forEach(article => {
      documents.push({
        id: article.id,
        title: article.title,
        description: `Help article: ${article.content.substring(0, 100)}...`,
        content: `${article.title} ${article.content} ${article.tags.join(' ')}`,
        type: 'help_article' as SearchResultType,
        category: 'Help',
        url: '/help',
        tags: ['help', 'documentation', ...article.tags],
        metadata: {
          category: article.category,
          views: article.views,
          helpful: article.helpful
        },
        timestamp: article.lastUpdated
      });
    });

    return documents;
  }

  /**
   * Add real-time document updates
   */
  async addDocument(type: string, data: any): Promise<void> {
    const document = this.convertSingleItemToDocument(type, data);
    if (document) {
      this.searchEngine.addDocuments([document]);
    }
  }

  private convertSingleItemToDocument(type: string, data: any): SearchDocument | null {
    switch (type) {
      case 'product':
        return {
          id: data.id,
          title: data.name,
          description: data.description,
          content: `${data.name} ${data.description} ${data.category}`,
          type: 'product' as SearchResultType,
          category: 'Products',
          url: '/dashboard',
          tags: ['product', data.category?.toLowerCase()],
          metadata: data
        };
      
      case 'order':
        return {
          id: data.id,
          title: `Order ${data.orderNumber}`,
          description: `Order for ${data.customerName}`,
          content: `${data.orderNumber} ${data.customerName}`,
          type: 'order' as SearchResultType,
          category: 'Orders',
          url: '/dashboard',
          tags: ['order', data.status],
          metadata: data,
          timestamp: new Date(data.orderDate)
        };
      
      default:
        return null;
    }
  }
}