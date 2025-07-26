import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Card, CardContent, Box, Grid } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function AppSimple() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography variant="h2" sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 2 
            }}>
              🚀 Retail Forecast Platform
            </Typography>
            <Typography variant="h5" sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: 4 
            }}>
              AI-Powered Sales Forecasting
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    📊 Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    View your sales analytics and KPI metrics in beautiful, 
                    modern charts and visualizations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    🔮 AI Forecasting
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Generate accurate sales predictions using advanced machine 
                    learning models including LSTM, ARIMA, and Prophet.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    🔗 Platform Connectors
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Connect your Shopify, Amazon, and other e-commerce platforms 
                    to automatically sync sales data.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ 
            mt: 4, 
            p: 3, 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
              ✅ React + Material-UI Working!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              If you can see this page with beautiful styling, the modern UI components are working correctly.
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default AppSimple;