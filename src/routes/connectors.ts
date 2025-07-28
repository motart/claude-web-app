import express from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { ShopifyConnector } from '../services/connectors/ShopifyConnector';
import { AmazonConnector } from '../services/connectors/AmazonConnector';
import { DataSyncService } from '../services/DataSyncService';

const router = express.Router();

// Environment variables for Shopify OAuth
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || 'demo_client_id';
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || 'demo_client_secret';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

const shopifyConnectSchema = Joi.object({
  storeName: Joi.string().required(),
  shopDomain: Joi.string().required(),
  accessToken: Joi.string().required()
});

const shopifyOAuthSchema = Joi.object({
  shop: Joi.string().required(),
  storeName: Joi.string().required()
});

const amazonConnectSchema = Joi.object({
  storeName: Joi.string().required(),
  sellerId: Joi.string().required(),
  accessKey: Joi.string().required(),
  secretKey: Joi.string().required(),
  marketplaceId: Joi.string().required()
});

// Temporary storage for OAuth states (in production, use Redis or DB)
const oauthStates = new Map<string, { userId: string; storeName: string; timestamp: number }>();

// Shopify OAuth initiation
router.post('/shopify/oauth/init', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = shopifyOAuthSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { shop, storeName } = value;
    
    // Validate shop domain format
    const shopDomain = shop.replace('.myshopify.com', '');
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]$/.test(shopDomain)) {
      return res.status(400).json({ error: 'Invalid shop domain format' });
    }

    // Generate state for OAuth security
    const state = crypto.randomBytes(32).toString('hex');
    oauthStates.set(state, { 
      userId: req.user!._id.toString(), 
      storeName,
      timestamp: Date.now() 
    });

    // Clean up old states (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of oauthStates.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        oauthStates.delete(key);
      }
    }

    const scopes = [
      'read_orders',
      'read_products',
      'read_customers',
      'read_analytics',
      'read_reports'
    ].join(',');

    const redirectUri = `${APP_BASE_URL}/api/connectors/shopify/oauth/callback`;
    
    const authUrl = `https://${shopDomain}.myshopify.com/admin/oauth/authorize` +
      `?client_id=${SHOPIFY_CLIENT_ID}` +
      `&scope=${scopes}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    res.json({
      authUrl,
      state,
      message: 'Redirect user to authUrl to complete Shopify authorization'
    });
  } catch (error) {
    next(error);
  }
});

// Shopify OAuth callback
router.get('/shopify/oauth/callback', async (req, res, next) => {
  try {
    const { code, state, shop, error: authError } = req.query;

    if (authError) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/connectors?error=${authError}`);
    }

    if (!code || !state || !shop) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/connectors?error=missing_parameters`);
    }

    // Validate state
    const stateData = oauthStates.get(state as string);
    if (!stateData) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/connectors?error=invalid_state`);
    }

    oauthStates.delete(state as string);

    const shopDomain = (shop as string).replace('.myshopify.com', '');

    // Exchange code for access token
    const shopifyConnector = new ShopifyConnector();
    const tokenData = await shopifyConnector.exchangeCodeForToken(
      shopDomain,
      code as string,
      SHOPIFY_CLIENT_SECRET
    );

    if (!tokenData.access_token) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/connectors?error=token_exchange_failed`);
    }

    // Validate the connection
    const isValid = await shopifyConnector.validateConnection(shopDomain, tokenData.access_token);
    if (!isValid) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/connectors?error=connection_validation_failed`);
    }

    // Get shop info
    const shopInfo = await shopifyConnector.getShopInfo(shopDomain, tokenData.access_token);
    const storeId = `shopify_${shopDomain}`;

    // Save connection to user
    await User.findByIdAndUpdate(stateData.userId, {
      $push: {
        connectedStores: {
          platform: 'shopify',
          storeId,
          storeName: stateData.storeName || shopInfo.name || shopDomain,
          credentials: {
            shopDomain,
            accessToken: tokenData.access_token
          },
          isActive: true
        }
      }
    });

    // Start initial data sync
    const dataSyncService = new DataSyncService();
    const syncResult = await dataSyncService.syncStoreData({
      userId: stateData.userId,
      store: {
        platform: 'shopify',
        storeId,
        storeName: stateData.storeName || shopInfo.name || shopDomain,
        credentials: {
          shopDomain,
          accessToken: tokenData.access_token
        }
      }
    });

    console.log(`Initial sync completed for ${shopDomain}:`, syncResult);

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/connectors?success=shopify_connected&imported=${syncResult.recordsImported}`);
  } catch (error) {
    console.error('Shopify OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/connectors?error=connection_failed`);
  }
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

// Get sync history
router.get('/sync-history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storeId, limit = 10 } = req.query;
    
    const dataSyncService = new DataSyncService();
    const history = await dataSyncService.getSyncHistory(
      req.user!._id.toString(),
      storeId as string,
      Number(limit)
    );

    res.json({ history });
  } catch (error) {
    next(error);
  }
});

// Sync all active stores
router.post('/sync-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!._id);
    const activeStores = user?.connectedStores.filter(s => s.isActive) || [];
    
    if (activeStores.length === 0) {
      return res.json({ message: 'No active stores to sync', results: [] });
    }

    const dataSyncService = new DataSyncService();
    const results = [];

    for (const store of activeStores) {
      try {
        const result = await dataSyncService.syncStoreData({
          userId: req.user!._id.toString(),
          store
        });
        results.push({ storeId: store.storeId, ...result });
      } catch (error) {
        results.push({ 
          storeId: store.storeId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    res.json({
      message: 'Bulk sync completed',
      results,
      totalStores: activeStores.length,
      successCount: results.filter(r => r.success).length
    });
  } catch (error) {
    next(error);
  }
});

export { router as connectorRoutes };