import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
  Badge,
  Tooltip,
  Paper,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DataObject as DataIcon,
  TrendingUp as ForecastIcon,
  Link as ConnectorIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  OpenInNew as OpenInNewIcon,
  TrendingUp,
  Analytics,
  CloudUpload,
  Person as PersonIcon,
  Support as SupportIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { Chatbot } from './Chatbot';
import { GlobalSearch } from './GlobalSearch';

const drawerWidth = 280;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard',
    description: 'Overview & Analytics',
    badge: null
  },
  { 
    text: 'Data Ingestion', 
    icon: <CloudUpload />, 
    path: '/data',
    description: 'Import & Manage Data',
    badge: null
  },
  { 
    text: 'Forecasting', 
    icon: <Analytics />, 
    path: '/forecasting',
    description: 'AI Predictions',
    badge: 'AI'
  },
  { 
    text: 'Connectors', 
    icon: <ConnectorIcon />, 
    path: '/connectors',
    description: 'Platform Integrations',
    badge: null
  },
  { 
    text: 'Customer Service', 
    icon: <SupportIcon />, 
    path: '/customer-service',
    description: 'Chatbot Analytics & ML',
    badge: 'AI'
  },
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/settings',
    description: 'Account & Preferences',
    badge: null
  }
];

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isGlobalSearchOpen, setGlobalSearchOpen } = useSearch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  // Global search keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}
          >
            ON
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
              OrderNimbus
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Smart Inventory & Sales
            </Typography>
          </Box>
        </Box>
      </Box>


      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 3 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                border: isActive ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : '1px solid transparent',
                '&:hover': {
                  backgroundColor: isActive 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 44
                }}
              >
                {item.badge ? (
                  <Badge 
                    badgeContent={item.badge} 
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        minWidth: 18,
                        height: 18
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Actions */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <List>
          <ListItem
            onClick={() => {
              const docsUrl = process.env.REACT_APP_DOCS_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://docs.ordernimbus.com' 
                  : 'http://localhost:3002');
              
              // Try to open docs, with fallback
              const newWindow = window.open(docsUrl, '_blank');
              
              // If popup blocked or fails, provide alternative
              setTimeout(() => {
                if (!newWindow || newWindow.closed) {
                  alert(`Documentation is available at: ${docsUrl}\n\nPlease allow popups or navigate to the URL manually.`);
                }
              }, 1000);
            }}
            sx={{
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.04) }
            }}
          >
            <ListItemIcon sx={{ minWidth: 44 }}>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Help & Docs
                  <OpenInNewIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                </Box>
              }
              secondary="View API documentation"
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}
      >
        <Toolbar sx={{ minHeight: 80 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {menuItems.find(item => item.path === location.pathname)?.description || 'Welcome back!'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Search (⌘K)">
              <IconButton onClick={() => setGlobalSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <IconButton
              size="large"
              aria-label="account menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40 
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: theme.shadows[8]
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          pt: '80px'
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
      
      {/* Chatbot */}
      <Chatbot />
      
      {/* Global Search */}
      <GlobalSearch 
        open={isGlobalSearchOpen} 
        onClose={() => setGlobalSearchOpen(false)} 
      />
    </Box>
  );
};