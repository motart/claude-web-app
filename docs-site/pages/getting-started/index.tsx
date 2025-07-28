import React from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Alert,
  Chip,
  Paper
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import Link from 'next/link'

const GettingStarted = () => {
  const steps = [
    {
      title: 'Create Account',
      description: 'Sign up for a free OrderNimbus account',
      href: 'https://app.ordernimbus.com/register',
      external: true
    },
    {
      title: 'Get API Keys',
      description: 'Generate your authentication credentials',
      href: '/getting-started/authentication'
    },
    {
      title: 'Install SDK',
      description: 'Choose your preferred programming language',
      href: '/getting-started/installation'
    },
    {
      title: 'First API Call',
      description: 'Upload data and get your first forecast',
      href: '/getting-started/first-api-call'
    }
  ]

  const features = [
    'AI-powered forecasting with 94%+ accuracy',
    'Real-time inventory optimization',
    'Multi-platform integrations',
    'Enterprise-grade security',
    'Comprehensive API documentation',
    'Webhook support for real-time updates'
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Getting Started
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Get up and running with OrderNimbus in minutes. Our AI-powered platform helps you forecast sales and optimize inventory with unmatched accuracy.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>Free Trial Available:</strong> Start with our 14-day free trial that includes all features and 24/7 support.
        </Alert>
      </Box>

      {/* Quick Start Steps */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Quick Start Guide
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {steps.map((step, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={index + 1} 
                    color="primary" 
                    sx={{ mr: 2, fontWeight: 600 }}
                  />
                  <Typography variant="h6" component="h3">
                    {step.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {step.description}
                </Typography>
                {step.external ? (
                  <Button 
                    variant="outlined" 
                    size="small"
                    href={step.href}
                    target="_blank"
                    rel="noopener"
                  >
                    Get Started
                  </Button>
                ) : (
                  <Link href={step.href} passHref>
                    <Button variant="outlined" size="small">
                      Learn More
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Example Code */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Quick Example
      </Typography>
      
      <Paper sx={{ p: 3, mb: 6, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Upload Sales Data and Get Forecast
        </Typography>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`// Install the SDK
npm install @ordernimbus/sdk

// Initialize client
import { OrderNimbusClient } from '@ordernimbus/sdk';

const client = new OrderNimbusClient({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Upload sales data
const salesData = [
  {
    date: '2024-01-01',
    productId: 'SKU-001',
    quantity: 25,
    revenue: 500.00,
    storeId: 'store-1'
  }
  // ... more data
];

await client.data.upload(salesData);

// Generate forecast
const forecast = await client.forecasting.predict({
  storeId: 'store-1',
  horizon: 30, // 30 days
  confidence: 0.95
});

console.log('Forecast:', forecast);`}
        </Box>
      </Paper>

      {/* Platform Features */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
            What You'll Get
          </Typography>
          <List>
            {features.map((feature, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Ready to Start?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Join thousands of retailers using AI to optimize their inventory and boost sales.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                color="secondary"
                href="https://app.ordernimbus.com/register"
                target="_blank"
                rel="noopener"
              >
                Start Free Trial
              </Button>
              <Link href="/api" passHref>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View API Docs
                </Button>
              </Link>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Next Steps */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Next Steps
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <SecurityIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Learn how to authenticate your API requests securely.
              </Typography>
              <Link href="/getting-started/authentication" passHref>
                <Button size="small">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <CodeIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                SDKs & Libraries
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose from our official SDKs for popular programming languages.
              </Typography>
              <Link href="/getting-started/installation" passHref>
                <Button size="small">View SDKs</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <SpeedIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Best Practices
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Optimize your implementation for maximum performance.
              </Typography>
              <Link href="/guides/best-practices" passHref>
                <Button size="small">Read Guide</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default GettingStarted