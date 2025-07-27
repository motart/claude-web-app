import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  Container,
  Divider,
  Switch
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  CreditCard as CreditCardIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as CloudUploadIcon,
  Storefront as StorefrontIcon,
  LocationOn as LocationOnIcon,
  Language as LanguageIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  popular?: boolean;
  description: string;
  features: PlanFeature[];
  limits: {
    orders: string;
    stores: string;
    users: string;
  };
}

interface Store {
  id: string;
  name: string;
  type: 'online' | 'physical';
  platform?: string;
  address?: string;
  url?: string;
}

const steps = [
  { label: 'Choose Your Plan', icon: <StarIcon /> },
  { label: 'Payment Setup', icon: <CreditCardIcon /> },
  { label: 'Connect Your Stores', icon: <StoreIcon /> },
  { label: 'Welcome to OrderNimbus', icon: <CheckIcon /> }
];

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for small businesses just getting started',
    features: [
      { text: 'Up to 1,000 orders/month', included: true },
      { text: 'Basic inventory forecasting', included: true },
      { text: '1 store connection', included: true },
      { text: 'Email support', included: true },
      { text: 'Basic reporting', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom integrations', included: false },
      { text: 'Priority support', included: false }
    ],
    limits: {
      orders: '1,000',
      stores: '1',
      users: '2'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    period: 'month',
    popular: true,
    description: 'Ideal for growing businesses with multiple sales channels',
    features: [
      { text: 'Up to 10,000 orders/month', included: true },
      { text: 'Advanced AI forecasting', included: true },
      { text: 'Up to 5 store connections', included: true },
      { text: 'Priority email & chat support', included: true },
      { text: 'Advanced reporting & analytics', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'API access', included: true },
      { text: 'Demand planning tools', included: false }
    ],
    limits: {
      orders: '10,000',
      stores: '5',
      users: '5'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'For large-scale operations with complex requirements',
    features: [
      { text: 'Unlimited orders', included: true },
      { text: 'Enterprise AI forecasting', included: true },
      { text: 'Unlimited store connections', included: true },
      { text: '24/7 dedicated support', included: true },
      { text: 'Advanced analytics & reporting', included: true },
      { text: 'Custom integrations & API', included: true },
      { text: 'Demand planning tools', included: true },
      { text: 'White-label options', included: true }
    ],
    limits: {
      orders: 'Unlimited',
      stores: 'Unlimited',
      users: 'Unlimited'
    }
  }
];

const platformOptions = [
  { id: 'shopify', name: 'Shopify', icon: '🛍️' },
  { id: 'amazon', name: 'Amazon', icon: '📦' },
  { id: 'ebay', name: 'eBay', icon: '🔨' },
  { id: 'etsy', name: 'Etsy', icon: '🎨' },
  { id: 'woocommerce', name: 'WooCommerce', icon: '🔧' },
  { id: 'magento', name: 'Magento', icon: '🏪' },
  { id: 'bigcommerce', name: 'BigCommerce', icon: '🛒' },
  { id: 'square', name: 'Square', icon: '⬜' },
  { id: 'other', name: 'Other', icon: '➕' }
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [stores, setStores] = useState<Store[]>([]);
  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    type: 'online' as 'online' | 'physical',
    platform: '',
    address: '',
    url: ''
  });
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    billingAddress: ''
  });

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const actualPrice = billingPeriod === 'yearly' 
    ? Math.round((selectedPlanData?.price || 0) * 10) 
    : selectedPlanData?.price || 0;
  const savings = billingPeriod === 'yearly' 
    ? Math.round((selectedPlanData?.price || 0) * 2)
    : 0;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddStore = () => {
    if (newStore.name) {
      const store: Store = {
        id: Date.now().toString(),
        name: newStore.name,
        type: newStore.type,
        platform: newStore.platform,
        address: newStore.address,
        url: newStore.url
      };
      setStores([...stores, store]);
      setNewStore({
        name: '',
        type: 'online',
        platform: '',
        address: '',
        url: ''
      });
      setAddStoreOpen(false);
    }
  };

  const handleRemoveStore = (storeId: string) => {
    setStores(stores.filter(s => s.id !== storeId));
  };

  const handleFinishOnboarding = () => {
    // Here you would typically:
    // 1. Create subscription with selected plan
    // 2. Process payment
    // 3. Set up store connections
    // 4. Update user profile
    navigate('/dashboard');
  };

  const renderPlanSelection = () => (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Choose Your Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select the plan that best fits your business needs. You can upgrade or downgrade anytime.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Paper sx={{ p: 1, display: 'flex', borderRadius: 3 }}>
            <Button
              variant={billingPeriod === 'monthly' ? 'contained' : 'text'}
              onClick={() => setBillingPeriod('monthly')}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'yearly' ? 'contained' : 'text'}
              onClick={() => setBillingPeriod('yearly')}
              sx={{ borderRadius: 2, px: 3, position: 'relative' }}
            >
              Yearly
              <Chip
                label="Save 20%"
                color="success"
                size="small"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </Button>
          </Paper>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const yearlyPrice = Math.round(plan.price * 10);
          const displayPrice = billingPeriod === 'yearly' ? yearlyPrice : plan.price;
          
          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  border: isSelected 
                    ? `3px solid ${theme.palette.primary.main}` 
                    : `2px solid ${theme.palette.divider}`,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => setSelectedPlan(plan.id)}
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
                      px: 3,
                      py: 0.5,
                      borderRadius: '0 0 12px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    MOST POPULAR
                  </Box>
                )}
                
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {plan.description}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        ${displayPrice}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </Typography>
                    </Box>
                    {billingPeriod === 'yearly' && (
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                        Save ${Math.round(plan.price * 2)}/year
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ textAlign: 'left', mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Key Limits:
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={12}>
                        <Typography variant="body2">📦 {plan.limits.orders} orders/month</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2">🏪 {plan.limits.stores} store{plan.limits.stores !== '1' ? 's' : ''}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2">👥 {plan.limits.users} team member{plan.limits.users !== '1' ? 's' : ''}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <List dense sx={{ textAlign: 'left' }}>
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                          {feature.included ? (
                            <CheckIcon color="success" fontSize="small" />
                          ) : (
                            <CancelIcon color="disabled" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature.text}
                          primaryTypographyProps={{ 
                            fontSize: '0.875rem',
                            color: feature.included ? 'text.primary' : 'text.disabled'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          🎉 Start with a <strong>14-day free trial</strong> on any plan. No credit card required to begin!
        </Alert>
        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          sx={{ px: 4, py: 1.5 }}
        >
          Continue with {selectedPlanData?.name} Plan
        </Button>
      </Box>
    </Box>
  );

  const renderPaymentSetup = () => (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Payment Setup
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Secure payment processing powered by Stripe
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SecurityIcon color="success" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payment Information
              </Typography>
              <Chip label="SSL Secured" color="success" size="small" />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={paymentMethod.cardNumber}
                  onChange={(e) => setPaymentMethod({...paymentMethod, cardNumber: e.target.value})}
                  InputProps={{
                    endAdornment: <CreditCardIcon color="action" />
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={paymentMethod.expiryDate}
                  onChange={(e) => setPaymentMethod({...paymentMethod, expiryDate: e.target.value})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  value={paymentMethod.cvv}
                  onChange={(e) => setPaymentMethod({...paymentMethod, cvv: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  placeholder="John Doe"
                  value={paymentMethod.name}
                  onChange={(e) => setPaymentMethod({...paymentMethod, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Billing Address"
                  placeholder="123 Main St, City, State 12345"
                  multiline
                  rows={2}
                  value={paymentMethod.billingAddress}
                  onChange={(e) => setPaymentMethod({...paymentMethod, billingAddress: e.target.value})}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">{selectedPlanData?.name} Plan</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ${actualPrice}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Billed {billingPeriod}
              </Typography>
              
              {billingPeriod === 'yearly' && savings > 0 && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'success.main', borderRadius: 1 }}>
                  <Typography variant="body2" color="white" sx={{ fontWeight: 600 }}>
                    💰 You save ${savings} per year!
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                ${actualPrice}
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>14-day free trial</strong><br />
              You won't be charged until your trial ends.
            </Alert>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              Cancel anytime. No hidden fees.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          sx={{ px: 4 }}
        >
          Start Free Trial
        </Button>
      </Box>
    </Box>
  );

  const renderStoreConnection = () => (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Connect Your Stores
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add your online and physical stores to start tracking inventory and sales
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Your Stores ({stores.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddStoreOpen(true)}
        >
          Add Store
        </Button>
      </Box>

      {stores.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <StorefrontIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            No stores connected yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Connect your first store to start using OrderNimbus
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddStoreOpen(true)}
          >
            Add Your First Store
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {stores.map((store) => (
            <Grid item xs={12} sm={6} key={store.id}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '1.5rem'
                    }}>
                      {store.type === 'online' ? '🌐' : '🏪'}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {store.name}
                      </Typography>
                      <Chip 
                        label={store.type === 'online' ? 'Online Store' : 'Physical Store'}
                        size="small"
                        color={store.type === 'online' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => handleRemoveStore(store.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {store.platform && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Platform: {platformOptions.find(p => p.id === store.platform)?.name}
                  </Typography>
                )}
                {store.url && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    URL: {store.url}
                  </Typography>
                )}
                {store.address && (
                  <Typography variant="body2" color="text.secondary">
                    Address: {store.address}
                  </Typography>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          sx={{ px: 4 }}
        >
          {stores.length > 0 ? 'Continue to Dashboard' : 'Skip for Now'}
        </Button>
      </Box>

      {/* Add Store Dialog */}
      <Dialog open={addStoreOpen} onClose={() => setAddStoreOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Store</DialogTitle>
        <DialogContent>
          <Box sx={{ '& > :not(style)': { mb: 2 } }}>
            <TextField
              fullWidth
              label="Store Name"
              placeholder="My Awesome Store"
              value={newStore.name}
              onChange={(e) => setNewStore({...newStore, name: e.target.value})}
              margin="normal"
            />

            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Store Type</FormLabel>
              <RadioGroup
                value={newStore.type}
                onChange={(e) => setNewStore({...newStore, type: e.target.value as 'online' | 'physical'})}
                row
              >
                <FormControlLabel value="online" control={<Radio />} label="Online Store" />
                <FormControlLabel value="physical" control={<Radio />} label="Physical Store" />
              </RadioGroup>
            </FormControl>

            {newStore.type === 'online' && (
              <>
                <FormControl fullWidth margin="normal">
                  <FormLabel>Platform</FormLabel>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {platformOptions.map((platform) => (
                      <Grid item xs={4} key={platform.id}>
                        <Card
                          sx={{
                            p: 1,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: newStore.platform === platform.id 
                              ? `2px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': { borderColor: theme.palette.primary.main }
                          }}
                          onClick={() => setNewStore({...newStore, platform: platform.id})}
                        >
                          <Typography variant="h4">{platform.icon}</Typography>
                          <Typography variant="caption">{platform.name}</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </FormControl>

                <TextField
                  fullWidth
                  label="Store URL"
                  placeholder="https://mystore.com"
                  value={newStore.url}
                  onChange={(e) => setNewStore({...newStore, url: e.target.value})}
                />
              </>
            )}

            {newStore.type === 'physical' && (
              <TextField
                fullWidth
                label="Store Address"
                placeholder="123 Main St, City, State 12345"
                multiline
                rows={3}
                value={newStore.address}
                onChange={(e) => setNewStore({...newStore, address: e.target.value})}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStoreOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStore} variant="contained">Add Store</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderWelcome = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          🎉 Welcome to OrderNimbus!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          You're all set up and ready to optimize your inventory management
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              AI Forecasting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Get intelligent predictions for your inventory needs
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Advanced Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track performance across all your sales channels
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Easy Integration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect with all your favorite sales platforms
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="success" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        Your 14-day free trial has started! Explore all features without any limitations.
      </Alert>

      <Button
        variant="contained"
        size="large"
        onClick={handleFinishOnboarding}
        sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPlanSelection();
      case 1:
        return renderPaymentSetup();
      case 2:
        return renderStoreConnection();
      case 3:
        return renderWelcome();
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Paper 
          elevation={24} 
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Let's Get You Set Up
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Welcome {user?.name?.split(' ')[0]}! Let's configure your OrderNimbus account.
            </Typography>
          </Box>

          {/* Progress Stepper */}
          <Box sx={{ p: 4, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel 
                    StepIconComponent={({ active, completed }) => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: completed || active ? 'primary.main' : 'grey.300',
                          color: completed || active ? 'white' : 'grey.600',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        {completed ? <CheckIcon /> : step.icon}
                      </Box>
                    )}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {getStepContent(activeStep)}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};