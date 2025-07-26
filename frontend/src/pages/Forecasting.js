import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  Analytics,
  ShowChart,
  Timeline,
  PlayArrow,
  Settings
} from '@mui/icons-material';

export const Forecasting = () => {
  const [model, setModel] = useState('ensemble');
  const [timeframe, setTimeframe] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const models = [
    { value: 'lstm', label: 'LSTM Neural Network', accuracy: '92.3%' },
    { value: 'arima', label: 'ARIMA Statistical Model', accuracy: '89.1%' },
    { value: 'prophet', label: 'Prophet Time Series', accuracy: '90.7%' },
    { value: 'ensemble', label: 'Ensemble (Recommended)', accuracy: '94.8%' }
  ];

  const forecasts = [
    {
      period: 'Next 7 Days',
      predicted: 45600,
      confidence: 95,
      trend: '+12.3%'
    },
    {
      period: 'Next 30 Days',
      predicted: 186400,
      confidence: 89,
      trend: '+8.7%'
    },
    {
      period: 'Next Quarter',
      predicted: 567200,
      confidence: 78,
      trend: '+15.2%'
    }
  ];

  const handleGenerateForecast = () => {
    setIsGenerating(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 8;
      });
    }, 300);
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          AI Forecasting 🔮
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate accurate sales predictions using advanced machine learning models.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Settings sx={{ fontSize: 30, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Model Configuration
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>ML Model</InputLabel>
                <Select
                  value={model}
                  label="ML Model"
                  onChange={(e) => setModel(e.target.value)}
                >
                  {models.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      <Box>
                        <Typography variant="body1">{m.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Accuracy: {m.accuracy}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Forecast Period (days)"
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleGenerateForecast}
                disabled={isGenerating}
                sx={{ py: 1.5 }}
              >
                {isGenerating ? 'Generating...' : 'Generate Forecast'}
              </Button>

              {isGenerating && (
                <Box mt={2}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Processing data with {models.find(m => m.value === model)?.label}...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Forecast Visualization
            </Typography>
            <Box sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <Box textAlign="center">
                <ShowChart sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Interactive forecasting chart will appear here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate a forecast to see AI predictions and confidence intervals
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="success" sx={{ mb: 3 }}>
        🎯 Your data quality score is excellent (94.2%). This will improve forecast accuracy.
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Recent Forecasts
        </Typography>

        <Grid container spacing={3}>
          {forecasts.map((forecast, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{
                background: index === 0 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : index === 1
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {forecast.period}
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      {index === 0 ? <TrendingUp /> : index === 1 ? <Analytics /> : <Timeline />}
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {formatCurrency(forecast.predicted)}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {forecast.confidence}% confidence
                    </Typography>
                    <Chip
                      label={forecast.trend}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};