import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { SalesData } from '../models/SalesData';
import { DataProcessor } from '../services/DataProcessor';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const salesDataSchema = Joi.object({
  storeId: Joi.string().required(),
  platform: Joi.string().valid('shopify', 'amazon', 'custom').required(),
  productId: Joi.string(),
  productName: Joi.string(),
  category: Joi.string(),
  sku: Joi.string(),
  date: Joi.date().required(),
  quantity: Joi.number().min(0).required(),
  revenue: Joi.number().min(0).required(),
  cost: Joi.number().min(0),
  currency: Joi.string().default('USD'),
  metadata: Joi.object().default({})
});

router.post('/upload-csv', authenticate, upload.single('salesData'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { storeId, platform } = req.body;
    if (!storeId || !platform) {
      return res.status(400).json({ error: 'storeId and platform are required' });
    }

    const results: any[] = [];
    const errors: any[] = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const validData = [];
          
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const { error, value } = salesDataSchema.validate({
              ...row,
              storeId,
              platform,
              userId: req.user!._id,
              date: new Date(row.date),
              quantity: parseFloat(row.quantity),
              revenue: parseFloat(row.revenue),
              cost: row.cost ? parseFloat(row.cost) : undefined
            });

            if (error) {
              errors.push({ row: i + 1, error: error.details[0].message });
            } else {
              validData.push(value);
            }
          }

          if (validData.length > 0) {
            await SalesData.insertMany(validData);
          }

          fs.unlinkSync(req.file!.path);

          res.json({
            message: 'Data processed successfully',
            imported: validData.length,
            errors: errors.length,
            errorDetails: errors
          });
        } catch (error) {
          fs.unlinkSync(req.file!.path);
          next(error);
        }
      });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

router.post('/manual-entry', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = salesDataSchema.validate({
      ...req.body,
      userId: req.user!._id
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const salesData = new SalesData(value);
    await salesData.save();

    res.status(201).json({
      message: 'Sales data created successfully',
      data: salesData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sales-data', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storeId, startDate, endDate, limit = 100, page = 1 } = req.query;
    
    const filter: any = { userId: req.user!._id };
    
    if (storeId) filter.storeId = storeId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [data, total] = await Promise.all([
      SalesData.find(filter)
        .sort({ date: -1 })
        .limit(Number(limit))
        .skip(skip),
      SalesData.countDocuments(filter)
    ]);

    res.json({
      data,
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

router.get('/analytics', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storeId, startDate, endDate } = req.query;
    
    const dataProcessor = new DataProcessor();
    const analytics = await dataProcessor.generateAnalytics(
      req.user!._id.toString(),
      storeId as string,
      startDate as string,
      endDate as string
    );

    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export { router as dataIngestionRoutes };