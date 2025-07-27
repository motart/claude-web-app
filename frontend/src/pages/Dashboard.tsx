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
  Cell
} from 'recharts';
import { dataAPI } from '../services/api';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        {/* Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryBreakdown.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="_id"
                  label={({ _id, value }) => `${_id}: ${formatCurrency(value)}`}
                >
                  {data.categoryBreakdown.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Products by Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topProducts.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id.productName" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};