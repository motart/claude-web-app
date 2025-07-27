export interface RetrainingConfig {
  storeId: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'adaptive';
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6, for weekly
    dayOfMonth?: number; // 1-31, for monthly
  };
  triggers: {
    accuracyThreshold: number; // Retrain if accuracy drops below this
    dataVolumeThreshold: number; // Retrain when new data points exceed this
    timeThreshold: number; // Days since last training
    seasonalEvents: boolean; // Retrain before known seasonal events
  };
  validation: {
    backtestPeriods: number;
    holdoutPercentage: number;
    crossValidationFolds: number;
    minimumAccuracy: number; // Don't deploy if below this
  };
  notifications: {
    email: string[];
    slack?: string;
    webhook?: string;
  };
}

export interface ModelDriftDetection {
  storeId: string;
  timestamp: string;
  metrics: {
    prediction_drift: number;
    data_drift: number;
    concept_drift: number;
  };
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  affected_features: string[];
}

export interface TrainingJob {
  id: string;
  storeId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  modelType: string;
  performance: {
    accuracy: number;
    mape: number;
    rmse: number;
    r2Score: number;
  };
  logs: string[];
  errorMessage?: string;
}

export class AutomatedTrainingPipeline {
  private retrainingConfigs: Map<string, RetrainingConfig> = new Map();
  private activeJobs: Map<string, TrainingJob> = new Map();

  async setupAutomatedRetraining(config: RetrainingConfig): Promise<{ success: boolean; jobId: string }> {
    try {
      const response = await fetch('/api/training/setup-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      
      if (result.success) {
        this.retrainingConfigs.set(config.storeId, config);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to setup automated retraining:', error);
      throw error;
    }
  }

  async detectModelDrift(storeId: string): Promise<ModelDriftDetection> {
    try {
      const response = await fetch(`/api/training/detect-drift/${storeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to detect model drift:', error);
      throw error;
    }
  }

  async triggerRetraining(storeId: string, reason: string): Promise<TrainingJob> {
    try {
      const response = await fetch('/api/training/trigger-retraining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, reason })
      });

      const job = await response.json();
      this.activeJobs.set(job.id, job);
      
      return job;
    } catch (error) {
      console.error('Failed to trigger retraining:', error);
      throw error;
    }
  }

  async getTrainingStatus(jobId: string): Promise<TrainingJob> {
    try {
      const response = await fetch(`/api/training/status/${jobId}`);
      const job = await response.json();
      
      this.activeJobs.set(jobId, job);
      return job;
    } catch (error) {
      console.error('Failed to get training status:', error);
      throw error;
    }
  }

  async getTrainingHistory(storeId: string): Promise<TrainingJob[]> {
    try {
      const response = await fetch(`/api/training/history/${storeId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get training history:', error);
      throw error;
    }
  }

  async validateModel(storeId: string, modelId: string): Promise<{
    isValid: boolean;
    performance: any;
    recommendations: string[];
  }> {
    try {
      const response = await fetch('/api/training/validate-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, modelId })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to validate model:', error);
      throw error;
    }
  }

  async deployModel(storeId: string, modelId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/training/deploy-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, modelId })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to deploy model:', error);
      throw error;
    }
  }

  async rollbackModel(storeId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/training/rollback-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to rollback model:', error);
      throw error;
    }
  }

  // Adaptive retraining based on performance monitoring
  async monitorAndAdaptRetraining(storeId: string): Promise<void> {
    try {
      // Check current model performance
      const currentPerformance = await this.getCurrentModelPerformance(storeId);
      const config = this.retrainingConfigs.get(storeId);
      
      if (!config) return;

      // Detect drift
      const driftDetection = await this.detectModelDrift(storeId);
      
      // Check if retraining is needed
      const shouldRetrain = this.shouldTriggerRetraining(
        currentPerformance,
        driftDetection,
        config
      );

      if (shouldRetrain.trigger) {
        await this.triggerRetraining(storeId, shouldRetrain.reason);
      }
    } catch (error) {
      console.error('Failed to monitor and adapt retraining:', error);
    }
  }

  private async getCurrentModelPerformance(storeId: string): Promise<any> {
    try {
      const response = await fetch(`/api/forecast/current-performance/${storeId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get current model performance:', error);
      return null;
    }
  }

  private shouldTriggerRetraining(
    performance: any,
    drift: ModelDriftDetection,
    config: RetrainingConfig
  ): { trigger: boolean; reason: string } {
    // Check accuracy threshold
    if (performance?.accuracy < config.triggers.accuracyThreshold) {
      return {
        trigger: true,
        reason: `Accuracy dropped below threshold: ${performance.accuracy} < ${config.triggers.accuracyThreshold}`
      };
    }

    // Check drift severity
    if (drift.severity === 'high') {
      return {
        trigger: true,
        reason: `High model drift detected: ${drift.recommendation}`
      };
    }

    // Check data volume threshold
    if (performance?.newDataPoints > config.triggers.dataVolumeThreshold) {
      return {
        trigger: true,
        reason: `New data volume threshold exceeded: ${performance.newDataPoints} > ${config.triggers.dataVolumeThreshold}`
      };
    }

    // Check time threshold
    const daysSinceLastTraining = this.calculateDaysSinceLastTraining(performance?.lastTrainingDate);
    if (daysSinceLastTraining > config.triggers.timeThreshold) {
      return {
        trigger: true,
        reason: `Time threshold exceeded: ${daysSinceLastTraining} days since last training`
      };
    }

    return { trigger: false, reason: '' };
  }

  private calculateDaysSinceLastTraining(lastTrainingDate: string): number {
    if (!lastTrainingDate) return Infinity;
    
    const now = new Date();
    const lastTraining = new Date(lastTrainingDate);
    const diffTime = Math.abs(now.getTime() - lastTraining.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Advanced A/B testing for model deployment
  async setupABTest(config: {
    storeId: string;
    modelA: string; // Current model
    modelB: string; // New model
    trafficSplit: number; // Percentage of traffic to new model (0-100)
    duration: number; // Test duration in days
    successMetrics: string[];
  }): Promise<{ testId: string }> {
    try {
      const response = await fetch('/api/training/setup-ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to setup A/B test:', error);
      throw error;
    }
  }

  async getABTestResults(testId: string): Promise<{
    status: 'running' | 'completed' | 'stopped';
    results: {
      modelA: { accuracy: number; mape: number; conversions: number };
      modelB: { accuracy: number; mape: number; conversions: number };
      winner: 'A' | 'B' | 'inconclusive';
      confidence: number;
    };
  }> {
    try {
      const response = await fetch(`/api/training/ab-test-results/${testId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get A/B test results:', error);
      throw error;
    }
  }

  // Model versioning and lineage tracking
  async getModelLineage(storeId: string): Promise<{
    models: Array<{
      id: string;
      version: string;
      createdAt: string;
      performance: any;
      parentModel?: string;
      deployedAt?: string;
      retiredAt?: string;
    }>;
    currentModel: string;
  }> {
    try {
      const response = await fetch(`/api/training/model-lineage/${storeId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get model lineage:', error);
      throw error;
    }
  }

  // Real-time monitoring and alerting
  async setupMonitoring(storeId: string, config: {
    metrics: string[];
    thresholds: Record<string, number>;
    alertChannels: string[];
    checkInterval: number; // minutes
  }): Promise<{ monitorId: string }> {
    try {
      const response = await fetch('/api/training/setup-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, config })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to setup monitoring:', error);
      throw error;
    }
  }

  // Explanation and interpretability
  async getModelExplanation(storeId: string, predictionId: string): Promise<{
    globalImportance: Record<string, number>;
    localImportance: Record<string, number>;
    shap_values: number[];
    lime_explanation: any;
    counterfactuals: any[];
  }> {
    try {
      const response = await fetch(`/api/training/model-explanation/${storeId}/${predictionId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get model explanation:', error);
      throw error;
    }
  }
}

export const automatedTraining = new AutomatedTrainingPipeline();