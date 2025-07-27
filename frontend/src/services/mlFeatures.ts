export interface SalesDataPoint {
  date: string;
  revenue: number;
  quantity: number;
  product_id?: string;
  category?: string;
  price?: number;
  discount?: number;
  customer_segment?: string;
  channel?: string;
}

export interface EnhancedFeatures {
  // Time-based features
  dayOfWeek: number;
  dayOfMonth: number;
  dayOfYear: number;
  weekOfYear: number;
  month: number;
  quarter: number;
  isWeekend: boolean;
  isHoliday: boolean;
  
  // Trend features
  revenue_lag_1: number;
  revenue_lag_7: number;
  revenue_lag_30: number;
  revenue_ma_7: number;
  revenue_ma_30: number;
  revenue_trend_7d: number;
  revenue_trend_30d: number;
  
  // Seasonality features
  seasonality_weekly: number;
  seasonality_monthly: number;
  seasonality_yearly: number;
  
  // Economic indicators
  priceElasticity: number;
  competitorPrice?: number;
  marketIndex?: number;
  
  // External factors
  weatherScore?: number;
  socialMediaMentions?: number;
  adSpend?: number;
  
  // Product features
  productLifecycleStage?: string;
  inventoryLevel?: number;
  supplierLeadTime?: number;
  
  // Customer behavior
  customerAcquisitionRate?: number;
  customerRetentionRate?: number;
  averageBasketSize?: number;
}

export class AdvancedFeatureEngineer {
  private holidays: Set<string> = new Set([
    '01-01', '07-04', '12-25', '11-28', // Major US holidays
    // Add more holidays based on market
  ]);

  generateFeatures(data: SalesDataPoint[]): EnhancedFeatures[] {
    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const features: EnhancedFeatures[] = [];

    for (let i = 0; i < sortedData.length; i++) {
      const point = sortedData[i];
      const date = new Date(point.date);
      
      features.push({
        // Time features
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        dayOfYear: this.getDayOfYear(date),
        weekOfYear: this.getWeekOfYear(date),
        month: date.getMonth() + 1,
        quarter: Math.ceil((date.getMonth() + 1) / 3),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: this.isHoliday(date),
        
        // Lag features
        revenue_lag_1: i >= 1 ? sortedData[i - 1].revenue : 0,
        revenue_lag_7: i >= 7 ? sortedData[i - 7].revenue : 0,
        revenue_lag_30: i >= 30 ? sortedData[i - 30].revenue : 0,
        
        // Moving averages
        revenue_ma_7: this.calculateMA(sortedData, i, 7),
        revenue_ma_30: this.calculateMA(sortedData, i, 30),
        
        // Trends
        revenue_trend_7d: this.calculateTrend(sortedData, i, 7),
        revenue_trend_30d: this.calculateTrend(sortedData, i, 30),
        
        // Seasonality (simplified - in production use FFT/STL decomposition)
        seasonality_weekly: Math.sin(2 * Math.PI * date.getDay() / 7),
        seasonality_monthly: Math.sin(2 * Math.PI * date.getDate() / 30),
        seasonality_yearly: Math.sin(2 * Math.PI * this.getDayOfYear(date) / 365),
        
        // Price elasticity (simplified)
        priceElasticity: point.price ? point.revenue / point.price : 1,
        
        // Product lifecycle (simplified)
        productLifecycleStage: this.getProductLifecycleStage(point, i),
      });
    }

    return features;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getWeekOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = this.getDayOfYear(date);
    return Math.ceil(dayOfYear / 7);
  }

  private isHoliday(date: Date): boolean {
    const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return this.holidays.has(monthDay);
  }

  private calculateMA(data: SalesDataPoint[], currentIndex: number, window: number): number {
    if (currentIndex < window - 1) return 0;
    
    let sum = 0;
    for (let i = currentIndex - window + 1; i <= currentIndex; i++) {
      sum += data[i].revenue;
    }
    return sum / window;
  }

  private calculateTrend(data: SalesDataPoint[], currentIndex: number, window: number): number {
    if (currentIndex < window) return 0;
    
    const recent = this.calculateMA(data, currentIndex, Math.floor(window / 2));
    const past = this.calculateMA(data, currentIndex - Math.floor(window / 2), Math.floor(window / 2));
    
    return past > 0 ? (recent - past) / past : 0;
  }

  private getProductLifecycleStage(point: SalesDataPoint, index: number): string {
    // Simplified lifecycle detection - in production, use more sophisticated logic
    if (index < 30) return 'introduction';
    if (index < 90) return 'growth';
    if (index < 180) return 'maturity';
    return 'decline';
  }
}

export const featureEngineer = new AdvancedFeatureEngineer();