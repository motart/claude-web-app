import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface AmazonCredentials {
  sellerId: string;
  accessKey: string;
  secretKey: string;
  marketplaceId: string;
}

export interface AmazonOrderData {
  AmazonOrderId: string;
  PurchaseDate: string;
  OrderTotal: {
    Amount: number;
    CurrencyCode: string;
  };
  OrderItems: Array<{
    ASIN: string;
    Title: string;
    QuantityOrdered: number;
    ItemPrice: {
      Amount: number;
      CurrencyCode: string;
    };
    SKU: string;
  }>;
}

export class AmazonConnector {
  private baseURL = 'https://sellingpartnerapi-na.amazon.com';
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async validateConnection(credentials: AmazonCredentials): Promise<boolean> {
    try {
      const headers = this.generateAWSHeaders(
        'GET',
        '/orders/v0/orders',
        credentials,
        new Date()
      );

      const response = await this.client.get(
        `${this.baseURL}/orders/v0/orders`,
        {
          headers,
          params: {
            MarketplaceIds: credentials.marketplaceId,
            CreatedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            MaxResultsPerPage: 1
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Amazon connection validation failed:', error);
      return false;
    }
  }

  async getOrders(
    credentials: AmazonCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<AmazonOrderData[]> {
    try {
      const createdAfter = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const createdBefore = endDate || new Date();

      const headers = this.generateAWSHeaders(
        'GET',
        '/orders/v0/orders',
        credentials,
        new Date()
      );

      const response = await this.client.get(
        `${this.baseURL}/orders/v0/orders`,
        {
          headers,
          params: {
            MarketplaceIds: credentials.marketplaceId,
            CreatedAfter: createdAfter.toISOString(),
            CreatedBefore: createdBefore.toISOString(),
            MaxResultsPerPage: 100
          }
        }
      );

      const orders = response.data.payload?.Orders || [];
      const ordersWithItems = await this.enrichOrdersWithItems(orders, credentials);
      
      return ordersWithItems;
    } catch (error) {
      console.error('Failed to fetch Amazon orders:', error);
      throw new Error('Failed to fetch orders from Amazon');
    }
  }

  private async enrichOrdersWithItems(orders: any[], credentials: AmazonCredentials): Promise<AmazonOrderData[]> {
    const enrichedOrders = [];

    for (const order of orders) {
      try {
        const headers = this.generateAWSHeaders(
          'GET',
          `/orders/v0/orders/${order.AmazonOrderId}/orderItems`,
          credentials,
          new Date()
        );

        const itemsResponse = await this.client.get(
          `${this.baseURL}/orders/v0/orders/${order.AmazonOrderId}/orderItems`,
          { headers }
        );

        enrichedOrders.push({
          ...order,
          OrderItems: itemsResponse.data.payload?.OrderItems || []
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to fetch items for order ${order.AmazonOrderId}:`, error);
        enrichedOrders.push({
          ...order,
          OrderItems: []
        });
      }
    }

    return enrichedOrders;
  }

  private generateAWSHeaders(method: string, path: string, credentials: AmazonCredentials, date: Date) {
    const timestamp = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = timestamp.substr(0, 8);
    
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/us-east-1/execute-api/aws4_request`;
    
    const canonicalHeaders = `host:sellingpartnerapi-na.amazon.com\nx-amz-date:${timestamp}\n`;
    const signedHeaders = 'host;x-amz-date';
    
    const payloadHash = crypto.createHash('sha256').update('').digest('hex');
    
    const canonicalRequest = [
      method,
      path,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');
    
    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');
    
    const signingKey = this.getSignatureKey(credentials.secretKey, dateStamp, 'us-east-1', 'execute-api');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    
    const authorizationHeader = `${algorithm} Credential=${credentials.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      'Authorization': authorizationHeader,
      'x-amz-date': timestamp,
      'x-amz-content-sha256': payloadHash,
      'Host': 'sellingpartnerapi-na.amazon.com'
    };
  }

  private getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    
    return kSigning;
  }

  transformOrdersToSalesData(orders: AmazonOrderData[], storeId: string, userId: string) {
    const salesData = [];

    for (const order of orders) {
      for (const item of order.OrderItems) {
        salesData.push({
          userId,
          storeId,
          platform: 'amazon',
          productId: item.ASIN,
          productName: item.Title,
          sku: item.SKU,
          date: new Date(order.PurchaseDate),
          quantity: item.QuantityOrdered,
          revenue: item.ItemPrice.Amount * item.QuantityOrdered,
          currency: item.ItemPrice.CurrencyCode,
          metadata: {
            orderId: order.AmazonOrderId,
            asin: item.ASIN,
            marketplaceId: order.OrderTotal.CurrencyCode
          }
        });
      }
    }

    return salesData;
  }
}