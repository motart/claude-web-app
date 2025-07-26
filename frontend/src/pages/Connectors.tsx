import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { Add, Delete, Sync } from '@mui/icons-material';
import { connectorAPI } from '../services/api';

interface Store {
  platform: string;
  storeId: string;
  storeName: string;
  isActive: boolean;
}

export const Connectors: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [platform, setPlatform] = useState('');
  const [connectionData, setConnectionData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await connectorAPI.getStores();
      setStores(response.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      if (platform === 'shopify') {
        await connectorAPI.connectShopify(connectionData);
      } else if (platform === 'amazon') {
        await connectorAPI.connectAmazon(connectionData);
      }
      
      setDialogOpen(false);
      setConnectionData({});
      setPlatform('');
      fetchStores();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (storeId: string) => {
    try {
      await connectorAPI.disconnectStore(storeId);
      fetchStores();
    } catch (err) {
      console.error('Failed to disconnect store:', err);
    }
  };

  const handleSync = async (storeId: string) => {
    try {
      await connectorAPI.syncStore(storeId, {});
      alert('Sync completed successfully');
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const openDialog = (platformType: string) => {
    setPlatform(platformType);
    setConnectionData({});
    setError('');
    setDialogOpen(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Store Connectors
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shopify
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect your Shopify store for automatic sales data sync
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => openDialog('shopify')}
                fullWidth
              >
                Connect Shopify
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Amazon
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect your Amazon Seller account for sales data integration
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => openDialog('amazon')}
                fullWidth
              >
                Connect Amazon
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Custom Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use our API for custom e-commerce platform integration
              </Typography>
              <Button variant="outlined" fullWidth>
                View API Docs
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Connected Stores
      </Typography>

      {stores.length === 0 ? (
        <Alert severity="info">
          No stores connected yet. Connect your first store above to get started.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {stores.map((store) => (
            <Grid item xs={12} md={6} key={store.storeId}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">{store.storeName}</Typography>
                      <Chip 
                        label={store.platform.toUpperCase()} 
                        size="small" 
                        color="primary" 
                      />
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleSync(store.storeId)}>
                        <Sync />
                      </IconButton>
                      <IconButton onClick={() => handleDisconnect(store.storeId)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Connection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Connect {platform} Store</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Store Name"
            margin="normal"
            value={connectionData.storeName || ''}
            onChange={(e) => setConnectionData({ ...connectionData, storeName: e.target.value })}
          />

          {platform === 'shopify' && (
            <>
              <TextField
                fullWidth
                label="Shop Domain (without .myshopify.com)"
                margin="normal"
                value={connectionData.shopDomain || ''}
                onChange={(e) => setConnectionData({ ...connectionData, shopDomain: e.target.value })}
              />
              <TextField
                fullWidth
                label="Access Token"
                margin="normal"
                type="password"
                value={connectionData.accessToken || ''}
                onChange={(e) => setConnectionData({ ...connectionData, accessToken: e.target.value })}
              />
            </>
          )}

          {platform === 'amazon' && (
            <>
              <TextField
                fullWidth
                label="Seller ID"
                margin="normal"
                value={connectionData.sellerId || ''}
                onChange={(e) => setConnectionData({ ...connectionData, sellerId: e.target.value })}
              />
              <TextField
                fullWidth
                label="Access Key"
                margin="normal"
                value={connectionData.accessKey || ''}
                onChange={(e) => setConnectionData({ ...connectionData, accessKey: e.target.value })}
              />
              <TextField
                fullWidth
                label="Secret Key"
                margin="normal"
                type="password"
                value={connectionData.secretKey || ''}
                onChange={(e) => setConnectionData({ ...connectionData, secretKey: e.target.value })}
              />
              <TextField
                fullWidth
                label="Marketplace ID"
                margin="normal"
                value={connectionData.marketplaceId || ''}
                onChange={(e) => setConnectionData({ ...connectionData, marketplaceId: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConnect} 
            variant="contained"
            disabled={loading || !connectionData.storeName}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};