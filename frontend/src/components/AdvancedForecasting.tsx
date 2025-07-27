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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  AutoMode as AutoModeIcon,
  Settings as SettingsIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { forecastAPI, connectorAPI } from '../services/api';
import { mlPipeline, ModelPerformance, PredictionResult } from '../services/advancedML';
import { dataIngestion } from '../services/dataIngestion';

interface Store {
  platform: string;
  storeId: string;
  storeName: string;
  isActive: boolean;
}

interface AdvancedForecast {
  _id: string;
  modelType: string;
  forecastType: string;
  startDate: string;
  endDate: string;
  predictions: PredictionResult[];
  performance: ModelPerformance;
  featureImportance: Record<string, number>;
  modelBreakdown: Record<string, number>;
  confidence: number;
  generatedAt: string;
  optimizationLevel: 'basic' | 'advanced' | 'expert';
}

export const AdvancedForecasting: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [forecasts, setForecasts] = useState<AdvancedForecast[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<AdvancedForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  
  // Advanced configuration
  const [advancedConfig, setAdvancedConfig] = useState({
    storeId: '',
    modelTypes: ['xgboost', 'lightgbm', 'transformer', 'prophet'],
    forecastDays: 30,
    trainingPeriodDays: 365,
    hyperparameterOptimization: true,
    externalDataSources: ['weather', 'economic'],
    featureEngineering: true,
    ensembleWeighting: 'dynamic',
    confidenceLevel: 0.95,
    backtestPeriods: 12,
    realtimeUpdate: true
  });

  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);

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
      const response = await forecastAPI.getForecasts({ type: 'advanced' });
      setForecasts(response.data.forecasts);
    } catch (err) {
      console.error('Failed to fetch forecasts:', err);
    }
  };

  const handleGenerateAdvancedForecast = async () => {
    setLoading(true);
    setError('');

    try {
      // Enhance data with external sources
      if (advancedConfig.externalDataSources.length > 0) {
        await dataIngestion.enhanceDataWithExternalSources(
          advancedConfig.storeId,
          new Date(Date.now() - advancedConfig.trainingPeriodDays * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString(),
          advancedConfig.externalDataSources
        );
      }

      // Generate forecast with advanced ML pipeline
      const response = await forecastAPI.generateAdvancedForecast({
        storeId: advancedConfig.storeId,
        forecastDays: advancedConfig.forecastDays,
        modelConfig: {
          models: advancedConfig.modelTypes,
          hyperparameterOptimization: advancedConfig.hyperparameterOptimization,
          ensembleMethod: advancedConfig.ensembleWeighting,
          confidenceLevel: advancedConfig.confidenceLevel
        },
        features: advancedConfig.featureEngineering ? [
          'time_features', 'lag_features', 'trend_features', 
          'seasonality_features', 'external_features'
        ] : ['basic_features']
      });

      setDialogOpen(false);
      fetchForecasts();
      
      // Reset configuration
      setAdvancedConfig(prev => ({
        ...prev,
        storeId: ''
      }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate advanced forecast');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeModel = async () => {
    if (!advancedConfig.storeId) return;
    
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    try {
      // Simulate optimization progress
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      await forecastAPI.optimizeModel({
        storeId: advancedConfig.storeId,
        modelType: 'ensemble',
        trials: 100,
        trainingPeriodDays: advancedConfig.trainingPeriodDays
      });

      setOptimizeDialogOpen(false);
      fetchForecasts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to optimize model');
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString();

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.95) return 'success';
    if (accuracy >= 0.90) return 'warning';
    return 'error';
  };

  const renderPerformanceMetrics = (forecast: AdvancedForecast) => (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Card sx={{ textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h4" color={getAccuracyColor(forecast.performance.accuracy)}>
              {(forecast.performance.accuracy * 100).toFixed(1)}%
            </Typography>
            <Typography variant="caption">Accuracy</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card sx={{ textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6">{forecast.performance.mape.toFixed(1)}%</Typography>
            <Typography variant="caption">MAPE</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card sx={{ textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6">{forecast.performance.rmse.toFixed(0)}</Typography>
            <Typography variant="caption">RMSE</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card sx={{ textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6">{(forecast.performance.r2Score * 100).toFixed(1)}%</Typography>
            <Typography variant="caption">R² Score</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFeatureImportance = (featureImportance: Record<string, number>) => {
    const features = Object.entries(featureImportance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={features.map(([name, importance]) => ({ name, importance }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <RechartsTooltip />
          <Bar dataKey="importance" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderModelBreakdown = (modelBreakdown: Record<string, number>) => {
    const models = Object.entries(modelBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fullMark: Math.max(...Object.values(modelBreakdown))
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={models}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Radar
            name="Model Performance"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Advanced AI Forecasting
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setOptimizeDialogOpen(true)}
            disabled={stores.length === 0}
            sx={{ mr: 1 }}
            startIcon={<AutoModeIcon />}
          >
            Optimize Models
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setDialogOpen(true)}
            disabled={stores.length === 0}
            startIcon={<TrendingUpIcon />}
          >
            Generate AI Forecast
          </Button>
        </Box>
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
          <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              AI Forecasts
            </Typography>
            {forecasts.map((forecast) => (
              <Card 
                key={forecast._id} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  border: selectedForecast?._id === forecast._id ? '2px solid #1976d2' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedForecast(forecast)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">
                      {forecast.modelType.toUpperCase()} - {forecast.forecastType}
                    </Typography>
                    <Chip 
                      label={`${(forecast.performance.accuracy * 100).toFixed(1)}%`}
                      color={getAccuracyColor(forecast.performance.accuracy)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Generated: {formatDate(forecast.generatedAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confidence: {(forecast.confidence * 100).toFixed(1)}%
                  </Typography>
                  <Box mt={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={forecast.performance.accuracy * 100}
                      color={getAccuracyColor(forecast.performance.accuracy)}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Forecast Details */}
        <Grid item xs={12} md={8}>
          {selectedForecast ? (
            <Paper sx={{ p: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Predictions" icon={<TimelineIcon />} />
                <Tab label="Performance" icon={<AssessmentIcon />} />
                <Tab label="Model Analysis" icon={<ScienceIcon />} />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Revenue Predictions - {selectedForecast.modelType.toUpperCase()}
                  </Typography>
                  
                  {renderPerformanceMetrics(selectedForecast)}
                  
                  <Box mt={3} height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedForecast.predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                        />
                        <YAxis tickFormatter={formatCurrency} />
                        <RechartsTooltip 
                          labelFormatter={formatDate}
                          formatter={(value: number, name: string) => {
                            if (name.includes('Revenue')) return [formatCurrency(value), name];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="predictedRevenue" 
                          stroke="#1976d2" 
                          strokeWidth={3}
                          name="AI Prediction"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="upperBound" 
                          stroke="#4caf50" 
                          strokeDasharray="5 5"
                          name="Upper Bound"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lowerBound" 
                          stroke="#ff9800" 
                          strokeDasharray="5 5"
                          name="Lower Bound"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Performance Analysis</Typography>
                  
                  {renderPerformanceMetrics(selectedForecast)}
                  
                  <Box mt={3}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">Detailed Metrics</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Metric</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Benchmark</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>Accuracy</TableCell>
                                <TableCell>{(selectedForecast.performance.accuracy * 100).toFixed(2)}%</TableCell>
                                <TableCell>≥95%</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={selectedForecast.performance.accuracy >= 0.95 ? 'Excellent' : 'Good'}
                                    color={selectedForecast.performance.accuracy >= 0.95 ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>MAPE</TableCell>
                                <TableCell>{selectedForecast.performance.mape.toFixed(2)}%</TableCell>
                                <TableCell>≤5%</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={selectedForecast.performance.mape <= 5 ? 'Excellent' : 'Good'}
                                    color={selectedForecast.performance.mape <= 5 ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Model Analysis</Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>Feature Importance</Typography>
                      {renderFeatureImportance(selectedForecast.featureImportance)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>Model Contribution</Typography>
                      {renderModelBreakdown(selectedForecast.modelBreakdown)}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <ScienceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Select an AI forecast to view detailed analysis
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Generate Advanced Forecast Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Generate Advanced AI Forecast
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select
                  value={advancedConfig.storeId}
                  onChange={(e) => setAdvancedConfig(prev => ({ ...prev, storeId: e.target.value }))}
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
              <TextField
                fullWidth
                label="Forecast Days"
                type="number"
                value={advancedConfig.forecastDays}
                onChange={(e) => setAdvancedConfig(prev => ({ ...prev, forecastDays: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 365 }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Training Period (Days)"
                type="number"
                value={advancedConfig.trainingPeriodDays}
                onChange={(e) => setAdvancedConfig(prev => ({ ...prev, trainingPeriodDays: parseInt(e.target.value) }))}
                inputProps={{ min: 30, max: 1095 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advancedConfig.hyperparameterOptimization}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, hyperparameterOptimization: e.target.checked }))}
                  />
                }
                label="Hyperparameter Optimization (Recommended)"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advancedConfig.featureEngineering}
                    onChange={(e) => setAdvancedConfig(prev => ({ ...prev, featureEngineering: e.target.checked }))}
                  />
                }
                label="Advanced Feature Engineering"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateAdvancedForecast} 
            variant="contained"
            disabled={loading || !advancedConfig.storeId}
            startIcon={loading ? <CircularProgress size={20} /> : <ScienceIcon />}
          >
            {loading ? 'Generating...' : 'Generate AI Forecast'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model Optimization Dialog */}
      <Dialog open={optimizeDialogOpen} onClose={() => setOptimizeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <AutoModeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Optimize ML Models
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This will optimize hyperparameters for all models to achieve maximum accuracy.
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Store</InputLabel>
              <Select
                value={advancedConfig.storeId}
                onChange={(e) => setAdvancedConfig(prev => ({ ...prev, storeId: e.target.value }))}
              >
                {stores.map((store) => (
                  <MenuItem key={store.storeId} value={store.storeId}>
                    {store.storeName} ({store.platform})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isOptimizing && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Optimization Progress: {optimizationProgress.toFixed(0)}%
                </Typography>
                <LinearProgress variant="determinate" value={optimizationProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizeDialogOpen(false)} disabled={isOptimizing}>
            Cancel
          </Button>
          <Button 
            onClick={handleOptimizeModel} 
            variant="contained"
            disabled={isOptimizing || !advancedConfig.storeId}
            startIcon={isOptimizing ? <CircularProgress size={20} /> : <AutoModeIcon />}
          >
            {isOptimizing ? 'Optimizing...' : 'Start Optimization'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};