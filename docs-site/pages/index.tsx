import React from 'react'
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  RocketLaunch as QuickStartIcon,
  Api as ApiIcon,
  Link as IntegrationIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import Link from 'next/link'

const Home = () => {
  const quickLinks = [
    {
      title: 'Quick Start',
      description: 'Get up and running with OrderNimbus in minutes',
      icon: <QuickStartIcon />,
      href: '/getting-started',
      color: 'primary'
    },
    {
      title: 'API Reference',
      description: 'Complete API documentation with examples',
      icon: <ApiIcon />,
      href: '/api',
      color: 'secondary'
    },
    {
      title: 'Integrations',
      description: 'Connect with Shopify, Amazon, and more',
      icon: <IntegrationIcon />,
      href: '/integrations',
      color: 'success'
    },
    {
      title: 'Support',
      description: 'Troubleshooting guides and FAQ',
      icon: <SupportIcon />,
      href: '/support',
      color: 'info'
    }
  ]

  const features = [
    'AI-powered sales forecasting with 94%+ accuracy',
    'Real-time inventory optimization',
    'Multi-platform integrations (Shopify, Amazon, WooCommerce)',
    'Advanced analytics and reporting',
    'Enterprise-grade security (SOC 2 Type II)',
    'RESTful API with comprehensive documentation',
    'Webhook support for real-time updates',
    '24/7 monitoring and support'
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          OrderNimbus Documentation
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Everything you need to integrate and leverage our AI-powered sales forecasting platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Chip label="Version 2.1.0" color="primary" />
          <Chip label="API v1" color="secondary" />
          <Chip label="SOC 2 Compliant" color="success" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/getting-started" passHref>
            <Button variant="contained" size="large">
              Get Started
            </Button>
          </Link>
          <Link href="/api" passHref>
            <Button variant="outlined" size="large">
              API Reference
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Quick Links Grid */}
      <Typography variant="h3" component="h2" sx={{ mb: 4, textAlign: 'center' }}>
        Quick Links
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {quickLinks.map((link, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Link href={link.href} style={{ textDecoration: 'none' }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        mr: 2, 
                        color: `${link.color}.main`,
                        '& svg': { fontSize: 32 }
                      }}
                    >
                      {link.icon}
                    </Box>
                    <Typography variant="h5" component="h3">
                      {link.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {link.description}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Platform Features */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
            Platform Features
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
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
            <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
              Need Help?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Our support team is here to help you get the most out of OrderNimbus. 
              From integration assistance to advanced configurations, we've got you covered.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link href="/support" passHref>
                <Button variant="contained" color="secondary">
                  Get Support
                </Button>
              </Link>
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
                href="mailto:support@ordernimbus.com"
              >
                Email Support
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Latest Updates */}
      <Card sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          Latest Updates
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                v2.1.0 Release
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enhanced AI forecasting models with improved accuracy and new webhook support.
              </Typography>
              <Link href="/changelog" passHref>
                <Button size="small">View Changelog</Button>
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                New Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                WooCommerce connector now available with full inventory sync capabilities.
              </Typography>
              <Link href="/integrations/woocommerce" passHref>
                <Button size="small">Learn More</Button>
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Security Update
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enhanced API security with new authentication methods and rate limiting.
              </Typography>
              <Link href="/security" passHref>
                <Button size="small">Security Details</Button>
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Container>
  )
}

export default Home