import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField
} from '@mui/material';
import { 
  CloudUpload,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Store as StoreIcon,
  GetApp as TemplateIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { dataAPI } from '../services/api';
import StoreManager from '../components/StoreManager';

interface Store {
  _id: string;
  name: string;
  type: string;
  address?: any;
  contact?: any;
  settings: any;
  metadata: any;
  isActive: boolean;
  createdAt: string;
}

interface UploadResult {
  message: string;
  imported: number;
  total: number;
  errors: number;
  errorDetails?: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  summary: {
    totalRows: number;
    validRows: number;
    importedRows: number;
    errorRows: number;
  };
}

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
      id={`data-tabpanel-${index}`}
      aria-labelledby={`data-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const DataIngestion: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleDownloadTemplate() {
    try {
      const response = await fetch('/api/stores/templates/csv', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales-data-template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download template');
      }
    } catch (err) {
      setError('Error downloading template');
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please select a CSV file');
      }
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!file || !selectedStore) {
      setError('Please select a file and store');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('salesData', file);
      formData.append('storeId', selectedStore._id);
      formData.append('platform', selectedStore.type);

      const response = await fetch('/api/data/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadResult(result);
        setFile(null);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setFile(null);
    setUploadResult(null);
    setError(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Data Ingestion
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            icon={<StoreIcon />}
            label="Store Management"
            iconPosition="start"
          />
          <Tab
            icon={<UploadIcon />}
            label="CSV Upload"
            iconPosition="start"
          />
          <Tab
            icon={<SyncIcon />}
            label="Data Sources"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <StoreManager 
          onStoreSelect={handleStoreSelect}
          selectedStoreId={selectedStore?._id}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick CSV Upload
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload sales data for your brick and mortar stores using CSV files
                </Typography>

                {selectedStore ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Selected store: <strong>{selectedStore.name}</strong>
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Please select a store from the Store Management tab first
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                    disabled={!selectedStore}
                  >
                    Upload CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TemplateIcon />}
                    onClick={handleDownloadTemplate}
                  >
                    Download Template
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  CSV Format Requirements
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Your CSV file must include these required columns:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="date" 
                      secondary="Transaction date (YYYY-MM-DD)" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="productName" 
                      secondary="Name of the product sold" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="quantity" 
                      secondary="Number of items sold" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="revenue" 
                      secondary="Total sales amount" 
                    />
                  </ListItem>
                </List>
                <Typography variant="body2" color="text.secondary">
                  Optional columns: cost, category, sku, productId
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Connected Data Sources
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage your e-commerce platform integrations and automated data sources
            </Typography>
            <Alert severity="info">
              Integration with Shopify, Amazon, and WooCommerce coming soon. 
              Currently supporting manual CSV uploads for brick and mortar stores.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="md" fullWidth>
        <DialogTitle>Upload Sales Data</DialogTitle>
        <DialogContent>
          {!selectedStore ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Please select a store from the Store Management tab before uploading data.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Uploading data for: <strong>{selectedStore.name}</strong>
            </Alert>
          )}

          <Box
            sx={{
              border: 2,
              borderColor: dragOver ? 'primary.main' : 'divider',
              borderStyle: 'dashed',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              backgroundColor: dragOver ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              mb: 2
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {file ? file.name : 'Drop CSV file here or click to browse'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: .csv files up to 10MB
            </Typography>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </Box>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Processing your file...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {uploadResult && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {uploadResult.summary.totalRows}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Rows
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {uploadResult.summary.importedRows}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Imported
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {uploadResult.summary.validRows - uploadResult.summary.importedRows}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Skipped
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {uploadResult.summary.errorRows}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Errors
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sample Errors:
                    </Typography>
                    <List dense>
                      {uploadResult.errorDetails.slice(0, 5).map((error, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ErrorIcon color="error" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Row ${error.row}`}
                            secondary={error.error}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {uploadResult.errorDetails.length > 5 && (
                      <Typography variant="body2" color="text.secondary">
                        ... and {uploadResult.errorDetails.length - 5} more errors
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button onClick={handleDownloadTemplate} startIcon={<TemplateIcon />}>
            Download Template
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!file || !selectedStore || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};