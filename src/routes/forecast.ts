import express from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Forecast } from '../models/Forecast';
import { MLService } from '../services/MLService';

const router = express.Router();

const forecastRequestSchema = Joi.object({
  storeId: Joi.string().required(),
  modelType: Joi.string().valid('arima', 'lstm', 'prophet', 'ensemble').default('ensemble'),
  forecastType: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
  forecastDays: Joi.number().min(1).max(365).default(30),
  trainingPeriodDays: Joi.number().min(30).max(1095).default(365)
});

router.post('/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = forecastRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { storeId, modelType, forecastType, forecastDays, trainingPeriodDays } = value;

    const mlService = new MLService();
    const forecast = await mlService.generateForecast({
      userId: req.user!._id.toString(),
      storeId,
      modelType,
      forecastType,
      forecastDays,
      trainingPeriodDays
    });

    res.json({
      message: 'Forecast generated successfully',
      forecast
    });
  } catch (error) {
    next(error);
  }
});

router.get('/list', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storeId, modelType, limit = 10, page = 1 } = req.query;
    
    const filter: any = { userId: req.user!._id, isActive: true };
    
    if (storeId) filter.storeId = storeId;
    if (modelType) filter.modelType = modelType;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [forecasts, total] = await Promise.all([
      Forecast.find(filter)
        .sort({ generatedAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Forecast.countDocuments(filter)
    ]);

    res.json({
      forecasts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const forecast = await Forecast.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });

    if (!forecast) {
      return res.status(404).json({ error: 'Forecast not found' });
    }

    res.json({ forecast });
  } catch (error) {
    next(error);
  }
});

router.post('/compare', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { forecastIds } = req.body;
    
    if (!Array.isArray(forecastIds) || forecastIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 forecast IDs required for comparison' });
    }

    const forecasts = await Forecast.find({
      _id: { $in: forecastIds },
      userId: req.user!._id
    });

    if (forecasts.length !== forecastIds.length) {
      return res.status(404).json({ error: 'One or more forecasts not found' });
    }

    const mlService = new MLService();
    const comparison = mlService.compareForecasts(forecasts);

    res.json({ comparison });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const forecast = await Forecast.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { isActive: false },
      { new: true }
    );

    if (!forecast) {
      return res.status(404).json({ error: 'Forecast not found' });
    }

    res.json({ message: 'Forecast deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as forecastRoutes };