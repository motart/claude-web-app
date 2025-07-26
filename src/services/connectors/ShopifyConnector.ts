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
        salesData.push({
          userId,
          storeId,
          platform: 'shopify',
          productId: lineItem.product_id.toString(),
          productName: lineItem.title,
          sku: lineItem.sku,
          date: new Date(order.created_at),
          quantity: lineItem.quantity,
          revenue: parseFloat(lineItem.price) * lineItem.quantity,
          currency: order.currency,
          metadata: {
            orderId: order.id,
            customerId: order.customer?.id,
            customerLocation: order.customer?.location
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