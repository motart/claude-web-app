import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Badge,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Code as ApiIcon,
  Receipt as BillingIcon,
  Group as TeamIcon,
  PhotoCamera as CameraIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Autorenew as AutorenewIcon,
  CloudUpload as CloudUploadIcon,
  CreditCard as CreditCardIcon,
  Logout as LogoutIcon
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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const Settings: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [avatarUploadDialog, setAvatarUploadDialog] = useState(false);
  
  // Form states
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    company: user?.company || '',
    role: user?.role || 'admin',
    location: 'San Francisco, CA',
    bio: 'Retail analytics enthusiast helping businesses make data-driven decisions.'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    browserNotifications: true,
    dailyDigest: true,
    weeklyReport: true,
    alertThreshold: 20,
    forecastAlerts: true,
    inventoryAlerts: true,
    salesAlerts: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    primaryColor: '#2563eb',
    fontSize: 'medium',
    compactMode: false,
    showAnimations: true
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileSave = () => {
    // Save profile logic here
    setIsEditing(false);
  };

  const renderProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                      onClick={() => setAvatarUploadDialog(true)}
                    >
                      <CameraIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: '2.5rem',
                      bgcolor: theme.palette.primary.main
                    }}
                  >
                    {profile.name.charAt(0)}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {profile.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {profile.role} at {profile.company}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip size="small" icon={<LocationIcon />} label={profile.location} />
                    <Chip size="small" icon={<EmailIcon />} label={profile.email} />
                  </Box>
                </Box>
              </Box>
              <Button
                variant={isEditing ? "contained" : "outlined"}
                startIcon={isEditing ? <CheckIcon /> : <EditIcon />}
                onClick={isEditing ? handleProfileSave : () => setIsEditing(true)}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  disabled={!isEditing}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={!isEditing}
                  sx={{ mb: 3 }}
                />
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="analyst">Analyst</MenuItem>
                    <MenuItem value="viewer">Viewer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Notification Channels
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive alerts and updates via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="SMS Alerts"
                  secondary="Get critical alerts via text message"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.smsAlerts}
                    onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Browser Notifications"
                  secondary="Show desktop notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.browserNotifications}
                    onChange={(e) => setNotifications({ ...notifications, browserNotifications: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Alert Threshold
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Notify me when inventory changes by more than:
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={notifications.alertThreshold}
                onChange={(e, value) => setNotifications({ ...notifications, alertThreshold: value as number })}
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `${value}%`}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Email Preferences
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Daily Digest"
                  secondary="Summary of your daily metrics"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.dailyDigest}
                    onChange={(e) => setNotifications({ ...notifications, dailyDigest: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Weekly Reports"
                  secondary="Comprehensive weekly analytics"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.weeklyReport}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Alert Types
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={notifications.forecastAlerts}
                  onChange={(e) => setNotifications({ ...notifications, forecastAlerts: e.target.checked })}
                />
              }
              label="Forecast accuracy alerts"
              sx={{ display: 'block', mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={notifications.inventoryAlerts}
                  onChange={(e) => setNotifications({ ...notifications, inventoryAlerts: e.target.checked })}
                />
              }
              label="Low inventory warnings"
              sx={{ display: 'block', mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={notifications.salesAlerts}
                  onChange={(e) => setNotifications({ ...notifications, salesAlerts: e.target.checked })}
                />
              }
              label="Sales anomaly detection"
              sx={{ display: 'block' }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSecurityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Password & Authentication
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              startIcon={<SecurityIcon />}
            >
              Change Password
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              startIcon={<SecurityIcon />}
            >
              Enable Two-Factor Authentication
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
            >
              Sign Out All Devices
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              API Access
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  API Key
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton size="small">
                    <CopyIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {showApiKey ? 'sk-proj-abc123xyz789...' : '••••••••••••••••'}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AutorenewIcon />}
            >
              Regenerate API Key
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Activity
            </Typography>
            <List dense>
              {[
                { action: 'Login from Chrome on macOS', time: '2 hours ago', location: 'San Francisco, CA' },
                { action: 'API key accessed', time: '1 day ago', location: 'API Request' },
                { action: 'Password changed', time: '5 days ago', location: 'San Francisco, CA' },
                { action: 'New device login', time: '1 week ago', location: 'New York, NY' }
              ].map((activity, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={activity.action}
                    secondary={`${activity.time} • ${activity.location}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAppearanceTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Theme Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Interface Theme
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper
                  sx={{
                    p: 3,
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: appearance.theme === 'light' ? 2 : 1,
                    borderColor: appearance.theme === 'light' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                >
                  <LightModeIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>Light</Typography>
                </Paper>
                <Paper
                  sx={{
                    p: 3,
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: appearance.theme === 'dark' ? 2 : 1,
                    borderColor: appearance.theme === 'dark' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                >
                  <DarkModeIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>Dark</Typography>
                </Paper>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Accent Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {['#2563eb', '#7c3aed', '#dc2626', '#16a34a', '#ea580c', '#0891b2'].map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: appearance.primaryColor === color ? 3 : 0,
                    borderColor: 'common.white',
                    boxShadow: appearance.primaryColor === color ? 3 : 0,
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                  onClick={() => setAppearance({ ...appearance, primaryColor: color })}
                />
              ))}
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Font Size</InputLabel>
              <Select
                value={appearance.fontSize}
                onChange={(e) => setAppearance({ ...appearance, fontSize: e.target.value })}
                label="Font Size"
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={appearance.compactMode}
                  onChange={(e) => setAppearance({ ...appearance, compactMode: e.target.checked })}
                />
              }
              label="Compact Mode"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Reduce spacing and make interface more dense
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={appearance.showAnimations}
                  onChange={(e) => setAppearance({ ...appearance, showAnimations: e.target.checked })}
                />
              }
              label="Show Animations"
            />
            <Typography variant="body2" color="text.secondary">
              Enable smooth transitions and animations
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Preview
            </Typography>
            <Paper
              sx={{
                p: 3,
                bgcolor: appearance.theme === 'dark' ? 'grey.900' : 'grey.50',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Dashboard Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is how your interface will look
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: appearance.primaryColor,
                    color: 'white'
                  }}>
                    <Typography variant="h4">$125K</Typography>
                    <Typography variant="body2">Total Revenue</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h4">450</Typography>
                    <Typography variant="body2">Orders</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBillingTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          You're currently on the <strong>Professional Plan</strong> with 14 days remaining in your trial.
        </Alert>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Current Plan
            </Typography>
            <Box sx={{ 
              p: 3, 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              mb: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Professional Plan
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    $99/month • Billed monthly
                  </Typography>
                </Box>
                <Chip label="Active" color="success" />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Next billing date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>December 15, 2024</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Monthly usage</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>2,450 / 10,000 orders</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Button variant="outlined" sx={{ mr: 2 }}>
              Change Plan
            </Button>
            <Button variant="outlined" color="error">
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Billing History
            </Typography>
            <List>
              {[
                { date: 'Nov 15, 2024', amount: '$99.00', status: 'Paid', invoice: '#INV-2024-11' },
                { date: 'Oct 15, 2024', amount: '$99.00', status: 'Paid', invoice: '#INV-2024-10' },
                { date: 'Sep 15, 2024', amount: '$99.00', status: 'Paid', invoice: '#INV-2024-09' }
              ].map((invoice, index) => (
                <ListItem key={index} divider={index < 2}>
                  <ListItemText
                    primary={invoice.date}
                    secondary={invoice.invoice}
                  />
                  <Box sx={{ textAlign: 'right', mr: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {invoice.amount}
                    </Typography>
                    <Chip label={invoice.status} size="small" color="success" />
                  </Box>
                  <ListItemSecondaryAction>
                    <Button size="small">Download</Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Payment Method
            </Typography>
            <Box sx={{ 
              p: 2, 
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CreditCardIcon />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      •••• 4242
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires 12/25
                    </Typography>
                  </Box>
                </Box>
                <Chip label="Default" size="small" />
              </Box>
            </Box>
            <Button fullWidth variant="outlined">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTeamTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Team Members
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Invite Member
              </Button>
            </Box>
            
            <List>
              {[
                { name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'Active' },
                { name: 'Jane Smith', email: 'jane@company.com', role: 'Manager', status: 'Active' },
                { name: 'Mike Johnson', email: 'mike@company.com', role: 'Analyst', status: 'Pending' }
              ].map((member, index) => (
                <ListItem key={index} divider={index < 2}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {member.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={member.name}
                    secondary={member.email}
                  />
                  <Box sx={{ mr: 4 }}>
                    <FormControl size="small">
                      <Select value={member.role}>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Manager">Manager</MenuItem>
                        <MenuItem value="Analyst">Analyst</MenuItem>
                        <MenuItem value="Viewer">Viewer</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Chip 
                    label={member.status} 
                    size="small" 
                    color={member.status === 'Active' ? 'success' : 'warning'}
                    sx={{ mr: 2 }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const tabs = [
    { label: 'Profile', icon: <PersonIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
    { label: 'Security', icon: <SecurityIcon /> },
    { label: 'Appearance', icon: <PaletteIcon /> },
    { label: 'Billing', icon: <BillingIcon /> },
    { label: 'Team', icon: <TeamIcon /> }
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account preferences and configurations
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        {renderProfileTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderNotificationsTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderSecurityTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        {renderAppearanceTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        {renderBillingTab()}
      </TabPanel>
      <TabPanel value={activeTab} index={5}>
        {renderTeamTab()}
      </TabPanel>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarUploadDialog} onClose={() => setAvatarUploadDialog(false)}>
        <DialogTitle>Upload Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Drag and drop an image here, or click to select
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarUploadDialog(false)}>Cancel</Button>
          <Button variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};