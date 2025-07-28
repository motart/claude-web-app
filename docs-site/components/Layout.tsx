import React, { useState } from 'react'
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
  useMediaQuery,
  useTheme,
  Divider,
  Collapse,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  RocketLaunch as QuickStartIcon,
  Api as ApiIcon,
  Link as IntegrationIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  ExpandLess,
  ExpandMore,
  Description as DocsIcon,
  GitHub as GitHubIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/router'

const drawerWidth = 280

interface NavItem {
  text: string
  icon: React.ReactNode
  href?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    text: 'Home',
    icon: <HomeIcon />,
    href: '/'
  },
  {
    text: 'Getting Started',
    icon: <QuickStartIcon />,
    children: [
      { text: 'Quick Start', icon: <DocsIcon />, href: '/getting-started' },
      { text: 'Installation', icon: <DocsIcon />, href: '/getting-started/installation' },
      { text: 'Authentication', icon: <DocsIcon />, href: '/getting-started/authentication' },
      { text: 'First API Call', icon: <DocsIcon />, href: '/getting-started/first-api-call' }
    ]
  },
  {
    text: 'API Reference',
    icon: <ApiIcon />,
    children: [
      { text: 'Overview', icon: <DocsIcon />, href: '/api' },
      { text: 'Authentication', icon: <DocsIcon />, href: '/api/authentication' },
      { text: 'Data Ingestion', icon: <DocsIcon />, href: '/api/data-ingestion' },
      { text: 'Forecasting', icon: <DocsIcon />, href: '/api/forecasting' },
      { text: 'Analytics', icon: <DocsIcon />, href: '/api/analytics' },
      { text: 'Webhooks', icon: <DocsIcon />, href: '/api/webhooks' },
      { text: 'Rate Limits', icon: <DocsIcon />, href: '/api/rate-limits' },
      { text: 'Errors', icon: <DocsIcon />, href: '/api/errors' }
    ]
  },
  {
    text: 'Integrations',
    icon: <IntegrationIcon />,
    children: [
      { text: 'Overview', icon: <DocsIcon />, href: '/integrations' },
      { text: 'Shopify', icon: <DocsIcon />, href: '/integrations/shopify' },
      { text: 'Amazon', icon: <DocsIcon />, href: '/integrations/amazon' },
      { text: 'WooCommerce', icon: <DocsIcon />, href: '/integrations/woocommerce' },
      { text: 'Custom Integrations', icon: <DocsIcon />, href: '/integrations/custom' }
    ]
  },
  {
    text: 'Guides',
    icon: <DocsIcon />,
    children: [
      { text: 'Data Preparation', icon: <DocsIcon />, href: '/guides/data-preparation' },
      { text: 'Model Training', icon: <DocsIcon />, href: '/guides/model-training' },
      { text: 'Performance Optimization', icon: <DocsIcon />, href: '/guides/performance' },
      { text: 'Best Practices', icon: <DocsIcon />, href: '/guides/best-practices' }
    ]
  },
  {
    text: 'Security',
    icon: <SecurityIcon />,
    children: [
      { text: 'Overview', icon: <DocsIcon />, href: '/security' },
      { text: 'Data Protection', icon: <DocsIcon />, href: '/security/data-protection' },
      { text: 'Compliance', icon: <DocsIcon />, href: '/security/compliance' },
      { text: 'Audit Logs', icon: <DocsIcon />, href: '/security/audit-logs' }
    ]
  },
  {
    text: 'Support',
    icon: <SupportIcon />,
    children: [
      { text: 'FAQ', icon: <DocsIcon />, href: '/support' },
      { text: 'Troubleshooting', icon: <DocsIcon />, href: '/support/troubleshooting' },
      { text: 'Contact Us', icon: <DocsIcon />, href: '/support/contact' },
      { text: 'Changelog', icon: <DocsIcon />, href: '/changelog' }
    ]
  }
]

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Getting Started', 'API Reference'])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleExpand = (text: string) => {
    setExpandedItems(prev => 
      prev.includes(text) 
        ? prev.filter(item => item !== text)
        : [...prev, text]
    )
  }

  const isActive = (href: string) => {
    return router.pathname === href
  }

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.text)
    const active = item.href ? isActive(item.href) : false

    return (
      <Box key={item.text}>
        <ListItem
          onClick={() => {
            if (hasChildren) {
              handleExpand(item.text)
            } else if (item.href) {
              router.push(item.href)
              if (isMobile) setMobileOpen(false)
            }
          }}
          sx={{
            pl: 2 + level * 2,
            cursor: 'pointer',
            backgroundColor: active ? 'primary.main' : 'transparent',
            color: active ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: active ? 'primary.dark' : 'grey.100'
            },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}
        >
          <ListItemIcon sx={{ color: active ? 'white' : 'inherit', minWidth: 40 }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text}
            primaryTypographyProps={{
              fontSize: level > 0 ? '0.875rem' : '1rem',
              fontWeight: active ? 600 : 500
            }}
          />
          {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    )
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              ON
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                OrderNimbus
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Documentation
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>

      {/* Search */}
      <Box sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search docs..."
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {navigation.map(item => renderNavItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label="v2.1.0" size="small" color="primary" />
          <Chip label="API v1" size="small" variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            href="https://github.com/ordernimbus"
            target="_blank"
            rel="noopener"
          >
            <GitHubIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            OrderNimbus Documentation
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              href={process.env.NODE_ENV === 'production' 
                ? 'https://app.ordernimbus.com' 
                : 'http://localhost:3001'}
              target="_blank"
              rel="noopener"
              color="primary"
            >
              <Typography variant="button" sx={{ mr: 1 }}>
                Dashboard
              </Typography>
            </IconButton>
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
              borderRight: 1,
              borderColor: 'divider'
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
          backgroundColor: 'background.default',
          pt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout