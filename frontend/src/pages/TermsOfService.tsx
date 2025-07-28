import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TermsOfService: React.FC = () => {
  const theme = useTheme();

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h2" id={id} sx={{ mb: 2, color: theme.palette.primary.main }}>
        {title}
      </Typography>
      {children}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
          Terms of Service
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>

      <Section id="acceptance" title="1. Acceptance of Terms">
        <Card>
          <CardContent>
            <Typography variant="body1" paragraph>
              By accessing or using OrderNimbus's AI-powered sales forecasting platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you are entering into these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.
            </Typography>
            <Typography variant="body1">
              <strong>Effective Date:</strong> These Terms are effective upon your acceptance.
            </Typography>
          </CardContent>
        </Card>
      </Section>

      <Section id="description" title="2. Service Description">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Platform Overview
            </Typography>
            <Typography variant="body1" paragraph>
              OrderNimbus provides an enterprise-grade, AI-powered sales forecasting and inventory optimization platform designed for retail businesses. Our Service includes:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="AI-driven sales forecasting with 94%+ accuracy" /></ListItem>
              <ListItem><ListItemText primary="Real-time inventory optimization recommendations" /></ListItem>
              <ListItem><ListItemText primary="E-commerce platform integrations (Shopify, Amazon, etc.)" /></ListItem>
              <ListItem><ListItemText primary="Advanced analytics and reporting dashboard" /></ListItem>
              <ListItem><ListItemText primary="API access for custom integrations" /></ListItem>
              <ListItem><ListItemText primary="Enterprise security and compliance features" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Levels
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Plan</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Starter</TableCell>
                    <TableCell>Basic forecasting for small businesses</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Professional</TableCell>
                    <TableCell>Advanced features for growing companies</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Enterprise</TableCell>
                    <TableCell>Full-featured platform with dedicated support</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Custom</TableCell>
                    <TableCell>Tailored solutions for large organizations</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Section>

      <Section id="eligibility" title="3. Eligibility and Registration">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Eligibility Requirements
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="You must be at least 18 years old" /></ListItem>
              <ListItem><ListItemText primary="You must have legal authority to enter contracts" /></ListItem>
              <ListItem><ListItemText primary="Your use must comply with applicable laws and regulations" /></ListItem>
              <ListItem><ListItemText primary="You must provide accurate and complete information" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Business Use Only:</strong> OrderNimbus is designed for business use only. Personal or non-commercial use is not permitted under these Terms.
          </Typography>
        </Alert>
      </Section>

      <Section id="usage" title="4. Acceptable Use Policy">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Permitted Uses
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Generate sales forecasts for your business operations" /></ListItem>
              <ListItem><ListItemText primary="Analyze inventory and demand patterns" /></ListItem>
              <ListItem><ListItemText primary="Integrate with your existing business systems" /></ListItem>
              <ListItem><ListItemText primary="Share results within your organization" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              Prohibited Uses
            </Typography>
            <Typography variant="body1" paragraph>
              You may NOT:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Violate any applicable laws or regulations" /></ListItem>
              <ListItem><ListItemText primary="Infringe on intellectual property rights" /></ListItem>
              <ListItem><ListItemText primary="Attempt to reverse engineer or hack the platform" /></ListItem>
              <ListItem><ListItemText primary="Use the Service to compete with OrderNimbus" /></ListItem>
              <ListItem><ListItemText primary="Share access credentials with unauthorized parties" /></ListItem>
              <ListItem><ListItemText primary="Upload malicious code, viruses, or harmful content" /></ListItem>
              <ListItem><ListItemText primary="Exceed rate limits or abuse system resources" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="billing" title="5. Billing and Payment Terms">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Subscription Plans
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Free Trial: 14-day trial with full feature access" /></ListItem>
              <ListItem><ListItemText primary="Monthly Billing: Charged monthly in advance" /></ListItem>
              <ListItem><ListItemText primary="Annual Billing: Charged annually with discount" /></ListItem>
              <ListItem><ListItemText primary="Enterprise: Custom pricing and terms" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Terms
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Payment is due immediately upon subscription activation" /></ListItem>
              <ListItem><ListItemText primary="All fees are non-refundable except as required by law" /></ListItem>
              <ListItem><ListItemText primary="Prices are subject to change with 30 days' notice" /></ListItem>
              <ListItem><ListItemText primary="Taxes are your responsibility unless otherwise stated" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Refund Policy
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="No refunds for monthly subscriptions" /></ListItem>
              <ListItem><ListItemText primary="Annual subscriptions: Pro-rated refunds within 30 days" /></ListItem>
              <ListItem><ListItemText primary="Enterprise agreements: As specified in contract" /></ListItem>
              <ListItem><ListItemText primary="Service credits for documented downtime exceeding SLA" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="data" title="6. Data Ownership and Privacy">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Data Ownership
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="You retain all rights to your business data" /></ListItem>
              <ListItem><ListItemText primary="You grant us license to process data for service delivery" /></ListItem>
              <ListItem><ListItemText primary="We may use aggregated, anonymized data for improvements" /></ListItem>
              <ListItem><ListItemText primary="You can export your data at any time" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Security
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Enterprise-grade security measures (SOC 2 Type II)" /></ListItem>
              <ListItem><ListItemText primary="Encryption at rest and in transit" /></ListItem>
              <ListItem><ListItemText primary="Regular security audits and penetration testing" /></ListItem>
              <ListItem><ListItemText primary="Incident response and breach notification procedures" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="availability" title="7. Service Availability and Performance">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Level Agreement (SLA)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Metric</strong></TableCell>
                    <TableCell><strong>Standard</strong></TableCell>
                    <TableCell><strong>Enterprise</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Uptime Target</TableCell>
                    <TableCell>99.9% monthly</TableCell>
                    <TableCell>99.95% monthly</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>API Response Time</TableCell>
                    <TableCell>Under 500ms average</TableCell>
                    <TableCell>Under 300ms average</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Support Response</TableCell>
                    <TableCell>Business hours</TableCell>
                    <TableCell>24/7 support</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Section>

      <Section id="limitation" title="8. Disclaimers and Limitation of Liability">
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Service Disclaimers:</strong> The Service is provided "as is" without warranties. Forecasts are predictions, not guarantees. Results may vary based on data quality and market conditions.
          </Typography>
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Limitation of Liability
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Our total liability is limited to amounts paid in the preceding 12 months" /></ListItem>
              <ListItem><ListItemText primary="We are not liable for indirect, incidental, or consequential damages" /></ListItem>
              <ListItem><ListItemText primary="Business decisions based on forecasts are your responsibility" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="termination" title="9. Termination">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Termination by You
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Cancel subscription anytime through your account settings" /></ListItem>
              <ListItem><ListItemText primary="Service continues until end of current billing period" /></ListItem>
              <ListItem><ListItemText primary="Data export available for 30 days after cancellation" /></ListItem>
              <ListItem><ListItemText primary="No refunds for unused portions of subscription" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Termination by OrderNimbus
            </Typography>
            <Typography variant="body1" paragraph>
              We may terminate your account for:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Violation of these Terms" /></ListItem>
              <ListItem><ListItemText primary="Non-payment of fees" /></ListItem>
              <ListItem><ListItemText primary="Fraudulent or illegal activity" /></ListItem>
              <ListItem><ListItemText primary="Prolonged inactivity" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="contact" title="10. Contact Information">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Legal Questions
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Email:</strong> legal@ordernimbus.com
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Phone:</strong> 1-800-ORDER-NB (1-800-673-3762)
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Business Information
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Company: OrderNimbus Inc." /></ListItem>
              <ListItem><ListItemText primary="Registration: Delaware Corporation" /></ListItem>
              <ListItem><ListItemText primary="Support: support@ordernimbus.com" /></ListItem>
              <ListItem><ListItemText primary="Sales: sales@ordernimbus.com" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          We may update these Terms periodically. Material changes require 30 days' advance notice. 
          Continued use constitutes acceptance of new Terms.
        </Typography>
      </Box>
    </Container>
  );
};

export default TermsOfService;