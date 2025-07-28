import React from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material'
import {
  Security as SecurityIcon,
  DataObject as DataIcon,
  Analytics as AnalyticsIcon,
  Webhook as WebhookIcon,
  Speed as SpeedIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import Link from 'next/link'

const APIReference = () => {
  const endpoints = [
    {
      category: 'Authentication',
      description: 'Secure API access and token management',
      icon: <SecurityIcon />,
      endpoints: [
        { method: 'POST', path: '/auth/login', description: 'Authenticate user and get access token' },
        { method: 'POST', path: '/auth/refresh', description: 'Refresh access token' },
        { method: 'POST', path: '/auth/logout', description: 'Invalidate access token' }
      ]
    },
    {
      category: 'Data Ingestion',
      description: 'Upload and manage your sales data',
      icon: <DataIcon />,
      endpoints: [
        { method: 'POST', path: '/data/upload', description: 'Upload sales data via CSV or JSON' },
        { method: 'GET', path: '/data/sales', description: 'Retrieve sales data with filters' },
        { method: 'POST', path: '/data/manual', description: 'Add individual sales records' },
        { method: 'DELETE', path: '/data/{id}', description: 'Delete specific sales record' }
      ]
    },
    {
      category: 'Forecasting',
      description: 'AI-powered sales predictions and analytics',
      icon: <AnalyticsIcon />,
      endpoints: [
        { method: 'POST', path: '/forecast/predict', description: 'Generate sales forecast' },
        { method: 'GET', path: '/forecast/{id}', description: 'Retrieve specific forecast' },
        { method: 'GET', path: '/forecast/history', description: 'Get forecast history' },
        { method: 'POST', path: '/forecast/batch', description: 'Bulk forecast generation' }
      ]
    },
    {
      category: 'Analytics',
      description: 'Business insights and performance metrics',
      icon: <AnalyticsIcon />,
      endpoints: [
        { method: 'GET', path: '/analytics/dashboard', description: 'Get dashboard metrics' },
        { method: 'GET', path: '/analytics/trends', description: 'Sales trend analysis' },
        { method: 'GET', path: '/analytics/accuracy', description: 'Forecast accuracy metrics' }
      ]
    }
  ]

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'success'
      case 'post': return 'primary'
      case 'put': return 'warning'
      case 'delete': return 'error'
      default: return 'default'
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          API Reference
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Complete REST API documentation for the OrderNimbus platform. All endpoints return JSON and support standard HTTP status codes.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Chip label="Version 1.0" color="primary" />
          <Chip label="REST API" variant="outlined" />
          <Chip label="JSON" variant="outlined" />
        </Box>

        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>Base URL:</strong> https://api.ordernimbus.com/v1
        </Alert>
      </Box>

      {/* Quick Links */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Quick Navigation
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Link href="/api/authentication" style={{ textDecoration: 'none' }}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Authentication</Typography>
                <Typography variant="body2" color="text.secondary">
                  API keys, tokens, and security
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Link href="/api/data-ingestion" style={{ textDecoration: 'none' }}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <DataIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Data Ingestion</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload and manage data
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Link href="/api/forecasting" style={{ textDecoration: 'none' }}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AnalyticsIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Forecasting</Typography>
                <Typography variant="body2" color="text.secondary">
                  AI predictions and analytics
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Link href="/api/webhooks" style={{ textDecoration: 'none' }}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <WebhookIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6">Webhooks</Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time notifications
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>

      {/* API Endpoints Overview */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Endpoint Categories
      </Typography>
      
      {endpoints.map((category, index) => (
        <Card key={index} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ mr: 2, color: 'primary.main' }}>
                {category.icon}
              </Box>
              <Box>
                <Typography variant="h5" component="h3">
                  {category.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </Box>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Method</strong></TableCell>
                    <TableCell><strong>Endpoint</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.endpoints.map((endpoint, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip 
                          label={endpoint.method} 
                          color={getMethodColor(endpoint.method)}
                          size="small"
                          sx={{ minWidth: 60 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box component="code" sx={{ 
                          bgcolor: 'grey.100', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          fontSize: '0.875rem'
                        }}>
                          {endpoint.path}
                        </Box>
                      </TableCell>
                      <TableCell>{endpoint.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}

      {/* Example Request */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Example Request
      </Typography>
      
      <Paper sx={{ p: 3, mb: 6, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Generate Sales Forecast
        </Typography>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`POST /v1/forecast/predict
Authorization: Bearer your-api-token
Content-Type: application/json

{
  "storeId": "store-123",
  "productIds": ["SKU-001", "SKU-002"],
  "horizon": 30,
  "confidence": 0.95,
  "includeSeasonality": true
}

Response:
{
  "forecastId": "forecast-456",
  "status": "completed",
  "accuracy": 94.2,
  "predictions": [
    {
      "productId": "SKU-001",
      "date": "2024-02-01",
      "predictedQuantity": 45,
      "predictedRevenue": 900.00,
      "confidence": 0.95
    }
  ],
  "metadata": {
    "modelVersion": "2.1.0",
    "trainingData": "2023-01-01 to 2024-01-31"
  }
}`}
        </Box>
      </Paper>

      {/* Additional Resources */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Additional Resources
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <SpeedIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Rate Limits
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Understand API rate limiting and optimization strategies.
              </Typography>
              <Link href="/api/rate-limits" passHref>
                <Button size="small">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <ErrorIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Error Handling
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Complete guide to API error codes and resolution.
              </Typography>
              <Link href="/api/errors" passHref>
                <Button size="small">View Errors</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <WebhookIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Webhooks
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Set up real-time notifications for forecast completion.
              </Typography>
              <Link href="/api/webhooks" passHref>
                <Button size="small">Setup Guide</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default APIReference