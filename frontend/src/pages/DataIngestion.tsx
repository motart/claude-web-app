import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  LinearProgress
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { dataAPI } from '../services/api';

export const DataIngestion: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');

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

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Data Ingestion
      </Typography>

      <Grid container spacing={3}>
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
                accept=".csv"
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
                  {uploading ? 'Uploading...' : 'Upload CSV File'}
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
              <Button variant="outlined" fullWidth>
                Configure Auto-Sync
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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