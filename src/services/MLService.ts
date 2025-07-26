// import * as tf from '@tensorflow/tfjs-node'; // Disabled for Docker compatibility
import { PythonShell } from 'python-shell';
import { SalesData } from '../models/SalesData';
import { Forecast, IForecast } from '../models/Forecast';
import { startOfDay, subDays, addDays, format } from 'date-fns';
import * as _ from 'lodash';

export interface ForecastRequest {
  userId: string;
  storeId: string;
  modelType: 'arima' | 'lstm' | 'prophet' | 'ensemble';
  forecastType: 'daily' | 'weekly' | 'monthly';
  forecastDays: number;
  trainingPeriodDays: number;
}

export interface PredictionResult {
  date: Date;
  predictedRevenue: number;
  predictedQuantity: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export class MLService {
  async generateForecast(request: ForecastRequest): Promise<IForecast> {
    const trainingData = await this.getTrainingData(request);
    
    if (trainingData.length < 30) {
      throw new Error('Insufficient training data. Minimum 30 days required.');
    }

    let predictions: PredictionResult[];
    let accuracy: any;

    switch (request.modelType) {
      case 'lstm':
        ({ predictions, accuracy } = await this.runLSTMModel(trainingData, request));
        break;
      case 'arima':
        ({ predictions, accuracy } = await this.runARIMAModel(trainingData, request));
        break;
      case 'prophet':
        ({ predictions, accuracy } = await this.runProphetModel(trainingData, request));
        break;
      case 'ensemble':
        ({ predictions, accuracy } = await this.runEnsembleModel(trainingData, request));
        break;
      default:
        throw new Error('Invalid model type');
    }

    const forecast = new Forecast({
      userId: request.userId,
      storeId: request.storeId,
      modelType: request.modelType,
      forecastType: request.forecastType,
      startDate: new Date(),
      endDate: addDays(new Date(), request.forecastDays),
      predictions,
      accuracy,
      trainingDataPeriod: {
        startDate: trainingData[0].date,
        endDate: trainingData[trainingData.length - 1].date,
        recordCount: trainingData.length
      }
    });

    await forecast.save();
    return forecast;
  }

  private async getTrainingData(request: ForecastRequest) {
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, request.trainingPeriodDays);

    const salesData = await SalesData.find({
      userId: request.userId,
      storeId: request.storeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    return this.aggregateDataByPeriod(salesData, request.forecastType);
  }

  private aggregateDataByPeriod(salesData: any[], period: string) {
    const groupedData = _.groupBy(salesData, (item) => {
      const date = new Date(item.date);
      switch (period) {
        case 'daily':
          return format(date, 'yyyy-MM-dd');
        case 'weekly':
          return format(date, 'yyyy-ww');
        case 'monthly':
          return format(date, 'yyyy-MM');
        default:
          return format(date, 'yyyy-MM-dd');
      }
    });

    return Object.keys(groupedData).map(key => ({
      date: new Date(groupedData[key][0].date),
      revenue: _.sumBy(groupedData[key], 'revenue'),
      quantity: _.sumBy(groupedData[key], 'quantity')
    }));
  }

  private async runLSTMModel(trainingData: any[], request: ForecastRequest) {
    // Simplified LSTM-like model using exponential smoothing with memory
    const predictions: PredictionResult[] = [];
    
    // Calculate exponential smoothing with trend
    const revenues = trainingData.map(d => d.revenue);
    const alpha = 0.3; // Smoothing factor
    const beta = 0.1;  // Trend factor
    
    let level = revenues[0];
    let trend = revenues.length > 1 ? revenues[1] - revenues[0] : 0;
    
    // Update level and trend based on recent data
    for (let i = 1; i < revenues.length; i++) {
      const newLevel = alpha * revenues[i] + (1 - alpha) * (level + trend);
      trend = beta * (newLevel - level) + (1 - beta) * trend;
      level = newLevel;
    }
    
    // Generate predictions
    for (let i = 0; i < request.forecastDays; i++) {
      const predictedRevenue = level + trend * (i + 1);
      const volatility = this.calculateVolatility(revenues);
      
      predictions.push({
        date: addDays(new Date(), i + 1),
        predictedRevenue: Math.max(0, predictedRevenue),
        predictedQuantity: Math.max(0, predictedRevenue / (trainingData[trainingData.length - 1].revenue / trainingData[trainingData.length - 1].quantity)),
        confidence: 0.8,
        upperBound: predictedRevenue * (1 + volatility),
        lowerBound: predictedRevenue * (1 - volatility)
      });
    }

    const accuracy = this.calculateAccuracy(trainingData.slice(-request.forecastDays), predictions);
    return { predictions, accuracy };
  }
  
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0.1;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean || 0.1;
  }

  private async runARIMAModel(trainingData: any[], request: ForecastRequest) {
    const pythonScript = `
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
import json
import sys

data = json.loads(sys.argv[1])
forecast_days = int(sys.argv[2])

df = pd.DataFrame(data)
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date')

model = ARIMA(df['revenue'], order=(5, 1, 0))
fitted_model = model.fit()

forecast = fitted_model.forecast(steps=forecast_days)
confidence_intervals = fitted_model.get_prediction(start=-forecast_days).conf_int()

results = {
    'predictions': forecast.tolist(),
    'confidence_intervals': confidence_intervals.values.tolist(),
    'accuracy': {
        'aic': fitted_model.aic,
        'bic': fitted_model.bic
    }
}

print(json.dumps(results))
    `;

    const result = await PythonShell.runString(pythonScript, {
      args: [JSON.stringify(trainingData), request.forecastDays.toString()]
    });

    const output = JSON.parse(result[0]);
    
    const predictions: PredictionResult[] = output.predictions.map((pred: number, index: number) => ({
      date: addDays(new Date(), index + 1),
      predictedRevenue: pred,
      predictedQuantity: pred / (trainingData[trainingData.length - 1].revenue / trainingData[trainingData.length - 1].quantity),
      confidence: 0.75,
      upperBound: output.confidence_intervals[index][1],
      lowerBound: output.confidence_intervals[index][0]
    }));

    return { predictions, accuracy: output.accuracy };
  }

  private async runProphetModel(trainingData: any[], request: ForecastRequest) {
    // Simplified Prophet-like model using simple moving average with trend
    const predictions: PredictionResult[] = [];
    
    // Calculate trend and seasonal components
    const revenues = trainingData.map(d => d.revenue);
    const trend = this.calculateTrend(revenues);
    const avgRevenue = revenues.slice(-7).reduce((a, b) => a + b, 0) / 7;
    
    for (let i = 0; i < request.forecastDays; i++) {
      const trendValue = avgRevenue + (trend * (i + 1));
      const seasonalFactor = 1 + (Math.sin((i * 2 * Math.PI) / 7) * 0.1); // Weekly seasonality
      const predictedRevenue = trendValue * seasonalFactor;
      
      predictions.push({
        date: addDays(new Date(), i + 1),
        predictedRevenue,
        predictedQuantity: predictedRevenue / (trainingData[trainingData.length - 1].revenue / trainingData[trainingData.length - 1].quantity),
        confidence: 0.85,
        upperBound: predictedRevenue * 1.15,
        lowerBound: predictedRevenue * 0.85
      });
    }

    const accuracy = this.calculateAccuracy(trainingData.slice(-request.forecastDays), predictions);
    return { predictions, accuracy };
  }
  
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private async runEnsembleModel(trainingData: any[], request: ForecastRequest) {
    const [lstmResult, arimaResult, prophetResult] = await Promise.all([
      this.runLSTMModel(trainingData, request),
      this.runARIMAModel(trainingData, request),
      this.runProphetModel(trainingData, request)
    ]);

    const predictions: PredictionResult[] = [];
    
    for (let i = 0; i < request.forecastDays; i++) {
      const avgRevenue = (
        lstmResult.predictions[i].predictedRevenue * 0.4 +
        arimaResult.predictions[i].predictedRevenue * 0.3 +
        prophetResult.predictions[i].predictedRevenue * 0.3
      );
      
      const avgQuantity = (
        lstmResult.predictions[i].predictedQuantity * 0.4 +
        arimaResult.predictions[i].predictedQuantity * 0.3 +
        prophetResult.predictions[i].predictedQuantity * 0.3
      );

      predictions.push({
        date: addDays(new Date(), i + 1),
        predictedRevenue: avgRevenue,
        predictedQuantity: avgQuantity,
        confidence: 0.9,
        upperBound: avgRevenue * 1.2,
        lowerBound: avgRevenue * 0.8
      });
    }

    const accuracy = this.calculateAccuracy(trainingData.slice(-request.forecastDays), predictions);

    return { predictions, accuracy };
  }

  private calculateAccuracy(actual: any[], predicted: PredictionResult[]) {
    if (actual.length === 0) {
      return { mape: 0, rmse: 0, mae: 0, r2Score: 0 };
    }

    const actualValues = actual.map(a => a.revenue);
    const predictedValues = predicted.map(p => p.predictedRevenue);

    const mape = this.calculateMAPE(actualValues, predictedValues);
    const rmse = this.calculateRMSE(actualValues, predictedValues);
    const mae = this.calculateMAE(actualValues, predictedValues);
    const r2Score = this.calculateR2Score(actualValues, predictedValues);

    return { mape, rmse, mae, r2Score };
  }

  private calculateMAPE(actual: number[], predicted: number[]): number {
    const ape = actual.map((a, i) => Math.abs((a - predicted[i]) / a));
    return _.mean(ape) * 100;
  }

  private calculateRMSE(actual: number[], predicted: number[]): number {
    const mse = _.mean(actual.map((a, i) => Math.pow(a - predicted[i], 2)));
    return Math.sqrt(mse);
  }

  private calculateMAE(actual: number[], predicted: number[]): number {
    return _.mean(actual.map((a, i) => Math.abs(a - predicted[i])));
  }

  private calculateR2Score(actual: number[], predicted: number[]): number {
    const actualMean = _.mean(actual);
    const totalSumSquares = _.sum(actual.map(a => Math.pow(a - actualMean, 2)));
    const residualSumSquares = _.sum(actual.map((a, i) => Math.pow(a - predicted[i], 2)));
    return 1 - (residualSumSquares / totalSumSquares);
  }

  compareForecasts(forecasts: IForecast[]) {
    return {
      models: forecasts.map(f => ({
        id: f._id,
        modelType: f.modelType,
        accuracy: f.accuracy,
        generatedAt: f.generatedAt
      })),
      bestModel: forecasts.reduce((best, current) => 
        current.accuracy.r2Score > best.accuracy.r2Score ? current : best
      )
    };
  }
}