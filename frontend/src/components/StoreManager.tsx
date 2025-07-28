import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Store {
  _id: string;
  name: string;
  type: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    taxRate?: number;
  };
  metadata: {
    storeSize?: string;
    category?: string;
    openingDate?: string;
    employees?: number;
  };
  isActive: boolean;
  createdAt: string;
}

interface StoreFormData {
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  settings: {
    timezone: string;
    currency: string;
    taxRate: string;
  };
  metadata: {
    storeSize: string;
    category: string;
    openingDate: string;
    employees: string;
  };
}

interface StoreManagerProps {
  onStoreSelect?: (store: Store) => void;
  selectedStoreId?: string;
}

const StoreManager: React.FC<StoreManagerProps> = ({ onStoreSelect, selectedStoreId }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    type: 'brick_mortar',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      taxRate: ''
    },
    metadata: {
      storeSize: '',
      category: '',
      openingDate: '',
      employees: ''
    }
  });

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
      } else {
        setError('Failed to fetch stores');
      }
    } catch (err) {
      setError('Error fetching stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        type: store.type,
        address: store.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        },
        contact: {
          phone: store.contact?.phone || '',
          email: store.contact?.email || '',
          website: store.contact?.website || ''
        },
        settings: {
          timezone: store.settings.timezone || 'America/New_York',
          currency: store.settings.currency || 'USD',
          taxRate: store.settings.taxRate?.toString() || ''
        },
        metadata: {
          storeSize: store.metadata.storeSize || '',
          category: store.metadata.category || '',
          openingDate: store.metadata.openingDate ? store.metadata.openingDate.split('T')[0] : '',
          employees: store.metadata.employees?.toString() || ''
        }
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        type: 'brick_mortar',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        },
        contact: {
          phone: '',
          email: '',
          website: ''
        },
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          taxRate: ''
        },
        metadata: {
          storeSize: '',
          category: '',
          openingDate: '',
          employees: ''
        }
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStore(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        settings: {
          ...formData.settings,
          taxRate: formData.settings.taxRate ? parseFloat(formData.settings.taxRate) : undefined
        },
        metadata: {
          ...formData.metadata,
          employees: formData.metadata.employees ? parseInt(formData.metadata.employees) : undefined,
          openingDate: formData.metadata.openingDate || undefined
        }
      };

      // Remove empty strings
      Object.keys(payload.contact).forEach(key => {
        if (payload.contact[key as keyof typeof payload.contact] === '') {
          delete payload.contact[key as keyof typeof payload.contact];
        }
      });

      const url = editingStore ? `/api/stores/${editingStore._id}` : '/api/stores';
      const method = editingStore ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchStores();
        handleCloseDialog();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save store');
      }
    } catch (err) {
      setError('Error saving store');
    }
  };

  const handleDelete = async (storeId: string) => {
    if (!window.confirm('Are you sure you want to delete this store?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchStores();
      } else {
        setError('Failed to delete store');
      }
    } catch (err) {
      setError('Error deleting store');
    }
  };

  const getStoreTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      brick_mortar: 'Brick & Mortar',
      shopify: 'Shopify',
      amazon: 'Amazon',
      woocommerce: 'WooCommerce',
      custom: 'Custom'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return <Typography>Loading stores...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Store Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Store
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {stores.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No stores yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first brick and mortar store to start uploading sales data
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <List>
          {stores.map((store, index) => (
            <React.Fragment key={store._id}>
              <ListItem
                sx={{
                  border: selectedStoreId === store._id ? 2 : 1,
                  borderColor: selectedStoreId === store._id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  mb: 1,
                  cursor: onStoreSelect ? 'pointer' : 'default'
                }}
                onClick={() => onStoreSelect?.(store)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <StoreIcon color="primary" />
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {store.name}
                      <Chip 
                        label={getStoreTypeDisplay(store.type)} 
                        size="small" 
                        color={store.type === 'brick_mortar' ? 'primary' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {store.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <LocationIcon fontSize="small" />
                          <Typography variant="body2">
                            {store.address.city}, {store.address.state}
                          </Typography>
                        </Box>
                      )}
                      {store.contact?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <PhoneIcon fontSize="small" />
                          <Typography variant="body2">{store.contact.phone}</Typography>
                        </Box>
                      )}
                      {store.contact?.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <EmailIcon fontSize="small" />
                          <Typography variant="body2">{store.contact.email}</Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(store);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(store._id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < stores.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Store Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStore ? 'Edit Store' : 'Add New Store'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Store Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Store Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Store Type"
                >
                  <MenuItem value="brick_mortar">Brick & Mortar</MenuItem>
                  <MenuItem value="shopify">Shopify</MenuItem>
                  <MenuItem value="amazon">Amazon</MenuItem>
                  <MenuItem value="woocommerce">WooCommerce</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.type === 'brick_mortar' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Address Information
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    fullWidth
                    required
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    fullWidth
                    required
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="State"
                    fullWidth
                    required
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="ZIP Code"
                    fullWidth
                    required
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={formData.contact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Store Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Store Size</InputLabel>
                <Select
                  value={formData.metadata.storeSize}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, storeSize: e.target.value }
                  })}
                  label="Store Size"
                >
                  <MenuItem value="">Not specified</MenuItem>
                  <MenuItem value="small">Small (1-5 employees)</MenuItem>
                  <MenuItem value="medium">Medium (6-25 employees)</MenuItem>
                  <MenuItem value="large">Large (25+ employees)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                fullWidth
                value={formData.metadata.category}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, category: e.target.value }
                })}
                placeholder="e.g., Retail, Restaurant, Service"
              />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStore ? 'Update' : 'Create'} Store
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreManager;