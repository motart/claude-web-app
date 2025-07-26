import { SalesData } from '../models/SalesData';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import * as _ from 'lodash';

export class DataProcessor {
  async generateAnalytics(userId: string, storeId?: string, startDate?: string, endDate?: string) {
    const filter: any = { userId };
    
    if (storeId) filter.storeId = storeId;
    
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate) : new Date();
    
    filter.date = { $gte: startOfDay(start), $lte: endOfDay(end) };

    const [salesData, totalStats, trendData, categoryBreakdown, topProducts] = await Promise.all([
      SalesData.find(filter).sort({ date: -1 }),
      this.getTotalStats(filter),
      this.getTrendData(filter),
      this.getCategoryBreakdown(filter),
      this.getTopProducts(filter)
    ]);

    return {
      summary: {
        totalRevenue: totalStats.totalRevenue,
        totalQuantity: totalStats.totalQuantity,
        totalOrders: totalStats.totalOrders,
        averageOrderValue: totalStats.averageOrderValue,
        period: { start, end }
      },
      trends: trendData,
      categoryBreakdown,
      topProducts,
      insights: this.generateInsights(salesData, trendData)
    };
  }

  private async getTotalStats(filter: any) {
    const stats = await SalesData.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalQuantity: { $sum: '$quantity' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$revenue' }
        }
      }
    ]);

    return stats[0] || {
      totalRevenue: 0,
      totalQuantity: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };
  }

  private async getTrendData(filter: any) {
    return await SalesData.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          revenue: { $sum: '$revenue' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          revenue: 1,
          quantity: 1,
          orders: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
  }

  private async getCategoryBreakdown(filter: any) {
    return await SalesData.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          revenue: { $sum: '$revenue' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
  }

  private async getTopProducts(filter: any) {
    return await SalesData.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            productId: '$productId',
            productName: '$productName'
          },
          revenue: { $sum: '$revenue' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
  }

  private generateInsights(salesData: any[], trendData: any[]) {
    const insights = [];

    if (trendData.length >= 7) {
      const recentWeek = trendData.slice(-7);
      const previousWeek = trendData.slice(-14, -7);
      
      const recentRevenue = _.sumBy(recentWeek, 'revenue');
      const previousRevenue = _.sumBy(previousWeek, 'revenue');
      
      const growthRate = ((recentRevenue - previousRevenue) / previousRevenue) * 100;
      
      if (growthRate > 10) {
        insights.push({
          type: 'positive',
          message: `Sales are trending up with ${growthRate.toFixed(1)}% growth this week`,
          value: growthRate
        });
      } else if (growthRate < -10) {
        insights.push({
          type: 'warning',
          message: `Sales are declining with ${Math.abs(growthRate).toFixed(1)}% drop this week`,
          value: growthRate
        });
      }
    }

    const weeklyData = this.groupByWeek(trendData);
    const seasonality = this.detectSeasonality(weeklyData);
    
    if (seasonality.hasPattern) {
      insights.push({
        type: 'info',
        message: `Detected seasonal pattern: ${seasonality.pattern}`,
        value: seasonality.strength
      });
    }

    const forecast = this.simpleLinearForecast(trendData.slice(-30));
    insights.push({
      type: 'forecast',
      message: `Predicted next week revenue: $${forecast.toFixed(2)}`,
      value: forecast
    });

    return insights;
  }

  private groupByWeek(trendData: any[]) {
    return _.groupBy(trendData, (item) => format(new Date(item.date), 'yyyy-ww'));
  }

  private detectSeasonality(weeklyData: any) {
    const weeks = Object.keys(weeklyData);
    
    if (weeks.length < 4) {
      return { hasPattern: false };
    }

    const weeklyRevenues = weeks.map(week => 
      _.sumBy(weeklyData[week], 'revenue')
    );

    const mean = _.mean(weeklyRevenues);
    const variance = _.mean(weeklyRevenues.map(r => Math.pow(r - mean, 2)));
    const coefficient = Math.sqrt(variance) / mean;

    return {
      hasPattern: coefficient > 0.3,
      pattern: coefficient > 0.5 ? 'High volatility' : 'Moderate seasonality',
      strength: coefficient
    };
  }

  private simpleLinearForecast(recentData: any[]) {
    if (recentData.length < 2) return 0;

    const revenues = recentData.map(d => d.revenue);
    const n = revenues.length;
    
    const sumX = _.sum(_.range(n));
    const sumY = _.sum(revenues);
    const sumXY = _.sum(revenues.map((y, x) => x * y));
    const sumXX = _.sum(_.range(n).map(x => x * x));

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * n + intercept;
  }

  async validateAndCleanData(salesData: any[]) {
    const cleanedData = [];
    const errors = [];

    for (const record of salesData) {
      const validation = this.validateSalesRecord(record);
      
      if (validation.isValid) {
        cleanedData.push(this.cleanSalesRecord(record));
      } else {
        errors.push({
          record,
          errors: validation.errors
        });
      }
    }

    return { cleanedData, errors };
  }

  private validateSalesRecord(record: any) {
    const errors = [];

    if (!record.date || isNaN(new Date(record.date).getTime())) {
      errors.push('Invalid date');
    }

    if (!record.revenue || record.revenue < 0) {
      errors.push('Invalid revenue');
    }

    if (!record.quantity || record.quantity < 0) {
      errors.push('Invalid quantity');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private cleanSalesRecord(record: any) {
    return {
      ...record,
      date: new Date(record.date),
      revenue: parseFloat(record.revenue),
      quantity: parseInt(record.quantity),
      cost: record.cost ? parseFloat(record.cost) : undefined,
      profit: record.cost ? record.revenue - record.cost : undefined
    };
  }
}