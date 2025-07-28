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
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import { Add, Delete, Sync, Store, Launch, History } from '@mui/icons-material';
import { connectorAPI } from '../services/api';
import { useSearchParams } from 'react-router-dom';

interface Store {
  platform: string;
  storeId: string;
  storeName: string;
  isActive: boolean;
}

export const Connectors: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [platform, setPlatform] = useState('');
  const [connectionData, setConnectionData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [syncingStores, setSyncingStores] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStores();
    
    // Handle URL parameters (OAuth callback results)
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const importedParam = searchParams.get('imported');
    
    if (errorParam) {
      setError(`Connection failed: ${errorParam.replace(/_/g, ' ')}`);
      setSearchParams({});
    }
    
    if (successParam === 'shopify_connected') {
      setSuccess(`Shopify store connected successfully! Imported ${importedParam || 0} records.`);
      setSearchParams({});
      fetchStores();
    }
  }, [searchParams, setSearchParams]);

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
        // Use OAuth flow for Shopify
        const response = await connectorAPI.initShopifyOAuth({
          shop: connectionData.shopDomain,
          storeName: connectionData.storeName
        });
        
        // Redirect to Shopify OAuth
        window.location.href = response.data.authUrl;
        return;
      } else if (platform === 'amazon') {
        await connectorAPI.connectAmazon(connectionData);
        setDialogOpen(false);
        setConnectionData({});
        setPlatform('');
        fetchStores();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectLegacy = async () => {
    setLoading(true);
    setError('');

    try {
      if (platform === 'shopify') {
        await connectorAPI.connectShopify(connectionData);
        setDialogOpen(false);
        setConnectionData({});
        setPlatform('');
        fetchStores();
      }
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
    setSyncingStores(prev => new Set([...prev, storeId]));
    setError('');
    setSuccess('');

    try {
      const response = await connectorAPI.syncStore(storeId, {});
      setSuccess(`Sync completed for store! Imported ${response.data.result.recordsImported} new records.`);
      
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dataUploaded', { 
        detail: { 
          imported: response.data.result.recordsImported, 
          errors: response.data.result.errors?.length || 0,
          source: 'shopify_sync'
        } 
      }));
      
      fetchStores();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sync failed');
    } finally {
      setSyncingStores(prev => {
        const newSet = new Set(prev);
        newSet.delete(storeId);
        return newSet;
      });
    }
  };

  const handleSyncAll = async () => {
    // Mark all stores as syncing
    setSyncingStores(new Set(stores.map(s => s.storeId)));
    setError('');
    setSuccess('');

    try {
      const response = await connectorAPI.syncAllStores();
      const totalImported = response.data.results.reduce((sum: number, result: any) => sum + (result.recordsImported || 0), 0);
      
      setSuccess(`Bulk sync completed! Imported ${totalImported} total records from ${response.data.successCount}/${response.data.totalStores} stores.`);
      
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dataUploaded', { 
        detail: { 
          imported: totalImported, 
          errors: 0,
          source: 'bulk_sync'
        } 
      }));
      
      fetchStores();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bulk sync failed');
    } finally {
      setSyncingStores(new Set());
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
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        🔗 Store Connectors
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Connect your e-commerce platforms to automatically sync sales data and get insights.
      </Typography>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #96c93f 0%, #7db946 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Store sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Shopify
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                Connect your Shopify store to automatically import orders, products, and customer data. Supports all Shopify plans.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Launch />}
                onClick={() => openDialog('shopify')}
                fullWidth
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                  backdropFilter: 'blur(10px)'
                }}
              >
                Connect with OAuth
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

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Connected Stores
        </Typography>
        {stores.length > 1 && (
          <Button
            variant="outlined"
            startIcon={<Sync />}
            onClick={handleSyncAll}
            disabled={syncingStores.size > 0}
          >
            Sync All Stores
          </Button>
        )}
      </Box>

      {stores.length === 0 ? (
        <Alert severity="info">
          No stores connected yet. Connect your first store above to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {stores.map((store) => (
            <Grid item xs={12} md={6} lg={4} key={store.storeId}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Store sx={{ mr: 1, color: store.platform === 'shopify' ? '#96c93f' : 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {store.storeName}
                        </Typography>
                      </Box>
                      <Chip 
                        label={store.platform.toUpperCase()} 
                        size="small" 
                        color={store.platform === 'shopify' ? 'success' : 'primary'}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Store ID: {store.storeId}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {syncingStores.has(store.storeId) && (
                    <Box mb={2}>
                      <Typography variant="body2" color="primary" mb={1}>
                        Syncing data...
                      </Typography>
                      <LinearProgress />
                    </Box>
                  )}
                  
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={syncingStores.has(store.storeId) ? <CircularProgress size={16} /> : <Sync />}
                      onClick={() => handleSync(store.storeId)}
                      disabled={syncingStores.has(store.storeId)}
                      size="small"
                      flex={1}
                    >
                      {syncingStores.has(store.storeId) ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <IconButton 
                      onClick={() => handleDisconnect(store.storeId)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Connection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Store sx={{ mr: 1 }} />
            Connect {platform === 'shopify' ? 'Shopify' : 'Amazon'} Store
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {platform === 'shopify' && (
            <Box mb={2}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="OAuth (Recommended)" />
                <Tab label="Manual Token" />
              </Tabs>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="Store Name"
            margin="normal"
            value={connectionData.storeName || ''}
            onChange={(e) => setConnectionData({ ...connectionData, storeName: e.target.value })}
            helperText="Give your store a friendly name for identification"
          />

          {platform === 'shopify' && (
            <>
              <TextField
                fullWidth
                label="Shop Domain"
                margin="normal"
                value={connectionData.shopDomain || ''}
                onChange={(e) => setConnectionData({ ...connectionData, shopDomain: e.target.value })}
                placeholder="your-store-name"
                helperText="Enter your Shopify store name (without .myshopify.com)"
              />
              
              {tabValue === 1 && (
                <TextField
                  fullWidth
                  label="Access Token"
                  margin="normal"
                  type="password"
                  value={connectionData.accessToken || ''}
                  onChange={(e) => setConnectionData({ ...connectionData, accessToken: e.target.value })}
                  helperText="Private app access token from your Shopify admin"
                />
              )}
              
              {tabValue === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  OAuth flow will redirect you to Shopify to authorize the connection safely. 
                  This is the recommended method for security.
                </Alert>
              )}
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
          {platform === 'shopify' && tabValue === 1 ? (
            <Button 
              onClick={handleConnectLegacy} 
              variant="contained"
              disabled={loading || !connectionData.storeName || !connectionData.shopDomain || !connectionData.accessToken}
            >
              {loading ? 'Connecting...' : 'Connect with Token'}
            </Button>
          ) : (
            <Button 
              onClick={handleConnect} 
              variant="contained"
              disabled={loading || !connectionData.storeName || !connectionData.shopDomain}
              startIcon={platform === 'shopify' && tabValue === 0 ? <Launch /> : undefined}
            >
              {loading ? 'Connecting...' : platform === 'shopify' && tabValue === 0 ? 'Connect with OAuth' : 'Connect'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};