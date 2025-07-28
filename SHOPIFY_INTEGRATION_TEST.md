# Shopify Integration Test Guide

## End-to-End Testing Instructions

### Prerequisites
1. Make sure the backend server is running (`npm run dev`)
2. Make sure the frontend is running (`npm start` in the frontend directory)
3. Have a test Shopify store or demo store ready

### Test Flow

#### 1. **OAuth Connection Test**
1. Navigate to `/connectors` in the web app
2. Click "Connect with OAuth" on the Shopify card
3. Enter your store domain and a friendly name
4. Click "Connect with OAuth" - you should be redirected to Shopify
5. *Note: For full testing, you'll need valid Shopify OAuth credentials*

#### 2. **Manual Token Test (Alternative)**
1. In the connection dialog, switch to "Manual Token" tab
2. Enter:
   - Store Name: `Test Store`
   - Shop Domain: `test-store` (any valid format)
   - Access Token: `demo_token_123` (for testing)
3. Connection will validate format but may fail on actual API calls

#### 3. **Data Sync Test**
1. Once a store is connected, click "Sync Now" on the store card
2. Watch for sync progress indicator
3. Check for success/error messages
4. Navigate to Dashboard to see if new data appears

#### 4. **Dashboard Integration Test**
1. After successful sync, go to Dashboard
2. Verify charts update automatically
3. Check that new data is reflected in visualizations

### Expected Behavior

✅ **OAuth Flow**: Proper redirect to Shopify authorization
✅ **Token Validation**: Format validation works
✅ **Sync Process**: Progress indicators and feedback
✅ **Dashboard Update**: Automatic refresh with new data
✅ **Error Handling**: Clear error messages for failures

### Demo Data for Testing

If you don't have a real Shopify store, the system includes:
- Mock data generation for testing
- Validation of connection flow
- Error handling simulation

### API Endpoints Implemented

- `POST /api/connectors/shopify/oauth/init` - Start OAuth flow
- `GET /api/connectors/shopify/oauth/callback` - Handle OAuth callback
- `POST /api/connectors/shopify/connect` - Manual token connection
- `POST /api/connectors/sync/:storeId` - Sync individual store
- `POST /api/connectors/sync-all` - Sync all connected stores
- `GET /api/connectors/stores` - Get connected stores
- `DELETE /api/connectors/stores/:storeId` - Disconnect store

### Features Implemented

🎯 **Complete OAuth Flow**: Secure Shopify authentication
🎯 **Data Transformation**: Shopify orders → standardized sales data
🎯 **Real-time Sync**: Manual and bulk sync capabilities
🎯 **Dashboard Integration**: Automatic chart updates
🎯 **Error Handling**: Comprehensive error messages
🎯 **Progress Tracking**: Visual feedback during operations
🎯 **Multi-store Support**: Connect multiple Shopify stores