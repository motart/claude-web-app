import axios, { AxiosInstance } from 'axios';

export interface ShopifyOrderData {
  id: number;
  created_at: string;
  total_price: string;
  currency: string;
  line_items: Array<{
    id: number;
    product_id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
  }>;
  customer?: {
    id: number;
    location?: any;
  };
}

export class ShopifyConnector {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async exchangeCodeForToken(shopDomain: string, code: string, clientSecret: string): Promise<any> {
    try {
      const response = await this.client.post(
        `https://${shopDomain}.myshopify.com/admin/oauth/access_token`,
        {
          client_id: process.env.SHOPIFY_CLIENT_ID,
          client_secret: clientSecret,
          code
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Shopify token exchange failed:', error);
      throw new Error('Failed to exchange code for access token');
    }
  }

  async validateConnection(shopDomain: string, accessToken: string): Promise<boolean> {
    try {
      const response = await this.client.get(
        `https://${shopDomain}.myshopify.com/admin/api/2023-10/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        }
      );
      
      return response.status === 200 && response.data.shop;
    } catch (error) {
      console.error('Shopify connection validation failed:', error);
      return false;
    }
  }

  async getShopInfo(shopDomain: string, accessToken: string): Promise<any> {
    try {
      const response = await this.client.get(
        `https://${shopDomain}.myshopify.com/admin/api/2023-10/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          }
        }
      );
      
      return response.data.shop;
    } catch (error) {
      console.error('Failed to fetch shop info:', error);
      throw new Error('Failed to fetch shop information');
    }
  }

  async getOrders(
    shopDomain: string, 
    accessToken: string, 
    startDate?: Date, 
    endDate?: Date,
    limit: number = 250
  ): Promise<ShopifyOrderData[]> {
    try {
      const params: any = {
        status: 'any',
        limit,
        fields: 'id,created_at,total_price,currency,line_items,customer'
      };

      if (startDate) {
        params.created_at_min = startDate.toISOString();
      }
      
      if (endDate) {
        params.created_at_max = endDate.toISOString();
      }

      const response = await this.client.get(
        `https://${shopDomain}.myshopify.com/admin/api/2023-10/orders.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          },
          params
        }
      );

      return response.data.orders || [];
    } catch (error) {
      console.error('Failed to fetch Shopify orders:', error);
      throw new Error('Failed to fetch orders from Shopify');
    }
  }

  async getProducts(shopDomain: string, accessToken: string): Promise<any[]> {
    try {
      const response = await this.client.get(
        `https://${shopDomain}.myshopify.com/admin/api/2023-10/products.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken
          },
          params: {
            limit: 250,
            fields: 'id,title,handle,product_type,variants'
          }
        }
      );

      return response.data.products || [];
    } catch (error) {
      console.error('Failed to fetch Shopify products:', error);
      throw new Error('Failed to fetch products from Shopify');
    }
  }

  transformOrdersToSalesData(orders: ShopifyOrderData[], storeId: string, userId: string) {
    const salesData = [];

    for (const order of orders) {
      for (const lineItem of order.line_items) {
        // Calculate cost based on line item price (estimate 70% margin)
        const revenue = parseFloat(lineItem.price) * lineItem.quantity;
        const estimatedCost = revenue * 0.7; // 70% of revenue as cost estimate

        salesData.push({
          userId,
          storeId,
          platform: 'shopify',
          productId: lineItem.product_id?.toString() || lineItem.sku || `unknown-${Date.now()}`,
          productName: lineItem.title,
          category: 'E-commerce', // Default category, could be enhanced with product type
          sku: lineItem.sku || '',
          date: new Date(order.created_at),
          quantity: lineItem.quantity,
          revenue,
          cost: estimatedCost,
          currency: order.currency || 'USD',
          metadata: {
            orderId: order.id,
            customerId: order.customer?.id,
            customerLocation: order.customer?.location,
            orderTotalPrice: parseFloat(order.total_price),
            lineItemId: lineItem.id,
            source: 'shopify_api',
            syncedAt: new Date()
          }
        });
      }
    }

    return salesData;
  }

  async getAllOrdersPaginated(
    shopDomain: string,
    accessToken: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ShopifyOrderData[]> {
    let allOrders: ShopifyOrderData[] = [];
    let lastOrderId: number | null = null;
    const limit = 250;

    while (true) {
      const params: any = {
        status: 'any',
        limit,
        fields: 'id,created_at,total_price,currency,line_items,customer',
        order: 'created_at asc'
      };

      if (startDate) params.created_at_min = startDate.toISOString();
      if (endDate) params.created_at_max = endDate.toISOString();
      if (lastOrderId) params.since_id = lastOrderId;

      try {
        const response = await this.client.get(
          `https://${shopDomain}.myshopify.com/admin/api/2023-10/orders.json`,
          {
            headers: { 'X-Shopify-Access-Token': accessToken },
            params
          }
        );

        const orders = response.data.orders || [];
        
        if (orders.length === 0) break;
        
        allOrders = allOrders.concat(orders);
        lastOrderId = orders[orders.length - 1].id;

        if (orders.length < limit) break;

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error fetching paginated orders:', error);
        break;
      }
    }

    return allOrders;
  }
}