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
  userId: Joi.alternatives().try(Joi.string(), Joi.object()),
  storeId: Joi.string().required(),
  platform: Joi.string().valid('shopify', 'amazon', 'woocommerce', 'brick_mortar', 'custom').required(),
  productId: Joi.string().optional(),
  productName: Joi.string().required(),
  category: Joi.string().optional(),
  sku: Joi.string().optional(),
  date: Joi.date().required(),
  quantity: Joi.number().min(0).required(),
  revenue: Joi.number().min(0).required(),
  cost: Joi.number().min(0).optional(),
  currency: Joi.string().default('USD'),
  metadata: Joi.object().default({})
});

router.post('/upload-csv', authenticate, upload.single('salesData'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
    const isValidFile = allowedMimeTypes.includes(req.file.mimetype) || ['csv', 'xls', 'xlsx'].includes(fileExtension || '');
    
    if (!isValidFile) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid file type. Please upload a CSV or Excel file.' });
    }

    const { storeId, platform } = req.body;
    if (!storeId || !platform) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'storeId and platform are required' });
    }

    console.log(`Processing file upload: ${req.file.originalname} (${req.file.size} bytes)`);

    const results: any[] = [];
    const errors: any[] = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Trim whitespace from all values
        const cleanedData = Object.keys(data).reduce((acc: any, key) => {
          acc[key.trim()] = typeof data[key] === 'string' ? data[key].trim() : data[key];
          return acc;
        }, {});
        results.push(cleanedData);
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${results.length} rows from CSV`);
          const validData = [];
          
          // Validate required headers
          if (results.length === 0) {
            fs.unlinkSync(req.file!.path);
            return res.status(400).json({ error: 'CSV file is empty or has no valid data rows' });
          }

          const requiredColumns = ['date', 'productName', 'quantity', 'revenue'];
          const firstRow = results[0];
          const missingColumns = requiredColumns.filter(col => !(col in firstRow));
          
          if (missingColumns.length > 0) {
            fs.unlinkSync(req.file!.path);
            return res.status(400).json({ 
              error: `Missing required columns: ${missingColumns.join(', ')}. Required columns are: ${requiredColumns.join(', ')}`
            });
          }
          
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            
            // Skip empty rows
            if (!row.date && !row.productName && !row.quantity && !row.revenue) {
              continue;
            }

            const processedRow = {
              ...row,
              storeId,
              platform,
              userId: req.user!._id,
              date: new Date(row.date),
              quantity: parseFloat(row.quantity) || 0,
              revenue: parseFloat(row.revenue) || 0,
              cost: row.cost ? parseFloat(row.cost) : undefined,
              productId: row.productId || row.sku || `${row.productName}-${Date.now()}-${i}`,
              category: row.category || 'Uncategorized'
            };

            const { error, value } = salesDataSchema.validate(processedRow);

            if (error) {
              errors.push({ 
                row: i + 1, 
                data: row,
                error: error.details[0].message 
              });
            } else {
              validData.push(value);
            }
          }

          let insertedCount = 0;
          if (validData.length > 0) {
            try {
              const insertResult = await SalesData.insertMany(validData, { ordered: false });
              insertedCount = insertResult.length;
              console.log(`Successfully inserted ${insertedCount} records`);
            } catch (insertError: any) {
              console.error('Insert error:', insertError);
              // Handle duplicate key errors or other insert issues
              if (insertError.code === 11000) {
                errors.push({ error: 'Some records already exist in the database' });
              }
              insertedCount = validData.length - (insertError.writeErrors?.length || 0);
            }
          }

          fs.unlinkSync(req.file!.path);

          const response = {
            message: insertedCount > 0 ? 'Data processed successfully' : 'No valid data could be imported',
            imported: insertedCount,
            total: results.length,
            errors: errors.length,
            errorDetails: errors.slice(0, 10), // Limit error details to first 10
            summary: {
              totalRows: results.length,
              validRows: validData.length,
              importedRows: insertedCount,
              errorRows: errors.length
            }
          };

          if (insertedCount === 0 && errors.length > 0) {
            return res.status(400).json(response);
          }

          res.json(response);
        } catch (processError) {
          console.error('Processing error:', processError);
          fs.unlinkSync(req.file!.path);
          next(processError);
        }
      })
      .on('error', (csvError) => {
        console.error('CSV parsing error:', csvError);
        fs.unlinkSync(req.file!.path);
        res.status(400).json({ 
          error: 'Failed to parse CSV file. Please check the file format and try again.',
          details: csvError.message 
        });
      });
  } catch (error) {
    console.error('Upload error:', error);
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