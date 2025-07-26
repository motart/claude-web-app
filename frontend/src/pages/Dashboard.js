import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { dataAPI } from '../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dataAPI.getAnalytics({});
        setDashboardData(response.data.summary || {
          totalRevenue: 0,
          totalOrders: 0,
          totalQuantity: 0,
          averageOrderValue: 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set empty data if API fails
        setDashboardData({
          totalRevenue: 0,
          totalOrders: 0,
          totalQuantity: 0,
          averageOrderValue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {dashboardData?.totalOrders > 0 
            ? "Here's what's happening with your retail business today."
            : "Get started by uploading sales data or connecting your store."
          }
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
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
                {formatCurrency(dashboardData?.totalRevenue)}
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
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Orders
                </Typography>
                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  📦
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {(dashboardData?.totalOrders || 0).toLocaleString()}
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
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Items Sold
                </Typography>
                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  📊
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {(dashboardData?.totalQuantity || 0).toLocaleString()}
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
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg Order Value
                </Typography>
                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  💳
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(dashboardData?.averageOrderValue)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +3.7% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Forecast
            </Typography>
            <Box sx={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.50',
              borderRadius: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                📈 AI-powered forecasting chart will appear here
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="subtitle1">📊 Generate Forecast</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Create AI predictions for next 30 days
                </Typography>
              </Card>
              <Card sx={{ p: 2, bgcolor: 'secondary.main', color: 'white' }}>
                <Typography variant="subtitle1">⬆️ Upload Data</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Import your latest sales data
                </Typography>
              </Card>
              <Card sx={{ p: 2, bgcolor: 'success.main', color: 'white' }}>
                <Typography variant="subtitle1">🔗 Connect Store</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Link Shopify or Amazon account
                </Typography>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};