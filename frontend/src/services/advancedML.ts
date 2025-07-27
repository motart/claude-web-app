import { SalesDataPoint, EnhancedFeatures, featureEngineer } from './mlFeatures';

export interface ModelConfig {
  name: string;
  type: 'ensemble' | 'neural' | 'gradient_boost' | 'time_series';
  hyperparameters: Record<string, any>;
  weight: number; // For ensemble voting
}

export interface PredictionResult {
  date: string;
  predictedRevenue: number;
  predictedQuantity: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  contributingFactors: Record<string, number>;
  modelBreakdown: Record<string, number>;
}

export interface ModelPerformance {
  mape: number;        // Mean Absolute Percentage Error
  rmse: number;        // Root Mean Square Error
  mae: number;         // Mean Absolute Error
  r2Score: number;     // R-squared
  accuracy: number;    // Custom accuracy metric
  backtest_periods: number;
}

export class AdvancedMLPipeline {
  private models: ModelConfig[] = [
    {
      name: 'XGBoost',
      type: 'gradient_boost',
      weight: 0.3,
      hyperparameters: {
        n_estimators: 1000,
        max_depth: 8,
        learning_rate: 0.01,
        subsample: 0.8,
        colsample_bytree: 0.8,
        reg_alpha: 0.1,
        reg_lambda: 1.0
      }
    },
    {
      name: 'LightGBM',
      type: 'gradient_boost',
      weight: 0.25,
      hyperparameters: {
        n_estimators: 1000,
        max_depth: 10,
        learning_rate: 0.01,
        num_leaves: 31,
        subsample: 0.8,
        feature_fraction: 0.8
      }
    },
    {
      name: 'TransformerModel',
      type: 'neural',
      weight: 0.25,
      hyperparameters: {
        seq_length: 60,
        d_model: 128,
        nhead: 8,
        num_layers: 6,
        dropout: 0.1,
        epochs: 100,
        batch_size: 32
      }
    },
    {
      name: 'Prophet_Enhanced',
      type: 'time_series',
      weight: 0.2,
      hyperparameters: {
        seasonality_mode: 'multiplicative',
        holidays_prior_scale: 10,
        seasonality_prior_scale: 10,
        changepoint_prior_scale: 0.05,
        interval_width: 0.95
      }
    }
  ];

  async trainEnsemble(data: SalesDataPoint[], validationSplit: number = 0.2): Promise<ModelPerformance> {
    // Feature engineering
    const features = featureEngineer.generateFeatures(data);
    
    // Split data
    const splitIndex = Math.floor(data.length * (1 - validationSplit));
    const trainData = data.slice(0, splitIndex);
    const trainFeatures = features.slice(0, splitIndex);
    const validData = data.slice(splitIndex);
    const validFeatures = features.slice(splitIndex);

    // Train individual models (simulated - in production, call backend ML service)
    const modelPerformances = await this.trainIndividualModels(trainData, trainFeatures);
    
    // Validate ensemble
    const predictions = await this.predict(validData, validFeatures);
    const performance = this.evaluatePerformance(validData, predictions);

    return performance;
  }

  async predict(data: SalesDataPoint[], features?: EnhancedFeatures[]): Promise<PredictionResult[]> {
    if (!features) {
      features = featureEngineer.generateFeatures(data);
    }

    const predictions: PredictionResult[] = [];

    for (let i = 0; i < data.length; i++) {
      const feature = features[i];
      const dataPoint = data[i];

      // Simulate ensemble prediction (in production, call ML service)
      const modelPredictions = await this.getModelPredictions(feature, dataPoint);
      
      // Weighted ensemble
      let weightedRevenue = 0;
      let weightedQuantity = 0;
      let totalWeight = 0;
      const modelBreakdown: Record<string, number> = {};

      this.models.forEach(model => {
        const prediction = modelPredictions[model.name];
        weightedRevenue += prediction.revenue * model.weight;
        weightedQuantity += prediction.quantity * model.weight;
        totalWeight += model.weight;
        modelBreakdown[model.name] = prediction.revenue;
      });

      const finalRevenue = weightedRevenue / totalWeight;
      const finalQuantity = weightedQuantity / totalWeight;

      // Calculate confidence and bounds
      const variance = this.calculatePredictionVariance(modelPredictions);
      const confidence = Math.max(0.7, 1 - variance / finalRevenue);
      const margin = finalRevenue * (1 - confidence) * 2;

      predictions.push({
        date: dataPoint.date,
        predictedRevenue: finalRevenue,
        predictedQuantity: finalQuantity,
        confidence,
        upperBound: finalRevenue + margin,
        lowerBound: Math.max(0, finalRevenue - margin),
        contributingFactors: this.analyzeFeatureImportance(feature),
        modelBreakdown
      });
    }

    return predictions;
  }

  private async trainIndividualModels(data: SalesDataPoint[], features: EnhancedFeatures[]): Promise<Record<string, any>> {
    // Simulated training - in production, this calls backend ML training service
    const performances: Record<string, any> = {};

    for (const model of this.models) {
      // Simulate training time and performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      performances[model.name] = {
        trainAccuracy: 0.92 + Math.random() * 0.06, // 92-98%
        validAccuracy: 0.88 + Math.random() * 0.06, // 88-94%
        mape: 2 + Math.random() * 3, // 2-5%
        rmse: 100 + Math.random() * 50
      };
    }

    return performances;
  }

  private async getModelPredictions(feature: EnhancedFeatures, dataPoint: SalesDataPoint): Promise<Record<string, { revenue: number; quantity: number }>> {
    // Simulated model predictions - in production, calls trained models
    const predictions: Record<string, { revenue: number; quantity: number }> = {};

    for (const model of this.models) {
      let baseRevenue = 1000; // Base prediction
      
      // Apply feature influences (simplified)
      baseRevenue *= (1 + feature.revenue_trend_7d * 0.5);
      baseRevenue *= (1 + feature.seasonality_weekly * 0.1);
      baseRevenue *= (1 + feature.seasonality_monthly * 0.15);
      baseRevenue *= feature.isWeekend ? 1.2 : 1.0;
      baseRevenue *= feature.isHoliday ? 1.5 : 1.0;

      // Add model-specific variance
      const variance = 0.05 + Math.random() * 0.1;
      const modelRevenue = baseRevenue * (1 + (Math.random() - 0.5) * variance);

      predictions[model.name] = {
        revenue: Math.max(0, modelRevenue),
        quantity: Math.max(0, modelRevenue / (dataPoint.price || 50))
      };
    }

    return predictions;
  }

  private calculatePredictionVariance(predictions: Record<string, { revenue: number; quantity: number }>): number {
    const revenues = Object.values(predictions).map(p => p.revenue);
    const mean = revenues.reduce((sum, val) => sum + val, 0) / revenues.length;
    const variance = revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length;
    return Math.sqrt(variance);
  }

  private analyzeFeatureImportance(feature: EnhancedFeatures): Record<string, number> {
    return {
      trend_7d: Math.abs(feature.revenue_trend_7d) * 0.3,
      trend_30d: Math.abs(feature.revenue_trend_30d) * 0.25,
      seasonality: (Math.abs(feature.seasonality_weekly) + Math.abs(feature.seasonality_monthly)) * 0.2,
      weekend_effect: feature.isWeekend ? 0.15 : 0,
      holiday_effect: feature.isHoliday ? 0.1 : 0
    };
  }

  private evaluatePerformance(actual: SalesDataPoint[], predicted: PredictionResult[]): ModelPerformance {
    let totalError = 0;
    let totalSquaredError = 0;
    let totalActual = 0;
    let totalPredicted = 0;
    let totalAbsoluteError = 0;

    for (let i = 0; i < actual.length; i++) {
      const actualRevenue = actual[i].revenue;
      const predictedRevenue = predicted[i].predictedRevenue;
      
      const error = actualRevenue - predictedRevenue;
      const percentError = Math.abs(error / actualRevenue) * 100;
      
      totalError += percentError;
      totalSquaredError += error * error;
      totalAbsoluteError += Math.abs(error);
      totalActual += actualRevenue;
      totalPredicted += predictedRevenue;
    }

    const mape = totalError / actual.length;
    const rmse = Math.sqrt(totalSquaredError / actual.length);
    const mae = totalAbsoluteError / actual.length;
    
    // R-squared calculation
    const actualMean = totalActual / actual.length;
    let ssTotal = 0;
    let ssRes = 0;
    
    for (let i = 0; i < actual.length; i++) {
      ssTotal += Math.pow(actual[i].revenue - actualMean, 2);
      ssRes += Math.pow(actual[i].revenue - predicted[i].predictedRevenue, 2);
    }
    
    const r2Score = 1 - (ssRes / ssTotal);
    const accuracy = Math.max(0, (100 - mape) / 100);

    return {
      mape,
      rmse,
      mae,
      r2Score,
      accuracy,
      backtest_periods: actual.length
    };
  }

  // Advanced model optimization
  async optimizeHyperparameters(data: SalesDataPoint[], trials: number = 50): Promise<ModelConfig[]> {
    // Simulated hyperparameter optimization using techniques like Optuna/Hyperopt
    const optimizedModels: ModelConfig[] = [];

    for (const model of this.models) {
      const bestParams = await this.bayesianOptimization(model, data, trials);
      optimizedModels.push({
        ...model,
        hyperparameters: bestParams
      });
    }

    return optimizedModels;
  }

  private async bayesianOptimization(model: ModelConfig, data: SalesDataPoint[], trials: number): Promise<Record<string, any>> {
    // Simulated Bayesian optimization
    let bestParams = { ...model.hyperparameters };
    let bestScore = 0;

    for (let i = 0; i < trials; i++) {
      const testParams = this.perturbParameters(model.hyperparameters);
      const score = await this.evaluateParameters(testParams, data);
      
      if (score > bestScore) {
        bestScore = score;
        bestParams = testParams;
      }
    }

    return bestParams;
  }

  private perturbParameters(params: Record<string, any>): Record<string, any> {
    const newParams = { ...params };
    
    // Randomly adjust parameters within reasonable bounds
    Object.keys(newParams).forEach(key => {
      if (typeof newParams[key] === 'number') {
        const factor = 0.8 + Math.random() * 0.4; // ±20% variation
        newParams[key] = newParams[key] * factor;
      }
    });

    return newParams;
  }

  private async evaluateParameters(params: Record<string, any>, data: SalesDataPoint[]): Promise<number> {
    // Simulated parameter evaluation
    return 0.85 + Math.random() * 0.1; // 85-95% accuracy
  }
}

export const mlPipeline = new AdvancedMLPipeline();