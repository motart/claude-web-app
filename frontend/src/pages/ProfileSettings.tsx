import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CreditCard as CreditCardIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteCardOpen, setDeleteCardOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
    setDeleteCardOpen(true);
  };

  const confirmDeleteCard = () => {
    // Handle card deletion logic here
    setDeleteCardOpen(false);
    setCardToDelete(null);
  };

  // Mock data for demonstration
  const plans = [
    {
      name: 'Starter',
      price: 29,
      features: ['Up to 1,000 orders/month', 'Basic forecasting', 'Email support'],
      current: false,
      popular: false
    },
    {
      name: 'Professional',
      price: 99,
      features: ['Up to 10,000 orders/month', 'Advanced AI forecasting', 'Priority support', 'Custom integrations'],
      current: true,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 299,
      features: ['Unlimited orders', 'Real-time analytics', '24/7 dedicated support', 'White-label options'],
      current: false,
      popular: false
    }
  ];

  const paymentMethods = [
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 25,
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 26,
      isDefault: false
    }
  ];

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const tabs = [
    { label: 'Account', icon: <PersonIcon /> },
    { label: 'Billing & Plans', icon: <BusinessIcon /> },
    { label: 'Payment Methods', icon: <PaymentIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account, billing, and preferences
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 72,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                }
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                label={tab.label} 
                icon={tab.icon}
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Account Settings Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          width: 32,
                          height: 32,
                          '&:hover': { bgcolor: theme.palette.primary.dark }
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '3rem',
                        fontWeight: 600
                      }}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </Badge>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {user?.email}
                  </Typography>
                  <Chip 
                    label={user?.role} 
                    color="primary" 
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box component="form" sx={{ '& > :not(style)': { mb: 3 } }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        defaultValue={user?.name}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        defaultValue={user?.email}
                        variant="outlined"
                        type="email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company"
                        defaultValue={user?.company}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={4}
                        placeholder="Tell us about yourself..."
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon /> Security Settings
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button variant="contained" size="large">
                      Save Changes
                    </Button>
                    <Button variant="outlined" size="large">
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Billing & Plans Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Current Plan
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                You're currently on the <strong>Professional Plan</strong>. Your next billing date is March 15, 2024.
              </Alert>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Available Plans
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {plans.map((plan, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      position: 'relative',
                      border: plan.current ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                      transform: plan.current ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: plan.current ? 'scale(1.02)' : 'scale(1.02)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    {plan.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -1,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: theme.palette.secondary.main,
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: '0 0 8px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        MOST POPULAR
                      </Box>
                    )}
                    
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {plan.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 2 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                          ${plan.price}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                          /month
                        </Typography>
                      </Box>
                      
                      <List sx={{ mb: 3 }}>
                        {plan.features.map((feature, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature} 
                              primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Button
                        variant={plan.current ? "outlined" : "contained"}
                        fullWidth
                        size="large"
                        disabled={plan.current}
                        sx={{ mt: 2 }}
                      >
                        {plan.current ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Usage This Month
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Orders Processed
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      7,234
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / 10,000
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={72} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    API Calls
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      45,678
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / 100,000
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={45} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Grid>
              </Grid>
            </Card>
          </Box>
        </TabPanel>

        {/* Payment Methods Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payment Methods
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddCardOpen(true)}
              >
                Add Card
              </Button>
            </Box>

            <Grid container spacing={3}>
              {paymentMethods.map((card) => (
                <Grid item xs={12} sm={6} key={card.id}>
                  <Card 
                    sx={{ 
                      p: 3,
                      border: card.isDefault ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                      position: 'relative'
                    }}
                  >
                    {card.isDefault && (
                      <Chip
                        label="Default"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                      />
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ fontSize: '2rem' }}>
                        {getCardIcon(card.type)}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {card.type} •••• {card.last4}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!card.isDefault && (
                        <Button variant="outlined" size="small">
                          Make Default
                        </Button>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteCard(card.id)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Billing History
              </Typography>
              <List>
                {[
                  { date: 'Feb 15, 2024', amount: '$99.00', status: 'Paid', invoice: 'INV-2024-002' },
                  { date: 'Jan 15, 2024', amount: '$99.00', status: 'Paid', invoice: 'INV-2024-001' },
                  { date: 'Dec 15, 2023', amount: '$99.00', status: 'Paid', invoice: 'INV-2023-012' },
                ].map((invoice, index) => (
                  <ListItem key={index} divider={index < 2}>
                    <ListItemText
                      primary={`Invoice ${invoice.invoice}`}
                      secondary={invoice.date}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={invoice.status} 
                        color="success" 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 80 }}>
                        {invoice.amount}
                      </Typography>
                      <Button variant="text" size="small">
                        Download
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Notification Preferences
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Email Notifications
                  </Typography>
                  <List>
                    {[
                      { label: 'Order Updates', description: 'Get notified about new orders and status changes', enabled: true },
                      { label: 'Forecast Alerts', description: 'Receive AI-generated forecast insights', enabled: true },
                      { label: 'Billing Notifications', description: 'Payment receipts and billing reminders', enabled: true },
                      { label: 'Product Updates', description: 'New features and platform updates', enabled: false },
                      { label: 'Marketing Emails', description: 'Tips, case studies, and newsletters', enabled: false },
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={item.label}
                          secondary={item.description}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={item.enabled}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Push Notifications
                  </Typography>
                  <List>
                    {[
                      { label: 'Real-time Alerts', description: 'Instant notifications for critical events', enabled: true },
                      { label: 'Daily Summary', description: 'Daily digest of your store performance', enabled: true },
                      { label: 'Low Stock Alerts', description: 'Get notified when inventory is running low', enabled: true },
                      { label: 'Integration Errors', description: 'Alerts for connector or sync issues', enabled: true },
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={item.label}
                          secondary={item.description}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={item.enabled}
                            color="primary"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Notification Schedule
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Quiet Hours (10 PM - 8 AM)"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Disable non-urgent notifications during these hours
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Weekend Notifications"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Receive notifications on weekends
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Button variant="contained" size="large">
                Save Preferences
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Delete Card Dialog */}
      <Dialog open={deleteCardOpen} onClose={() => setDeleteCardOpen(false)}>
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this payment method? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCardOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteCard} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={addCardOpen} onClose={() => setAddCardOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ '& > :not(style)': { mb: 2 } }}>
            <TextField
              fullWidth
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              variant="outlined"
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Cardholder Name"
              placeholder="John Doe"
              variant="outlined"
            />
            <FormControlLabel
              control={<Switch />}
              label="Make this my default payment method"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCardOpen(false)}>Cancel</Button>
          <Button variant="contained">Add Card</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};