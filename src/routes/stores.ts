import express from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Store } from '../models/Store';

const router = express.Router();

// Validation schemas
const createStoreSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  type: Joi.string().valid('brick_mortar', 'shopify', 'amazon', 'woocommerce', 'custom').required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default('US')
  }).when('type', { is: 'brick_mortar', then: Joi.required(), otherwise: Joi.optional() }),
  contact: Joi.object({
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    website: Joi.string().uri().optional()
  }).optional(),
  settings: Joi.object({
    timezone: Joi.string().default('America/New_York'),
    currency: Joi.string().length(3).default('USD'),
    taxRate: Joi.number().min(0).max(1).optional()
  }).optional(),
  metadata: Joi.object({
    storeSize: Joi.string().valid('small', 'medium', 'large').optional(),
    category: Joi.string().optional(),
    openingDate: Joi.date().optional(),
    employees: Joi.number().min(1).optional()
  }).optional()
});

const updateStoreSchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().default('US')
  }).optional(),
  contact: Joi.object({
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    website: Joi.string().uri().optional()
  }).optional(),
  settings: Joi.object({
    timezone: Joi.string().optional(),
    currency: Joi.string().length(3).optional(),
    taxRate: Joi.number().min(0).max(1).optional()
  }).optional(),
  metadata: Joi.object({
    storeSize: Joi.string().valid('small', 'medium', 'large').optional(),
    category: Joi.string().optional(),
    openingDate: Joi.date().optional(),
    employees: Joi.number().min(1).optional()
  }).optional(),
  isActive: Joi.boolean().optional()
});

// GET /stores - Get all stores for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { includeInactive = 'false', type } = req.query;
    
    let query: any = { userId: req.user!._id };
    
    if (includeInactive !== 'true') {
      query.isActive = true;
    }
    
    if (type) {
      query.type = type;
    }
    
    const stores = await Store.find(query).sort({ createdAt: -1 });
    
    res.json({
      stores,
      total: stores.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /stores/:id - Get a specific store
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(store);
  } catch (error) {
    next(error);
  }
});

// POST /stores - Create a new store
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = createStoreSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    
    // Check if store name already exists for this user
    const existingStore = await Store.findOne({
      userId: req.user!._id,
      name: value.name,
      isActive: true
    });
    
    if (existingStore) {
      return res.status(400).json({ 
        error: 'A store with this name already exists' 
      });
    }
    
    const store = new Store({
      ...value,
      userId: req.user!._id
    });
    
    await store.save();
    
    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    next(error);
  }
});

// PUT /stores/:id - Update a store
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = updateStoreSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    
    const store = await Store.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Check for name conflicts if name is being updated
    if (value.name && value.name !== store.name) {
      const existingStore = await Store.findOne({
        userId: req.user!._id,
        name: value.name,
        isActive: true,
        _id: { $ne: store._id }
      });
      
      if (existingStore) {
        return res.status(400).json({ 
          error: 'A store with this name already exists' 
        });
      }
    }
    
    Object.assign(store, value);
    await store.save();
    
    res.json({
      message: 'Store updated successfully',
      store
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /stores/:id - Soft delete a store
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      userId: req.user!._id
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    store.isActive = false;
    await store.save();
    
    res.json({
      message: 'Store deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /stores/templates/csv - Download CSV template for brick and mortar stores
router.get('/templates/csv', authenticate, (req: AuthRequest, res) => {
  const csvTemplate = [
    'date,productName,quantity,revenue,cost,category,sku,productId',
    '2024-01-01,Sample Product,5,100.00,60.00,Electronics,SKU-001,PROD-001',
    '2024-01-02,Another Product,3,75.50,45.00,Clothing,SKU-002,PROD-002'
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sales-data-template.csv"');
  res.send(csvTemplate);
});

export { router as storeRoutes };