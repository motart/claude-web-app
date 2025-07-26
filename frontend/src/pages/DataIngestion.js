import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  FilePresent,
  CheckCircle,
  Error,
  Delete,
  Refresh
} from '@mui/icons-material';

export const DataIngestion = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files] = useState([
    {
      id: 1,
      name: 'sales_data_2024.csv',
      size: '2.4 MB',
      status: 'processed',
      records: 15420,
      uploadDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'shopify_export.json',
      size: '1.8 MB',
      status: 'processing',
      records: 8250,
      uploadDate: '2024-01-14'
    }
  ]);

  const handleFileUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle />;
      case 'processing': return <Refresh />;
      case 'error': return <Error />;
      default: return <FilePresent />;
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Data Ingestion 📊
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload and manage your sales data for AI-powered forecasting.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <CloudUpload sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Upload New Data
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    CSV, JSON, or Excel files
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  py: 2,
                  mb: 2
                }}
                onClick={handleFileUpload}
              >
                Choose Files to Upload
              </Button>
              
              {uploadProgress > 0 && (
                <Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress}
                    sx={{ 
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'rgba(255,255,255,0.8)'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Data Quality Summary
              </Typography>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Total Records</Typography>
                <Typography variant="h6" color="primary">
                  23,670
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Data Quality Score</Typography>
                <Typography variant="h6" color="success.main">
                  94.2%
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Missing Values</Typography>
                <Typography variant="h6" color="warning.main">
                  1.2%
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Duplicates</Typography>
                <Typography variant="h6" color="error.main">
                  0.8%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 For best results, ensure your data includes columns for date, product, quantity, and revenue.
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent Uploads
          </Typography>
          <Button startIcon={<Refresh />} variant="outlined">
            Refresh
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Records</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <FilePresent sx={{ mr: 1, color: 'text.secondary' }} />
                    {file.name}
                  </Box>
                </TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.records.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(file.status)}
                    label={file.status}
                    color={getStatusColor(file.status)}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>{file.uploadDate}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};