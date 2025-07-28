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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Alert
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Store as ShopifyIcon,
  ShoppingCart as AmazonIcon,
  Language as WooCommerceIcon,
  Api as CustomIcon,
  CloudSync as SyncIcon,
  Speed as RealTimeIcon
} from '@mui/icons-material'
import Link from 'next/link'

const Integrations = () => {
  const platforms = [
    {
      name: 'Shopify',
      description: 'Sync products, orders, and inventory from your Shopify store',
      icon: <ShopifyIcon />,
      color: '#96bf48',
      features: [
        'Real-time order sync',
        'Product catalog import',
        'Inventory level tracking',
        'Multi-store support',
        'Webhook notifications'
      ],
      status: 'Available',
      href: '/integrations/shopify'
    },
    {
      name: 'Amazon Seller Central',
      description: 'Connect your Amazon marketplace for sales data and inventory management',
      icon: <AmazonIcon />,
      color: '#ff9900',
      features: [
        'Sales report automation',
        'FBA inventory tracking',
        'Multi-marketplace support',
        'Sponsored ads data',
        'Return analytics'
      ],
      status: 'Available',
      href: '/integrations/amazon'
    },
    {
      name: 'WooCommerce',
      description: 'WordPress e-commerce plugin integration for complete store sync',
      icon: <WooCommerceIcon />,
      color: '#96588a',
      features: [
        'Order history import',
        'Product variation support',
        'Customer analytics',
        'Payment gateway data',
        'Subscription tracking'
      ],
      status: 'Available',
      href: '/integrations/woocommerce'
    },
    {
      name: 'Custom Integration',
      description: 'Build your own integration using our REST API and SDKs',
      icon: <CustomIcon />,
      color: '#2563eb',
      features: [
        'REST API access',
        'Multiple SDKs available',
        'Webhook support',
        'Rate limiting',
        'Comprehensive documentation'
      ],
      status: 'Available',
      href: '/integrations/custom'
    }
  ]

  const benefits = [
    {
      title: 'Real-time Synchronization',
      description: 'Get up-to-date sales data automatically synced from your e-commerce platforms',
      icon: <RealTimeIcon color="primary" />
    },
    {
      title: 'Unified Dashboard',
      description: 'View all your sales channels in one comprehensive analytics dashboard',
      icon: <SyncIcon color="primary" />
    },
    {
      title: 'Automated Forecasting',
      description: 'AI models automatically retrain with new data for improved accuracy',
      icon: <CheckIcon color="primary" />
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Platform Integrations
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Connect OrderNimbus with your existing e-commerce platforms for seamless data synchronization and enhanced forecasting accuracy.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>No setup fees:</strong> All integrations are included in your OrderNimbus subscription at no additional cost.
        </Alert>
      </Box>

      {/* Benefits */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Integration Benefits
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2, fontSize: 48 }}>
                  {benefit.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Available Platforms */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Available Platforms
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {platforms.map((platform, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: platform.color, 
                      mr: 2, 
                      width: 56, 
                      height: 56,
                      fontSize: '1.5rem'
                    }}
                  >
                    {platform.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="h3">
                      {platform.name}
                    </Typography>
                    <Chip 
                      label={platform.status} 
                      color="success" 
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {platform.description}
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Features:
                </Typography>
                <List dense>
                  {platform.features.map((feature, idx) => (
                    <ListItem key={idx} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ mt: 3 }}>
                  <Link href={platform.href} passHref>
                    <Button variant="outlined" fullWidth>
                      Setup Guide
                    </Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Integration Process */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        How Integration Works
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              3-Step Integration Process
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Chip label="1" color="primary" sx={{ mr: 2, fontWeight: 600 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Connect Your Platform
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Authorize OrderNimbus to access your e-commerce data securely
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Chip label="2" color="primary" sx={{ mr: 2, fontWeight: 600 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Data Synchronization
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Historical sales data is imported and synced in real-time
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip label="3" color="primary" sx={{ mr: 2, fontWeight: 600 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  AI Model Training
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our AI automatically learns from your data to generate accurate forecasts
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Need Custom Integration?
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
              We can help you build custom integrations for platforms not currently supported.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth
              href="mailto:integrations@ordernimbus.com"
            >
              Contact Integration Team
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Example Integration */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Example: Shopify Integration
      </Typography>
      
      <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Webhook Configuration
        </Typography>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`// OrderNimbus automatically configures these webhooks in your Shopify store:

1. orders/create - New order notifications
2. orders/updated - Order modification tracking  
3. products/create - New product additions
4. products/update - Product changes
5. inventory_levels/update - Stock level changes

// Example webhook payload:
{
  "id": 12345,
  "order_number": "1001",
  "total_price": "150.00",
  "line_items": [
    {
      "product_id": 67890,
      "quantity": 2,
      "price": "75.00"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}`}
        </Box>
      </Card>
    </Container>
  )
}

export default Integrations