import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const PrivacyPolicy: React.FC = () => {
  const theme = useTheme();

  const ComplianceBadges = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
      <Chip label="SOC 2 Type II Compliant" color="primary" variant="outlined" />
      <Chip label="GDPR Compliant" color="primary" variant="outlined" />
      <Chip label="CCPA Compliant" color="primary" variant="outlined" />
      <Chip label="ISO 27001 Certified" color="primary" variant="outlined" />
    </Box>
  );

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
          Privacy Policy
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
        <ComplianceBadges />
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          GDPR Compliance Notice
        </Typography>
        <Typography variant="body1">
          This Privacy Policy complies with the EU General Data Protection Regulation (GDPR) and other applicable data protection laws. 
          We are committed to transparency and protecting your fundamental rights to privacy and data protection.
        </Typography>
      </Alert>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Overview
          </Typography>
          <Typography variant="body1" paragraph>
            OrderNimbus Inc. ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal and business data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our enterprise AI-powered sales forecasting platform and related services.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Data Controller:</strong> OrderNimbus Inc., with registered office at [Address]. 
            For data protection matters, contact our Data Protection Officer at dpo@ordernimbus.com.
          </Typography>
        </CardContent>
      </Card>

      <Section id="information-collection" title="Information We Collect">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Account and Profile Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Contact Details" 
                  secondary="Name, email address, phone number, job title, company name" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Account Credentials" 
                  secondary="Username, encrypted passwords, authentication tokens" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Billing Information" 
                  secondary="Payment method details (processed by PCI-compliant third parties)" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Company Information" 
                  secondary="Business details, industry type, company size" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Business and Sales Data
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Sales Records" 
                  secondary="Transaction history, product information, customer data (anonymized)" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Inventory Data" 
                  secondary="Stock levels, product catalogs, supplier information" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="E-commerce Integration Data" 
                  secondary="Platform connections (Shopify, Amazon, etc.)" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Forecast Data" 
                  secondary="Predictions, analytics results, model outputs" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Technical Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Usage Data" 
                  secondary="Feature usage, session duration, click patterns" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Device Information" 
                  secondary="IP address, browser type, operating system" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Performance Data" 
                  secondary="API response times, error logs, system metrics" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Security Logs" 
                  secondary="Login attempts, access patterns, security events" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="data-usage" title="How We Use Your Data">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Provision
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Generate AI-powered sales forecasts and inventory predictions" /></ListItem>
              <ListItem><ListItemText primary="Provide real-time analytics and business insights" /></ListItem>
              <ListItem><ListItemText primary="Integrate with your existing e-commerce platforms" /></ListItem>
              <ListItem><ListItemText primary="Deliver automated reports and alerts" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Platform Improvement
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Enhance AI model accuracy through aggregated, anonymized data" /></ListItem>
              <ListItem><ListItemText primary="Improve user experience and platform performance" /></ListItem>
              <ListItem><ListItemText primary="Develop new features and capabilities" /></ListItem>
              <ListItem><ListItemText primary="Conduct security monitoring and threat detection" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="data-sharing" title="Data Sharing and Disclosure">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              We Do NOT Sell Your Data
            </Typography>
            <Typography variant="body1">
              OrderNimbus does not sell, rent, or trade your personal or business data to third parties for marketing purposes.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Processing Partners
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Service</strong></TableCell>
                    <TableCell><strong>Provider</strong></TableCell>
                    <TableCell><strong>Compliance</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Cloud Infrastructure</TableCell>
                    <TableCell>AWS</TableCell>
                    <TableCell>SOC 2 compliant data centers</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Payment Processing</TableCell>
                    <TableCell>Stripe</TableCell>
                    <TableCell>PCI DSS Level 1 certified</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Customer Support</TableCell>
                    <TableCell>Zendesk</TableCell>
                    <TableCell>GDPR compliant</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Analytics</TableCell>
                    <TableCell>Internal systems only</TableCell>
                    <TableCell>No third-party analytics</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Section>

      <Section id="data-security" title="Data Security">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Enterprise-Grade Security
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Encryption: AES-256 encryption at rest, TLS 1.3 in transit" /></ListItem>
              <ListItem><ListItemText primary="Access Controls: Role-based access with multi-factor authentication" /></ListItem>
              <ListItem><ListItemText primary="Network Security: VPC isolation, WAF protection, DDoS mitigation" /></ListItem>
              <ListItem><ListItemText primary="Monitoring: 24/7 security monitoring and incident response" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Breach Response
            </Typography>
            <Typography variant="body1" paragraph>
              In the unlikely event of a data breach, we will:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Contain and investigate the incident within 24 hours" /></ListItem>
              <ListItem><ListItemText primary="Notify affected customers within 72 hours" /></ListItem>
              <ListItem><ListItemText primary="Report to relevant authorities as required by law" /></ListItem>
              <ListItem><ListItemText primary="Provide detailed incident reports and remediation steps" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="your-rights" title="Your Rights and Choices">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Subject Rights (GDPR)
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Access: Request a copy of your personal data" /></ListItem>
              <ListItem><ListItemText primary="Rectification: Correct inaccurate or incomplete data" /></ListItem>
              <ListItem><ListItemText primary="Erasure: Request deletion of your personal data" /></ListItem>
              <ListItem><ListItemText primary="Restriction: Limit processing of your data" /></ListItem>
              <ListItem><ListItemText primary="Portability: Receive your data in a machine-readable format" /></ListItem>
              <ListItem><ListItemText primary="Objection: Object to processing based on legitimate interests" /></ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Exercising Your Rights
            </Typography>
            <Typography variant="body1" paragraph>
              To exercise your rights, contact us at:
            </Typography>
            <List dense>
              <ListItem><ListItemText primary="Email: privacy@ordernimbus.com" /></ListItem>
              <ListItem><ListItemText primary="Phone: 1-800-ORDER-NB (1-800-673-3762)" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Section>

      <Section id="contact" title="Contact Information">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Privacy Inquiries
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Data Protection Officer:</strong> privacy@ordernimbus.com
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>General Privacy Questions:</strong> support@ordernimbus.com
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Phone:</strong> 1-800-ORDER-NB (1-800-673-3762)
            </Typography>
          </CardContent>
        </Card>
      </Section>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          We may update this Privacy Policy periodically. We will notify you of material changes via email or platform notification.
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;