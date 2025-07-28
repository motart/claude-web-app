import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  Link,
  Alert,
  Chip
} from '@mui/material';
import { Settings as SettingsIcon, Security as SecurityIcon } from '@mui/icons-material';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Initialize analytics and other services
    initializeServices(allAccepted);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    
    // Initialize only essential services
    initializeServices(essentialOnly);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
    
    // Initialize services based on preferences
    initializeServices(preferences);
  };

  const initializeServices = (prefs: CookiePreferences) => {
    // Initialize analytics if enabled
    if (prefs.analytics) {
      // Enable analytics tracking
      console.log('Analytics tracking enabled');
    }

    // Initialize marketing if enabled
    if (prefs.marketing) {
      // Enable marketing cookies
      console.log('Marketing cookies enabled');
    }

    // Initialize preferences if enabled
    if (prefs.preferences) {
      // Enable preference cookies
      console.log('Preference cookies enabled');
    }
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: event.target.checked
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          zIndex: 9999,
          p: 3,
          mx: 'auto',
          maxWidth: 800,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            We Value Your Privacy
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content. 
          Essential cookies are required for the website to function properly.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label="GDPR Compliant" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          <Chip label="Essential Only by Default" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>

        <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Button
              variant="contained"
              onClick={handleAcceptAll}
              sx={{ 
                backgroundColor: 'white', 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'grey.100' }
              }}
            >
              Accept All
            </Button>
            <Button
              variant="outlined"
              onClick={handleRejectAll}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'grey.300', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Essential Only
            </Button>
            <Button
              variant="text"
              onClick={handleCustomize}
              startIcon={<SettingsIcon />}
              sx={{ color: 'white' }}
            >
              Customize
            </Button>
          </Box>
          
          <Link 
            href="/privacy-policy" 
            target="_blank"
            sx={{ color: 'white', textDecoration: 'underline' }}
          >
            Privacy Policy
          </Link>
        </Box>
      </Paper>

      {/* Cookie Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Cookie Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your cookie settings and data processing preferences
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Your Data Rights:</strong> Under GDPR, you have the right to control how your data is processed. 
              You can change these settings at any time in your Privacy Settings.
            </Typography>
          </Alert>

          {/* Essential Cookies */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.essential}
                  disabled
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Essential Cookies (Required)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    These cookies are necessary for the website to function and cannot be disabled. 
                    They include authentication, security, and basic functionality.
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label="Authentication" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Security" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Session Management" size="small" variant="outlined" />
                  </Box>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mb: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Analytics Cookies */}
          <Box sx={{ mb: 3 }}>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Analytics Cookies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Help us understand how visitors interact with our website by collecting and reporting 
                    information anonymously. This helps us improve our service.
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label="Usage Analytics" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Performance Monitoring" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Error Tracking" size="small" variant="outlined" />
                  </Box>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mb: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Marketing Cookies */}
          <Box sx={{ mb: 3 }}>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Marketing Cookies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Used to deliver personalized advertisements and measure their effectiveness. 
                    These cookies track your activity across websites.
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label="Personalized Ads" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Campaign Tracking" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Social Media Integration" size="small" variant="outlined" />
                  </Box>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mb: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Preference Cookies */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.preferences}
                  onChange={handlePreferenceChange('preferences')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Preference Cookies
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remember your preferences and settings to provide a more personalized experience 
                    when you return to our website.
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label="UI Preferences" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Language Settings" size="small" variant="outlined" sx={{ mr: 1 }} />
                    <Chip label="Dashboard Layout" size="small" variant="outlined" />
                  </Box>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Data Protection:</strong> All data processing is conducted in accordance with GDPR. 
              You can withdraw consent at any time through your account settings or by contacting us.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setShowSettings(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustom}
            variant="contained"
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};