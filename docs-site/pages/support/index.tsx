import React, { useState } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'

const Support = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I get started with OrderNimbus?',
          answer: 'Getting started is easy! Sign up for a free trial at app.ordernimbus.com, get your API keys from the dashboard, and follow our quick start guide to upload your first sales data and generate forecasts.'
        },
        {
          question: 'What data do I need to provide for accurate forecasts?',
          answer: 'For best results, provide at least 12 months of historical sales data including product IDs, quantities, prices, dates, and store information. The more data you provide, the more accurate our AI forecasts will be.'
        },
        {
          question: 'How long does it take to see results?',
          answer: 'You can start generating forecasts immediately after uploading your data. Initial forecasts are available within minutes, and our AI models continue to improve as more data is processed.'
        }
      ]
    },
    {
      category: 'Integration',
      questions: [
        {
          question: 'Which e-commerce platforms do you support?',
          answer: 'We support Shopify, Amazon Seller Central, WooCommerce, and custom integrations via our REST API. Contact us if you need support for a specific platform not listed.'
        },
        {
          question: 'How often is data synchronized?',
          answer: 'Data synchronization happens in real-time via webhooks for supported platforms. For manual uploads, you can set up automated daily, weekly, or monthly sync schedules.'
        },
        {
          question: 'Can I integrate multiple stores or marketplaces?',
          answer: 'Yes! OrderNimbus supports multi-store and multi-marketplace setups. You can manage all your sales channels from a single dashboard with unified analytics and forecasting.'
        }
      ]
    },
    {
      category: 'API & Technical',
      questions: [
        {
          question: 'What are the API rate limits?',
          answer: 'Rate limits vary by plan: Starter (1,000 req/hour), Professional (5,000 req/hour), Enterprise (10,000 req/hour). Enterprise customers can request higher limits if needed.'
        },
        {
          question: 'Do you provide SDKs for different programming languages?',
          answer: 'Yes, we provide official SDKs for JavaScript/Node.js, Python, PHP, and Ruby. Community SDKs are available for other languages, and our REST API works with any HTTP client.'
        },
        {
          question: 'How do I handle API errors?',
          answer: 'Our API returns standard HTTP status codes with detailed error messages. Check our error handling guide for best practices and common solutions.'
        }
      ]
    },
    {
      category: 'Billing & Plans',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and ACH transfers for enterprise accounts. All payments are processed securely through Stripe.'
        },
        {
          question: 'Can I change my plan at any time?',
          answer: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately, and billing is prorated accordingly.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'We offer a 30-day money-back guarantee for annual plans. Monthly plans are non-refundable, but you can cancel at any time to avoid future charges.'
        }
      ]
    },
    {
      category: 'Security & Compliance',
      questions: [
        {
          question: 'How secure is my data?',
          answer: 'We use enterprise-grade security including AES-256 encryption, SOC 2 Type II compliance, and regular security audits. Your data is stored in secure AWS data centers with strict access controls.'
        },
        {
          question: 'Are you GDPR compliant?',
          answer: 'Yes, OrderNimbus is fully GDPR compliant. We provide data portability, deletion rights, and transparent privacy policies. Contact our DPO at dpo@ordernimbus.com for any data protection inquiries.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Absolutely! You can export all your data at any time in standard formats (CSV, JSON). Data exports are available through the dashboard or via API calls.'
        }
      ]
    }
  ]

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <ChatIcon />,
      availability: '24/7 for Enterprise, Business hours for others',
      action: 'Start Chat',
      href: '#'
    },
    {
      title: 'Email Support',
      description: 'Detailed support via email',
      icon: <EmailIcon />,
      availability: 'Response within 24 hours',
      action: 'Send Email',
      href: 'mailto:support@ordernimbus.com'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: <PhoneIcon />,
      availability: 'Enterprise customers only',
      action: 'Call Now',
      href: 'tel:+1-800-673-3762'
    },
    {
      title: 'Schedule Call',
      description: 'Book a consultation with our team',
      icon: <ScheduleIcon />,
      availability: 'Available for all plans',
      action: 'Book Meeting',
      href: 'https://calendly.com/ordernimbus'
    }
  ]

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Support Center
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Get help, find answers, and connect with our support team
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>24/7 Support:</strong> Enterprise customers get round-the-clock support. 
          All other plans receive support during business hours (9 AM - 6 PM EST).
        </Alert>
      </Box>

      {/* Contact Options */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Get in Touch
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {contactOptions.map((option, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2, fontSize: 48 }}>
                  {option.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {option.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                  {option.availability}
                </Typography>
                <Button 
                  variant="outlined" 
                  href={option.href}
                  target={option.href.startsWith('http') ? '_blank' : undefined}
                  rel={option.href.startsWith('http') ? 'noopener' : undefined}
                >
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQ Search */}
      <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
        Frequently Asked Questions
      </Typography>
      
      <TextField
        fullWidth
        placeholder="Search FAQs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      {/* FAQ Sections */}
      {filteredFaqs.map((category, categoryIndex) => (
        <Box key={categoryIndex} sx={{ mb: 4 }}>
          <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
            {category.category}
          </Typography>
          {category.questions.map((faq, faqIndex) => (
            <Accordion key={faqIndex}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" component="h4">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      {searchTerm && filteredFaqs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No FAQs found matching "{searchTerm}"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try different keywords or contact our support team for help
          </Typography>
        </Box>
      )}

      {/* Additional Resources */}
      <Typography variant="h3" component="h2" sx={{ mb: 4, mt: 6 }}>
        Additional Resources
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <HelpIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Documentation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comprehensive guides and API reference
              </Typography>
              <Button size="small" href="/getting-started">
                Browse Docs
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <CheckIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                System Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Check current system status and uptime
              </Typography>
              <Button 
                size="small" 
                href="https://status.ordernimbus.com"
                target="_blank"
                rel="noopener"
              >
                View Status
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <EmailIcon color="primary" sx={{ mb: 2, fontSize: 32 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Feature Requests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Suggest new features or improvements
              </Typography>
              <Button 
                size="small"
                href="mailto:feedback@ordernimbus.com"
              >
                Send Feedback
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emergency Contact */}
      <Alert severity="error" sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Emergency Support
        </Typography>
        <Typography variant="body2">
          For critical production issues affecting Enterprise customers, 
          call our emergency hotline: <strong>+1-800-673-3762</strong> (24/7)
        </Typography>
      </Alert>
    </Container>
  )
}

export default Support