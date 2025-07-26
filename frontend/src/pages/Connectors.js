import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Switch,
  TextField,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Store,
  ShoppingCart,
  Storefront,
  Language,
  CheckCircle,
  Error,
  Add,
  Settings
} from '@mui/icons-material';

export const Connectors = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);
  
  const connectors = [
    {
      id: 'shopify',
      name: 'Shopify',
      icon: <Store sx={{ fontSize: 40 }} />,
      description: 'Connect your Shopify store to sync sales data automatically',
      connected: true,
      status: 'active',
      lastSync: '2 hours ago',
      records: 15420,
      color: '#96bf48'
    },
    {
      id: 'amazon',
      name: 'Amazon Seller Central',
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      description: 'Import sales data from Amazon Seller Central',
      connected: false,
      status: 'inactive',
      lastSync: 'Never',
      records: 0,
      color: '#ff9900'
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      icon: <Storefront sx={{ fontSize: 40 }} />,
      description: 'Sync data from your WooCommerce store',
      connected: true,
      status: 'error',
      lastSync: '1 day ago',
      records: 8250,
      color: '#96588a'
    },
    {
      id: 'squarespace',
      name: 'Squarespace',
      icon: <Language sx={{ fontSize: 40 }} />,
      description: 'Connect your Squarespace e-commerce site',
      connected: false,
      status: 'inactive',
      lastSync: 'Never',
      records: 0,
      color: '#000000'
    }
  ];

  const [connectorStates, setConnectorStates] = useState(
    connectors.reduce((acc, connector) => ({
      ...acc,
      [connector.id]: connector.connected
    }), {})
  );

  const handleToggleConnector = (connectorId) => {
    setConnectorStates(prev => ({
      ...prev,
      [connectorId]: !prev[connectorId]
    }));
  };

  const handleConfigureConnector = (connector) => {
    setSelectedConnector(connector);
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'error': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'error': return <Error />;
      default: return null;
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Platform Connectors 🔗
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect your e-commerce platforms to automatically sync sales data.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 Connected platforms will automatically sync data every 4 hours. Manual sync is also available.
      </Alert>

      <Grid container spacing={3}>
        {connectors.map((connector) => {
          const isConnected = connectorStates[connector.id];
          return (
            <Grid item xs={12} md={6} lg={4} key={connector.id}>
              <Card sx={{ 
                height: '100%',
                border: isConnected ? `2px solid ${connector.color}` : '1px solid',
                borderColor: isConnected ? connector.color : 'divider'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box sx={{ color: connector.color }}>
                      {connector.icon}
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isConnected}
                          onChange={() => handleToggleConnector(connector.id)}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {connector.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {connector.description}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Status:</Typography>
                    <Chip
                      icon={getStatusIcon(isConnected ? 'active' : 'inactive')}
                      label={isConnected ? 'Connected' : 'Disconnected'}
                      color={getStatusColor(isConnected ? 'active' : 'inactive')}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {isConnected && (
                    <>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Last Sync:</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {connector.lastSync}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2">Records:</Typography>
                        <Typography variant="body2" color="primary">
                          {connector.records.toLocaleString()}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" gap={1}>
                    <Button
                      variant={isConnected ? "outlined" : "contained"}
                      size="small"
                      startIcon={isConnected ? <Settings /> : <Add />}
                      onClick={() => handleConfigureConnector(connector)}
                      fullWidth
                    >
                      {isConnected ? 'Configure' : 'Connect'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Sync Summary
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                {connectors.filter(c => connectorStates[c.id]).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Connections
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {connectors.reduce((sum, c) => sum + (connectorStates[c.id] ? c.records : 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Records
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                4h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sync Frequency
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                99.8%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uptime
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure {selectedConnector?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter your {selectedConnector?.name} credentials to establish a secure connection.
            </Typography>
            
            <TextField
              fullWidth
              label="API Key"
              type="password"
              sx={{ mb: 2 }}
              helperText="You can find this in your platform's settings"
            />
            
            <TextField
              fullWidth
              label="Store URL"
              placeholder="https://your-store.example.com"
              sx={{ mb: 2 }}
            />
            
            <Alert severity="info">
              🔒 All credentials are encrypted and stored securely. We only access the data you explicitly authorize.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};