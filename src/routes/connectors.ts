import express from 'express';
import Joi from 'joi';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { ShopifyConnector } from '../services/connectors/ShopifyConnector';
import { AmazonConnector } from '../services/connectors/AmazonConnector';
import { DataSyncService } from '../services/DataSyncService';

const router = express.Router();

const shopifyConnectSchema = Joi.object({
  storeName: Joi.string().required(),
  shopDomain: Joi.string().required(),
  accessToken: Joi.string().required()
});

const amazonConnectSchema = Joi.object({
  storeName: Joi.string().required(),
  sellerId: Joi.string().required(),
  accessKey: Joi.string().required(),
  secretKey: Joi.string().required(),
  marketplaceId: Joi.string().required()
});

router.post('/shopify/connect', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = shopifyConnectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { storeName, shopDomain, accessToken } = value;

    const shopifyConnector = new ShopifyConnector();
    const isValid = await shopifyConnector.validateConnection(shopDomain, accessToken);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Shopify credentials' });
    }

    const storeId = `shopify_${shopDomain}`;
    
    await User.findByIdAndUpdate(req.user!._id, {
      $push: {
        connectedStores: {
          platform: 'shopify',
          storeId,
          storeName,
          credentials: {
            shopDomain,
            accessToken
          },
          isActive: true
        }
      }
    });

    res.json({
      message: 'Shopify store connected successfully',
      storeId,
      storeName
    });
  } catch (error) {
    next(error);
  }
});

router.post('/amazon/connect', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = amazonConnectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { storeName, sellerId, accessKey, secretKey, marketplaceId } = value;

    const amazonConnector = new AmazonConnector();
    const isValid = await amazonConnector.validateConnection({
      sellerId,
      accessKey,
      secretKey,
      marketplaceId
    });
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Amazon credentials' });
    }

    const storeId = `amazon_${sellerId}`;
    
    await User.findByIdAndUpdate(req.user!._id, {
      $push: {
        connectedStores: {
          platform: 'amazon',
          storeId,
          storeName,
          credentials: {
            sellerId,
            accessKey,
            secretKey,
            marketplaceId
          },
          isActive: true
        }
      }
    });

    res.json({
      message: 'Amazon store connected successfully',
      storeId,
      storeName
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sync/:storeId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate } = req.body;

    const user = await User.findById(req.user!._id);
    const store = user?.connectedStores.find(s => s.storeId === storeId && s.isActive);
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found or inactive' });
    }

    const dataSyncService = new DataSyncService();
    const result = await dataSyncService.syncStoreData({
      userId: req.user!._id.toString(),
      store,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    res.json({
      message: 'Data sync completed',
      result
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stores', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!._id);
    const stores = user?.connectedStores.filter(s => s.isActive) || [];

    res.json({ stores });
  } catch (error) {
    next(error);
  }
});

router.delete('/stores/:storeId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storeId } = req.params;

    await User.findByIdAndUpdate(req.user!._id, {
      $set: {
        'connectedStores.$[elem].isActive': false
      }
    }, {
      arrayFilters: [{ 'elem.storeId': storeId }]
    });

    res.json({ message: 'Store disconnected successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as connectorRoutes };