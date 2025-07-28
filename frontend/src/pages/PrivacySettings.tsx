import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  Shield as ShieldIcon,
  Cookie as CookieIcon,
  DataUsage as DataIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { dataAPI } from '../services/api';

interface PrivacyPreferences {
  analytics: boolean;
  marketing: boolean;
  dataProcessing: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  thirdPartySharing: boolean;
}

interface DataExportProgress {
  status: 'idle' | 'generating' | 'ready' | 'expired';
  downloadUrl?: string;
  generatedAt?: string;
  expiresAt?: string;
}

export const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    analytics: false,
    marketing: false,
    dataProcessing: true,
    emailNotifications: true,
    smsNotifications: false,
    thirdPartySharing: false
  });
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [exportProgress, setExportProgress] = useState<DataExportProgress>({ status: 'idle' });
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    loadPrivacyPreferences();
    checkExportStatus();
  }, []);

  const loadPrivacyPreferences = async () => {
    try {
      // Load preferences from backend or localStorage
      const savedPrefs = localStorage.getItem('privacy-preferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error('Error loading privacy preferences:', error);
    }
  };

  const checkExportStatus = async () => {
    try {
      const exportStatus = localStorage.getItem('data-export-status');
      if (exportStatus) {
        const status = JSON.parse(exportStatus);
        const now = new Date();
        const expiresAt = new Date(status.expiresAt);
        
        if (now > expiresAt) {
          setExportProgress({ status: 'expired' });
          localStorage.removeItem('data-export-status');
        } else {
          setExportProgress(status);
        }
      }
    } catch (error) {
      console.error('Error checking export status:', error);
    }
  };

  const handlePreferenceChange = (key: keyof PrivacyPreferences) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPreferences = {
      ...preferences,
      [key]: event.target.checked
    };
    
    setPreferences(newPreferences);
    localStorage.setItem('privacy-preferences', JSON.stringify(newPreferences));
    
    // Show confirmation
    // You could add a snackbar notification here
  };

  const handleRequestDataExport = async () => {
    try {
      setLoading(true);
      setExportProgress({ status: 'generating' });
      
      // Simulate API call for data export
      setTimeout(() => {
        const downloadUrl = '/api/data/export/user-data.zip';
        const generatedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
        
        const exportStatus = {
          status: 'ready' as const,
          downloadUrl,
          generatedAt,
          expiresAt
        };
        
        setExportProgress(exportStatus);
        localStorage.setItem('data-export-status', JSON.stringify(exportStatus));
        setLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error requesting data export:', error);
      setLoading(false);
    }
  };

  const handleDownloadData = () => {
    if (exportProgress.downloadUrl) {
      // In a real implementation, this would trigger the download
      window.open(exportProgress.downloadUrl, '_blank');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      return;
    }
    
    try {
      setLoading(true);
      // Simulate account deletion API call
      setTimeout(() => {
        alert('Account deletion request submitted. You will receive a confirmation email within 24 hours.');
        setShowDeleteDialog(false);
        setDeleteConfirmation('');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Privacy & Data Protection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your privacy settings and exercise your data protection rights under GDPR
        </Typography>
      </Box>

      {/* GDPR Rights Overview */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your GDPR Rights
        </Typography>
        <Typography variant="body2">
          Under the General Data Protection Regulation (GDPR), you have specific rights regarding your personal data. 
          Use the controls below to exercise these rights or contact our Data Protection Officer at dpo@ordernimbus.com.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Privacy Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Privacy Preferences
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={3}>
                Control how your data is processed and used
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.analytics}
                    onChange={handlePreferenceChange('analytics')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2">Analytics & Performance</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Allow us to collect anonymized usage data to improve our service
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.marketing}
                    onChange={handlePreferenceChange('marketing')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2">Marketing Communications</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receive personalized offers and product updates
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.dataProcessing}
                    onChange={handlePreferenceChange('dataProcessing')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2">Advanced Data Processing</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Allow AI model training on aggregated, anonymized data
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={handlePreferenceChange('emailNotifications')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2">Email Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">
                      System updates, security alerts, and account information
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.thirdPartySharing}
                    onChange={handlePreferenceChange('thirdPartySharing')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2">Third-Party Integrations</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Share data with connected e-commerce platforms (Shopify, Amazon)
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Data Rights Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShieldIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Data Rights & Actions
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={3}>
                Exercise your GDPR rights regarding your personal data
              </Typography>

              <List>
                <ListItem
                  button
                  onClick={() => setShowDataDialog(true)}
                  sx={{ borderRadius: 1, mb: 1, backgroundColor: 'grey.50' }}
                >
                  <ListItemIcon>
                    <ViewIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Access Your Data"
                    secondary="View all personal data we have about you"
                  />
                </ListItem>

                <ListItem
                  button
                  onClick={exportProgress.status === 'ready' ? handleDownloadData : handleRequestDataExport}
                  disabled={exportProgress.status === 'generating' || loading}
                  sx={{ borderRadius: 1, mb: 1, backgroundColor: 'grey.50' }}
                >
                  <ListItemIcon>
                    {exportProgress.status === 'generating' ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DownloadIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={exportProgress.status === 'ready' ? 'Download Your Data' : 'Export Your Data'}
                    secondary={
                      exportProgress.status === 'ready' 
                        ? `Ready for download (expires ${new Date(exportProgress.expiresAt!).toLocaleDateString()})`
                        : exportProgress.status === 'generating'
                        ? 'Generating export file...'
                        : 'Download all your data in a portable format'
                    }
                  />
                  {exportProgress.status === 'ready' && (
                    <Chip label="Ready" color="success" size="small" />
                  )}
                </ListItem>

                <ListItem
                  button
                  sx={{ borderRadius: 1, mb: 1, backgroundColor: 'grey.50' }}
                >
                  <ListItemIcon>
                    <HistoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Processing History"
                    secondary="View log of all data processing activities"
                  />
                </ListItem>

                <ListItem
                  button
                  onClick={() => setShowDeleteDialog(true)}
                  sx={{ borderRadius: 1, backgroundColor: 'error.light', color: 'error.contrastText' }}
                >
                  <ListItemIcon>
                    <DeleteIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Delete Account"
                    secondary="Permanently delete your account and all data"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Cookie Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CookieIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cookie Management
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={3}>
                Manage your cookie preferences and tracking settings
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Essential Cookies
                    </Typography>
                    <Chip label="Always On" color="success" size="small" />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Required for basic functionality
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Analytics Cookies
                    </Typography>
                    <Chip 
                      label={preferences.analytics ? "Enabled" : "Disabled"} 
                      color={preferences.analytics ? "success" : "default"} 
                      size="small" 
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Help improve our service
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Marketing Cookies
                    </Typography>
                    <Chip 
                      label={preferences.marketing ? "Enabled" : "Disabled"} 
                      color={preferences.marketing ? "success" : "default"} 
                      size="small" 
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Personalized advertisements
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                startIcon={<CookieIcon />}
                sx={{ mt: 2 }}
                onClick={() => {
                  // Clear all cookies and show consent banner again
                  localStorage.removeItem('cookie-consent');
                  window.location.reload();
                }}
              >
                Reset Cookie Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Protection Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Data Protection Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Controller
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    OrderNimbus Inc.<br />
                    Email: dpo@ordernimbus.com<br />
                    Response time: Within 30 days
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Legal Basis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Contract performance<br />
                    • Legitimate interest<br />
                    • Consent (where applicable)<br />
                    • Legal obligation
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Retention
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Account data: 3 years after closure<br />
                    • Business data: 7 years (tax compliance)<br />
                    • Logs: 2 years<br />
                    • Marketing: Until consent withdrawn
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Access Dialog */}
      <Dialog open={showDataDialog} onClose={() => setShowDataDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Your Personal Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Here's a summary of the personal data we have about you:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText primary="Account Information" secondary={`Name: ${user?.name}, Email: ${user?.email}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Company" secondary={user?.company} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Account Created" secondary="Last 30 days" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Last Login" secondary="Today" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Data Processing Consent" secondary={preferences.dataProcessing ? "Granted" : "Not granted"} />
            </ListItem>
          </List>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            For a complete export of all your data, use the "Export Your Data" feature.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Account Deletion Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              This action cannot be undone
            </Typography>
            <Typography variant="body2">
              Deleting your account will permanently remove all your data, including sales data, forecasts, 
              and account information. This action is irreversible.
            </Typography>
          </Alert>
          
          <Typography variant="body1" paragraph>
            To confirm deletion, type <strong>DELETE MY ACCOUNT</strong> below:
          </Typography>
          
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type confirmation here"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || loading}
          >
            {loading ? 'Processing...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};