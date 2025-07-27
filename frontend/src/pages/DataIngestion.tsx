import React, { useState, useCallback } from 'react';
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
  Tooltip
} from '@mui/material';
import { 
  CloudUpload,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { dataAPI } from '../services/api';
import { PageSearch } from '../components/PageSearch';
import { SearchResult, SearchResultType } from '../types/search';

interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'manual';
  source: string;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  recordCount: number;
  lastSync: Date;
  tags: string[];
}

interface Upload {
  id: string;
  filename: string;
  uploadDate: Date;
  status: 'completed' | 'processing' | 'failed';
  recordCount: number;
  errorCount: number;
  fileSize: string;
}

export const DataIngestion: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data
  const dataSources: DataSource[] = [
    {
      id: 'ds1',
      name: 'Shopify Store Data',
      type: 'api',
      source: 'Shopify',
      status: 'active',
      recordCount: 15420,
      lastSync: new Date('2024-01-26T10:30:00'),
      tags: ['ecommerce', 'sales', 'real-time']
    },
    {
      id: 'ds2',
      name: 'Amazon Marketplace Orders',
      type: 'api',
      source: 'Amazon',
      status: 'active',
      recordCount: 8932,
      lastSync: new Date('2024-01-26T09:15:00'),
      tags: ['marketplace', 'orders', 'automated']
    },
    {
      id: 'ds3',
      name: 'Manual Sales Import',
      type: 'csv',
      source: 'CSV Upload',
      status: 'inactive',
      recordCount: 2456,
      lastSync: new Date('2024-01-24T14:22:00'),
      tags: ['manual', 'historical', 'csv']
    },
    {
      id: 'ds4',
      name: 'POS System Data',
      type: 'api',
      source: 'Square POS',
      status: 'error',
      recordCount: 1234,
      lastSync: new Date('2024-01-25T16:45:00'),
      tags: ['pos', 'in-store', 'offline']
    }
  ];

  const recentUploads: Upload[] = [
    {
      id: 'up1',
      filename: 'Q4_sales_data.csv',
      uploadDate: new Date('2024-01-26T08:30:00'),
      status: 'completed',
      recordCount: 5420,
      errorCount: 0,
      fileSize: '2.3 MB'
    },
    {
      id: 'up2',
      filename: 'inventory_levels.xlsx',
      uploadDate: new Date('2024-01-25T15:22:00'),
      status: 'processing',
      recordCount: 1250,
      errorCount: 0,
      fileSize: '890 KB'
    },
    {
      id: 'up3',
      filename: 'customer_data.csv',
      uploadDate: new Date('2024-01-24T11:15:00'),
      status: 'failed',
      recordCount: 0,
      errorCount: 125,
      fileSize: '1.1 MB'
    }
  ];

  const handleSearch = useCallback(async (query: string, filters: any) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Search data sources
      dataSources.forEach(source => {
        if (source.name.toLowerCase().includes(lowerQuery) || 
            source.source.toLowerCase().includes(lowerQuery) ||
            source.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
          results.push({
            id: source.id,
            title: source.name,
            description: `${source.source} - ${source.recordCount.toLocaleString()} records, Last sync: ${source.lastSync.toLocaleDateString()}`,
            type: 'data_source' as SearchResultType,
            category: 'Data Sources',
            url: '/data',
            score: 0.9,
            timestamp: source.lastSync,
            metadata: { 
              status: source.status, 
              recordCount: source.recordCount,
              type: source.type,
              source: source.source
            },
            tags: source.tags
          });
        }
      });

      // Search uploads
      recentUploads.forEach(upload => {
        if (upload.filename.toLowerCase().includes(lowerQuery) ||
            upload.status.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: upload.id,
            title: upload.filename,
            description: `${upload.status.toUpperCase()} - ${upload.recordCount.toLocaleString()} records, ${upload.fileSize}`,
            type: 'data_source' as SearchResultType,
            category: 'Uploads',
            url: '/data',
            score: 0.8,
            timestamp: upload.uploadDate,
            metadata: { 
              status: upload.status,
              recordCount: upload.recordCount,
              errorCount: upload.errorCount,
              fileSize: upload.fileSize
            },
            tags: ['upload', upload.status]
          });
        }
      });

      // Apply filters
      let filteredResults = results;
      if (filters.types && filters.types.length > 0) {
        filteredResults = filteredResults.filter(result => 
          filters.types.includes(result.type)
        );
      }

      if (filters.category) {
        filteredResults = filteredResults.filter(result => 
          result.category === filters.category
        );
      }

      if (filters.status) {
        filteredResults = filteredResults.filter(result => 
          result.metadata?.status === filters.status
        );
      }

      filteredResults.sort((a, b) => b.score - a.score);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [dataSources, recentUploads]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const response = await dataAPI.uploadCSV(file, 'default-store', 'custom');
      setUploadResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'syncing': return 'info';
      case 'error': return 'error';
      case 'failed': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Data Ingestion
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your data sources, upload files, and monitor data synchronization.
        </Typography>
        
        {/* Data Search */}
        <PageSearch
          placeholder="Search data sources, uploads, and connections..."
          onSearch={handleSearch}
          results={searchResults}
          isLoading={isSearching}
          availableFilters={{
            types: ['data_source'],
            categories: ['Data Sources', 'Uploads'],
            customFilters: [
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'error', label: 'Error' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'failed', label: 'Failed' }
                ]
              }
            ]
          }}
          compact
        />
      </Box>

      {/* Upload Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload CSV Data
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Upload your sales data in CSV format. Required columns: date, quantity, revenue, productName
              </Typography>
              
              <input
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                id="csv-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label htmlFor="csv-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={uploading}
                  fullWidth
                >
                  {uploading ? 'Uploading...' : 'Upload CSV/Excel File'}
                </Button>
              </label>
              
              {uploading && <LinearProgress sx={{ mt: 2 }} />}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Automatic Sync
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect your e-commerce platforms for automatic data synchronization
              </Typography>
              <Button variant="outlined" fullWidth startIcon={<SyncIcon />}>
                Configure Auto-Sync
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Sources */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Data Sources
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Records</TableCell>
                    <TableCell>Last Sync</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {source.name}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {source.tags.map(tag => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                variant="outlined" 
                                sx={{ mr: 0.5, height: 20, fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{source.source}</TableCell>
                      <TableCell>
                        <Chip 
                          label={source.type.toUpperCase()} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={source.status} 
                          size="small" 
                          color={getStatusColor(source.status) as any}
                        />
                      </TableCell>
                      <TableCell>{source.recordCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {source.lastSync.toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {source.lastSync.toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sync Now">
                            <IconButton size="small">
                              <SyncIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Uploads */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Uploads
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Filename</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Records</TableCell>
                    <TableCell>File Size</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {upload.filename}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {upload.uploadDate.toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {upload.uploadDate.toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={upload.status} 
                          size="small" 
                          color={getStatusColor(upload.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {upload.recordCount.toLocaleString()}
                        </Typography>
                        {upload.errorCount > 0 && (
                          <Typography variant="caption" color="error">
                            {upload.errorCount} errors
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{upload.fileSize}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {uploadResult && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Successfully imported {uploadResult.imported} records
          {uploadResult.errors > 0 && ` (${uploadResult.errors} errors)`}
        </Alert>
      )}
    </Box>
  );
};