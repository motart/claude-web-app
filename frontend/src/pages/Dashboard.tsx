import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { dataAPI, forecastAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PageSearch } from '../components/PageSearch';
import { SearchResult, SearchResultType } from '../types/search';

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalQuantity: number;
    totalOrders: number;
    averageOrderValue: number;
    period: {
      start: string;
      end: string;
    };
  };
  trends: Array<{
    date: string;
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  categoryBreakdown: Array<{
    _id: string;
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: {
      productId: string;
      productName: string;
    };
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  insights: Array<{
    type: string;
    message: string;
    value: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [forecast, setForecast] = useState<any>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [generatingForecast, setGeneratingForecast] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchLatestForecast();

    // Listen for data upload events to auto-refresh dashboard
    const handleDataUploaded = (event: CustomEvent) => {
      console.log('Data uploaded, refreshing dashboard...', event.detail);
      setTimeout(() => {
        fetchDashboardData();
      }, 1000); // Small delay to ensure data is processed
    };

    window.addEventListener('dataUploaded', handleDataUploaded as EventListener);

    return () => {
      window.removeEventListener('dataUploaded', handleDataUploaded as EventListener);
    };
  }, []);

  const fetchLatestForecast = async () => {
    try {
      setForecastLoading(true);
      const response = await forecastAPI.getForecasts({ limit: 1, storeId: 'main-store' });
      if (response.data.forecasts.length > 0) {
        setForecast(response.data.forecasts[0]);
      }
    } catch (err) {
      console.error('Error fetching forecast:', err);
    } finally {
      setForecastLoading(false);
    }
  };

  const generateNewForecast = async () => {
    try {
      setGeneratingForecast(true);
      const response = await forecastAPI.generateForecast({
        storeId: 'main-store',
        forecastDays: 30,
        modelConfig: {
          modelType: 'ensemble',
          forecastType: 'daily',
          trainingPeriodDays: 365
        }
      });
      setForecast(response.data.forecast);
    } catch (err) {
      console.error('Error generating forecast:', err);
    } finally {
      setGeneratingForecast(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dataAPI.getAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      setData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string, filters: any) => {
    if (!query.trim() || !data) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Search dashboard metrics
      const metrics = [
        { id: 'revenue', title: 'Total Revenue', value: data.summary.totalRevenue, description: 'Total revenue across all channels' },
        { id: 'orders', title: 'Total Orders', value: data.summary.totalOrders, description: 'Number of completed orders' },
        { id: 'items', title: 'Items Sold', value: data.summary.totalQuantity, description: 'Total quantity of items sold' },
        { id: 'aov', title: 'Average Order Value', value: data.summary.averageOrderValue, description: 'Average value per order' }
      ];

      metrics.forEach(metric => {
        if (metric.title.toLowerCase().includes(lowerQuery) || 
            metric.description.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: metric.id,
            title: metric.title,
            description: metric.description,
            type: 'dashboard_metric' as SearchResultType,
            category: 'Dashboard',
            url: '/dashboard',
            score: 0.9,
            metadata: { value: metric.value },
            tags: ['metric', 'dashboard']
          });
        }
      });

      // Search top products
      data.topProducts.forEach(product => {
        if (product._id.productName.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: product._id.productId,
            title: product._id.productName,
            description: `Revenue: ${formatCurrency(product.revenue)}, Quantity: ${product.quantity}`,
            type: 'product' as SearchResultType,
            category: 'Products',
            url: '/dashboard',
            score: 0.8,
            metadata: { revenue: product.revenue, quantity: product.quantity },
            tags: ['product', 'revenue']
          });
        }
      });

      // Search categories
      data.categoryBreakdown.forEach(category => {
        if (category._id.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: `category_${category._id}`,
            title: `${category._id} Category`,
            description: `Revenue: ${formatCurrency(category.revenue)}, Orders: ${category.orders}`,
            type: 'dashboard_metric' as SearchResultType,
            category: 'Categories',
            url: '/dashboard',
            score: 0.7,
            metadata: { revenue: category.revenue, orders: category.orders },
            tags: ['category', 'revenue']
          });
        }
      });

      // Search insights
      data.insights.forEach((insight, index) => {
        if (insight.message.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: `insight_${index}`,
            title: 'Business Insight',
            description: insight.message,
            type: 'insight' as SearchResultType,
            category: 'Insights',
            url: '/dashboard',
            score: 0.6,
            metadata: { type: insight.type, value: insight.value },
            tags: ['insight', insight.type]
          });
        }
      });

      // Apply filters
      let filteredResults = results;
      if (filters.types && filters.types.length > 0) {
        filteredResults = filteredResults.filter(result => 
          filters.types.includes(result.type)
        );
      }

      if (filters.category) {
        filteredResults = filteredResults.filter(result => 
          result.category === filters.category
        );
      }

      filteredResults.sort((a, b) => b.score - a.score);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [data]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data || data.summary.totalRevenue === 0) {
    return (
      <Box>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Let's get your retail analytics started.
          </Typography>
        </Box>

        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          px: 3,
          maxWidth: 600,
          mx: 'auto'
        }}>
          <Box sx={{ fontSize: 64, mb: 3 }}>📊</Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            No Data Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Start by uploading your sales data or connecting your e-commerce platforms to see analytics and insights.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/data')}
              sx={{ px: 4 }}
            >
              Upload Data
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/connectors')}
              sx={{ px: 4 }}
            >
              Connect Platforms
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Here's what's happening with your retail business today.
        </Typography>
        
        {/* Dashboard Search */}
        <PageSearch
          placeholder="Search dashboard metrics, products, categories, and insights..."
          onSearch={handleSearch}
          results={searchResults}
          isLoading={isSearching}
          availableFilters={{
            types: ['dashboard_metric', 'product', 'insight'],
            categories: ['Dashboard', 'Products', 'Categories', 'Insights']
          }}
          compact
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Revenue
                </Typography>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(255,255,255,0.2)' 
                }}>
                  💰
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(data.summary.totalRevenue)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +12.5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Orders
                </Typography>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(255,255,255,0.2)' 
                }}>
                  📦
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {data.summary.totalOrders.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +8.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Items Sold
                </Typography>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(255,255,255,0.2)' 
                }}>
                  📊
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {data.summary.totalQuantity.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +15.3% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg Order Value
                </Typography>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(255,255,255,0.2)' 
                }}>
                  💳
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(data.summary.averageOrderValue)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +3.7% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Insights */}
      {data.insights.length > 0 && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              {data.insights.map((insight, index) => (
                <Alert 
                  key={index} 
                  severity={insight.type === 'positive' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'}
                  sx={{ mb: 1 }}
                >
                  {insight.message}
                </Alert>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue & Orders Trend with Area Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📈 Revenue & Orders Trend (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#666"
                />
                <YAxis yAxisId="revenue" orientation="left" tickFormatter={formatCurrency} stroke="#8884d8" />
                <YAxis yAxisId="orders" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Quantity'
                  ]}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Area 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                  name="Revenue"
                />
                <Bar 
                  yAxisId="orders"
                  dataKey="orders" 
                  fill="#82ca9d" 
                  name="Orders"
                  radius={[2, 2, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Breakdown with Enhanced Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🏷️ Revenue by Category
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.categoryBreakdown.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="_id"
                >
                  {data.categoryBreakdown.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Daily Performance Scatter Plot */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📊 Daily Performance (Revenue vs Orders)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  dataKey="orders" 
                  name="Orders"
                  stroke="#666"
                />
                <YAxis 
                  type="number" 
                  dataKey="revenue" 
                  name="Revenue"
                  tickFormatter={formatCurrency}
                  stroke="#666"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Scatter dataKey="revenue" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quantity Trends */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📦 Quantity Sold Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#666"
                />
                <YAxis 
                  tickFormatter={(value) => value.toLocaleString()}
                  stroke="#666"
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value.toLocaleString(), 'Quantity']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#82ca9d" 
                  fill="url(#colorQuantity)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products - Horizontal Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🏆 Top Products by Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart 
                data={data.topProducts.slice(0, 12)}
                layout="horizontal"
                margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  tickFormatter={formatCurrency}
                  stroke="#666"
                />
                <YAxis 
                  type="category"
                  dataKey="_id.productName" 
                  width={100}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : 'Quantity'
                  ]}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  name="Quantity"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Performance Radial Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              🎯 Category Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data.categoryBreakdown.slice(0, 5)}>
                <RadialBar 
                  dataKey="revenue" 
                  cornerRadius={4} 
                  fill="#8884d8"
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Stats Grid */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📈 Quick Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round(data.summary.totalRevenue / data.summary.totalOrders)}
                  </Typography>
                  <Typography variant="body2">Avg Revenue/Order</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, backgroundColor: 'success.main', color: 'white', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round(data.summary.totalQuantity / data.summary.totalOrders)}
                  </Typography>
                  <Typography variant="body2">Avg Items/Order</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, backgroundColor: 'warning.main', color: 'white', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {data.topProducts.length}
                  </Typography>
                  <Typography variant="body2">Active Products</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, backgroundColor: 'info.main', color: 'white', borderRadius: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {data.categoryBreakdown.length}
                  </Typography>
                  <Typography variant="body2">Categories</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ML Predictions Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                🤖 AI Sales Predictions
              </Typography>
              <Button
                variant="contained"
                onClick={generateNewForecast}
                disabled={generatingForecast}
                sx={{ px: 3 }}
              >
                {generatingForecast ? 'Generating...' : 'Generate New Forecast'}
              </Button>
            </Box>

            {forecastLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : forecast ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Next 30 Days Sales Forecast
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={forecast.predictions?.slice(0, 30) || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: number, name: string) => [
                            name === 'predictedRevenue' ? formatCurrency(value) : value.toFixed(0),
                            name === 'predictedRevenue' ? 'Predicted Revenue' : 'Confidence Bounds'
                          ]}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="predictedRevenue" 
                          stroke="#2196f3" 
                          strokeWidth={3}
                          name="Predicted Revenue"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="upperBound" 
                          stroke="#4caf50" 
                          strokeDasharray="5 5"
                          name="Upper Bound"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lowerBound" 
                          stroke="#ff9800" 
                          strokeDasharray="5 5"
                          name="Lower Bound"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Forecast Details
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Model Type</Typography>
                      <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
                        {forecast.modelType}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                      <Typography variant="h6">
                        {forecast.accuracy?.r2Score ? `${(forecast.accuracy.r2Score * 100).toFixed(1)}%` : 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Next 7 Days Total</Typography>
                      <Typography variant="h6" color="primary">
                        {forecast.predictions ? 
                          formatCurrency(
                            forecast.predictions.slice(0, 7).reduce((sum: number, pred: any) => sum + pred.predictedRevenue, 0)
                          ) : 'N/A'
                        }
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Generated: {forecast.generatedAt ? new Date(forecast.generatedAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  No sales predictions available yet.
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Generate AI-powered sales forecasts based on your historical data using advanced machine learning models.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={generateNewForecast}
                  disabled={generatingForecast}
                  size="large"
                >
                  Generate First Forecast
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};