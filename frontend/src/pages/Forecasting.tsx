import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { forecastAPI, connectorAPI } from '../services/api';
import { AdvancedForecasting } from '../components/AdvancedForecasting';

interface Store {
  platform: string;
  storeId: string;
  storeName: string;
  isActive: boolean;
}

interface Forecast {
  _id: string;
  modelType: string;
  forecastType: string;
  startDate: string;
  endDate: string;
  predictions: Array<{
    date: string;
    predictedRevenue: number;
    predictedQuantity: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
  accuracy: {
    mape: number;
    rmse: number;
    mae: number;
    r2Score: number;
  };
  generatedAt: string;
}

export const Forecasting: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newForecast, setNewForecast] = useState({
    storeId: '',
    modelType: 'ensemble',
    forecastType: 'daily',
    forecastDays: 30,
    trainingPeriodDays: 365
  });

  useEffect(() => {
    fetchStores();
    fetchForecasts();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await connectorAPI.getStores();
      setStores(response.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const fetchForecasts = async () => {
    try {
      const response = await forecastAPI.getForecasts({});
      setForecasts(response.data.forecasts);
    } catch (err) {
      console.error('Failed to fetch forecasts:', err);
    }
  };

  const handleGenerateForecast = async () => {
    setLoading(true);
    setError('');

    try {
      await forecastAPI.generateForecast(newForecast);
      setDialogOpen(false);
      fetchForecasts();
      setNewForecast({
        storeId: '',
        modelType: 'ensemble',
        forecastType: 'daily',
        forecastDays: 30,
        trainingPeriodDays: 365
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate forecast');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString();

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Basic Forecasting
                <Chip label="Legacy" size="small" color="default" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Advanced AI Forecasting
                <Chip label="95%+ Accuracy" size="small" color="success" />
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box p={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Sales Forecasting</Typography>
            <Button 
              variant="contained" 
              onClick={() => setDialogOpen(true)}
              disabled={stores.length === 0}
            >
              Generate New Forecast
            </Button>
          </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {stores.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please connect at least one store in the Connectors section to generate forecasts.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Forecast List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Forecasts
            </Typography>
            {forecasts.map((forecast) => (
              <Card 
                key={forecast._id} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  border: selectedForecast?._id === forecast._id ? '2px solid #1976d2' : 'none'
                }}
                onClick={() => setSelectedForecast(forecast)}
              >
                <CardContent>
                  <Typography variant="subtitle1">
                    {forecast.modelType.toUpperCase()} - {forecast.forecastType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generated: {formatDate(forecast.generatedAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accuracy: {(forecast.accuracy.r2Score * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Forecast Details */}
        <Grid item xs={12} md={8}>
          {selectedForecast ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Forecast Details - {selectedForecast.modelType.toUpperCase()}
              </Typography>
              
              {/* Accuracy Metrics */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        R² Score
                      </Typography>
                      <Typography variant="h6">
                        {(selectedForecast.accuracy.r2Score * 100).toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        MAPE
                      </Typography>
                      <Typography variant="h6">
                        {selectedForecast.accuracy.mape.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        RMSE
                      </Typography>
                      <Typography variant="h6">
                        {selectedForecast.accuracy.rmse.toFixed(0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        MAE
                      </Typography>
                      <Typography variant="h6">
                        {selectedForecast.accuracy.mae.toFixed(0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Forecast Chart */}
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={selectedForecast.predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number, name: string) => {
                      if (name === 'predictedRevenue') return [formatCurrency(value), 'Predicted Revenue'];
                      if (name === 'upperBound') return [formatCurrency(value), 'Upper Bound'];
                      if (name === 'lowerBound') return [formatCurrency(value), 'Lower Bound'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predictedRevenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Predicted Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                    name="Upper Bound"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lowerBound" 
                    stroke="#ffc658" 
                    strokeDasharray="5 5"
                    name="Lower Bound"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          ) : (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a forecast to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Generate Forecast Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New Forecast</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select
                  value={newForecast.storeId}
                  onChange={(e) => setNewForecast({ ...newForecast, storeId: e.target.value })}
                >
                  {stores.map((store) => (
                    <MenuItem key={store.storeId} value={store.storeId}>
                      {store.storeName} ({store.platform})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Model Type</InputLabel>
                <Select
                  value={newForecast.modelType}
                  onChange={(e) => setNewForecast({ ...newForecast, modelType: e.target.value })}
                >
                  <MenuItem value="ensemble">Ensemble (Recommended)</MenuItem>
                  <MenuItem value="lstm">LSTM Neural Network</MenuItem>
                  <MenuItem value="arima">ARIMA</MenuItem>
                  <MenuItem value="prophet">Prophet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Forecast Type</InputLabel>
                <Select
                  value={newForecast.forecastType}
                  onChange={(e) => setNewForecast({ ...newForecast, forecastType: e.target.value })}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Forecast Days"
                type="number"
                value={newForecast.forecastDays}
                onChange={(e) => setNewForecast({ ...newForecast, forecastDays: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 365 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Training Period (Days)"
                type="number"
                value={newForecast.trainingPeriodDays}
                onChange={(e) => setNewForecast({ ...newForecast, trainingPeriodDays: parseInt(e.target.value) })}
                inputProps={{ min: 30, max: 1095 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateForecast} 
            variant="contained"
            disabled={loading || !newForecast.storeId}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Forecast'}
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
      )}

      {tabValue === 1 && <AdvancedForecasting />}
    </Box>
  );
};