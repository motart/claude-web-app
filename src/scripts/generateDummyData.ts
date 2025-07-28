import mongoose from 'mongoose';
import { SalesData } from '../models/SalesData';
import { User } from '../models/User';
import { startOfDay, subDays, addDays, format, getMonth, getDay } from 'date-fns';

// Product catalog with realistic data
const PRODUCT_CATALOG = [
  { id: 'PROD001', name: 'Premium Wireless Headphones', category: 'Electronics', price: 199.99, cost: 80.00 },
  { id: 'PROD002', name: 'Organic Cotton T-Shirt', category: 'Clothing', price: 29.99, cost: 12.00 },
  { id: 'PROD003', name: 'Smart Fitness Tracker', category: 'Electronics', price: 149.99, cost: 60.00 },
  { id: 'PROD004', name: 'Artisan Coffee Beans 1lb', category: 'Food & Beverage', price: 24.99, cost: 8.00 },
  { id: 'PROD005', name: 'Ergonomic Office Chair', category: 'Furniture', price: 299.99, cost: 120.00 },
  { id: 'PROD006', name: 'Moisturizing Face Cream', category: 'Beauty', price: 39.99, cost: 15.00 },
  { id: 'PROD007', name: 'Stainless Steel Water Bottle', category: 'Home & Garden', price: 19.99, cost: 7.00 },
  { id: 'PROD008', name: 'Yoga Mat Premium', category: 'Sports', price: 49.99, cost: 18.00 },
  { id: 'PROD009', name: 'Gaming Mechanical Keyboard', category: 'Electronics', price: 129.99, cost: 50.00 },
  { id: 'PROD010', name: 'Winter Wool Sweater', category: 'Clothing', price: 79.99, cost: 30.00 },
  { id: 'PROD011', name: 'Essential Oil Diffuser', category: 'Home & Garden', price: 59.99, cost: 22.00 },
  { id: 'PROD012', name: 'Protein Powder Chocolate', category: 'Health', price: 34.99, cost: 12.00 },
  { id: 'PROD013', name: 'LED Desk Lamp', category: 'Electronics', price: 44.99, cost: 18.00 },
  { id: 'PROD014', name: 'Running Shoes Athletic', category: 'Sports', price: 89.99, cost: 35.00 },
  { id: 'PROD015', name: 'Bamboo Cutting Board', category: 'Kitchen', price: 27.99, cost: 10.00 },
  { id: 'PROD016', name: 'Bluetooth Speaker Portable', category: 'Electronics', price: 79.99, cost: 30.00 },
  { id: 'PROD017', name: 'Ceramic Plant Pot Set', category: 'Home & Garden', price: 34.99, cost: 12.00 },
  { id: 'PROD018', name: 'Memory Foam Pillow', category: 'Home & Garden', price: 49.99, cost: 18.00 },
  { id: 'PROD019', name: 'Vitamin D3 Supplements', category: 'Health', price: 19.99, cost: 6.00 },
  { id: 'PROD020', name: 'Canvas Wall Art Print', category: 'Home & Garden', price: 39.99, cost: 15.00 }
];

const PLATFORMS = ['shopify', 'amazon', 'custom'] as const;
const CUSTOMER_LOCATIONS = ['New York', 'California', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
const PAYMENT_METHODS = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];
const DEVICE_TYPES = ['desktop', 'mobile', 'tablet'];
const MARKETING_CHANNELS = ['organic_search', 'paid_search', 'social_media', 'email', 'direct', 'referral'];

interface GenerationOptions {
  userId: string;
  storeId: string;
  startDate: Date;
  endDate: Date;
  averageDailySales: number;
  seasonalVariation: boolean;
  growthRate: number; // Annual growth rate (e.g., 0.15 for 15%)
}

class DummyDataGenerator {
  
  static async generateSalesData(options: GenerationOptions): Promise<void> {
    console.log(`Generating sales data from ${options.startDate} to ${options.endDate}...`);
    
    const salesData = [];
    let currentDate = new Date(options.startDate);
    let baseGrowthMultiplier = 1;
    
    while (currentDate <= options.endDate) {
      // Calculate growth multiplier based on time progression
      const yearProgress = (currentDate.getTime() - options.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const growthMultiplier = Math.pow(1 + options.growthRate, yearProgress);
      
      // Generate daily sales count with seasonal variations
      const baseDailySales = options.averageDailySales * growthMultiplier;
      const seasonalMultiplier = this.getSeasonalMultiplier(currentDate, options.seasonalVariation);
      const dayOfWeekMultiplier = this.getDayOfWeekMultiplier(currentDate);
      
      const dailySalesCount = Math.max(1, Math.round(
        baseDailySales * seasonalMultiplier * dayOfWeekMultiplier * (0.7 + Math.random() * 0.6)
      ));
      
      // Generate individual sales for this day
      for (let i = 0; i < dailySalesCount; i++) {
        const product = PRODUCT_CATALOG[Math.floor(Math.random() * PRODUCT_CATALOG.length)];
        const quantity = this.getRandomQuantity();
        const basePrice = product.price;
        
        // Add some price variation (+/- 10%)
        const priceVariation = 0.9 + Math.random() * 0.2;
        const finalPrice = basePrice * priceVariation;
        const revenue = finalPrice * quantity;
        const cost = (product.cost * quantity) * (0.9 + Math.random() * 0.2);
        
        salesData.push({
          userId: new mongoose.Types.ObjectId(options.userId),
          storeId: options.storeId,
          platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
          productId: product.id,
          productName: product.name,
          category: product.category,
          sku: `SKU-${product.id}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          date: new Date(currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Random time during the day
          quantity,
          revenue: Math.round(revenue * 100) / 100,
          cost: Math.round(cost * 100) / 100,
          profit: Math.round((revenue - cost) * 100) / 100,
          currency: 'USD',
          metadata: this.generateMetadata(currentDate)
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    console.log(`Generated ${salesData.length} sales records. Saving to database...`);
    
    // Save in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < salesData.length; i += batchSize) {
      const batch = salesData.slice(i, i + batchSize);
      await SalesData.insertMany(batch);
      console.log(`Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(salesData.length / batchSize)}`);
    }
    
    console.log('Sales data generation completed!');
  }
  
  private static getSeasonalMultiplier(date: Date, enableSeasonal: boolean): number {
    if (!enableSeasonal) return 1;
    
    const month = getMonth(date);
    
    // Seasonal patterns (1.0 = average)
    const seasonalFactors: { [key: number]: number } = {
      0: 0.8,  // January - post-holiday dip
      1: 0.85, // February
      2: 0.9,  // March
      3: 0.95, // April
      4: 1.0,  // May
      5: 1.1,  // June - summer start
      6: 1.15, // July - summer peak
      7: 1.1,  // August
      8: 0.95, // September - back to school
      9: 1.0,  // October
      10: 1.3, // November - Black Friday
      11: 1.5  // December - Holiday season
    };
    
    return seasonalFactors[month] || 1.0;
  }
  
  private static getDayOfWeekMultiplier(date: Date): number {
    const dayOfWeek = getDay(date);
    
    // Day of week patterns (0 = Sunday, 6 = Saturday)
    const dayFactors: { [key: number]: number } = {
      0: 1.2,  // Sunday
      1: 0.8,  // Monday
      2: 0.85, // Tuesday
      3: 0.9,  // Wednesday
      4: 0.95, // Thursday
      5: 1.1,  // Friday
      6: 1.3   // Saturday
    };
    
    return dayFactors[dayOfWeek] || 1.0;
  }
  
  private static getRandomQuantity(): number {
    // Most sales are 1-3 items, but some are larger
    const rand = Math.random();
    if (rand < 0.6) return 1;
    if (rand < 0.8) return 2;
    if (rand < 0.9) return 3;
    if (rand < 0.95) return Math.floor(Math.random() * 5) + 4; // 4-8
    return Math.floor(Math.random() * 10) + 9; // 9-18
  }
  
  private static generateMetadata(date: Date) {
    const metadata: any = {};
    
    // Add metadata randomly (not every sale has all metadata)
    if (Math.random() > 0.3) {
      metadata.customerAge = Math.floor(Math.random() * 60) + 18; // 18-77
    }
    
    if (Math.random() > 0.2) {
      metadata.customerLocation = CUSTOMER_LOCATIONS[Math.floor(Math.random() * CUSTOMER_LOCATIONS.length)];
    }
    
    if (Math.random() > 0.1) {
      metadata.paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
    }
    
    if (Math.random() > 0.1) {
      metadata.deviceType = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
    }
    
    if (Math.random() > 0.2) {
      metadata.marketingChannel = MARKETING_CHANNELS[Math.floor(Math.random() * MARKETING_CHANNELS.length)];
    }
    
    // Seasonal metadata
    const month = getMonth(date);
    if (month >= 10 || month <= 1) {
      metadata.seasonality = 'winter';
    } else if (month >= 2 && month <= 4) {
      metadata.seasonality = 'spring';
    } else if (month >= 5 && month <= 7) {
      metadata.seasonality = 'summer';
    } else {
      metadata.seasonality = 'fall';
    }
    
    // Occasional promotions (15% chance)
    if (Math.random() > 0.85) {
      metadata.promotions = [{
        type: ['percentage', 'fixed_amount', 'bogo'][Math.floor(Math.random() * 3)],
        discount: Math.floor(Math.random() * 30) + 5, // 5-34% or $5-34
        startDate: subDays(date, Math.floor(Math.random() * 7)),
        endDate: addDays(date, Math.floor(Math.random() * 14))
      }];
    }
    
    return metadata;
  }
}

// CLI script to run data generation
async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ordernimbus';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Find the first user to assign data to, or create a default one
    let user = await User.findOne();
    if (!user) {
      console.log('No users found in database. Creating default user...');
      user = new User({
        email: 'demo@ordernimbus.com',
        password: 'demo123456',
        name: 'Demo User',
        company: 'OrderNimbus Demo',
        role: 'admin',
        connectedStores: [{
          platform: 'custom',
          storeId: 'main-store',
          storeName: 'Demo Store',
          credentials: {},
          isActive: true
        }]
      });
      await user.save();
      console.log('Created default user: demo@ordernimbus.com / demo123456');
    }
    
    console.log(`Using user: ${user.email}`);
    
    // Clear existing sales data for this user (optional)
    const shouldClearExisting = process.argv.includes('--clear');
    if (shouldClearExisting) {
      console.log('Clearing existing sales data...');
      await SalesData.deleteMany({ userId: user._id });
      console.log('Existing data cleared.');
    }
    
    // Generate 5 years of data
    const endDate = new Date();
    const startDate = subDays(endDate, 5 * 365); // 5 years ago
    
    const options: GenerationOptions = {
      userId: user._id.toString(),
      storeId: 'main-store',
      startDate,
      endDate,
      averageDailySales: 25, // Average 25 sales per day
      seasonalVariation: true,
      growthRate: 0.12 // 12% annual growth
    };
    
    await DummyDataGenerator.generateSalesData(options);
    
    // Show summary
    const totalRecords = await SalesData.countDocuments({ userId: user._id });
    const totalRevenue = await SalesData.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);
    
    console.log(`\n=== GENERATION SUMMARY ===`);
    console.log(`Total records: ${totalRecords.toLocaleString()}`);
    console.log(`Total revenue: $${totalRevenue[0]?.total?.toLocaleString() || 0}`);
    console.log(`Date range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);
    console.log(`Store ID: ${options.storeId}`);
    console.log(`User: ${user.email}`);
    
  } catch (error) {
    console.error('Error generating dummy data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DummyDataGenerator };