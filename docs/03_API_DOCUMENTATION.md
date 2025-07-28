# OrderNimbus - API Documentation

## Overview

OrderNimbus provides a comprehensive RESTful API for sales forecasting, data management, and platform integrations. This documentation covers all available endpoints, authentication, request/response formats, and usage examples.

### Base URL
```
Production: https://api.ordernimbus.com
Development: http://localhost:3000
```

### API Versioning
Current API version: `v1`
All endpoints are prefixed with `/api/`

### Content Type
All requests should use `Content-Type: application/json` unless specified otherwise (e.g., file uploads).

## Authentication

OrderNimbus uses JWT (JSON Web Token) based authentication. After successful login, include the token in the Authorization header for all protected endpoints.

### Authentication Header
```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
Tokens expire after 7 days by default. Implement token refresh logic in your applications.

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "company": "ACME Corp"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7b123456789abcdef0123",
    "email": "user@company.com",
    "name": "John Doe",
    "company": "ACME Corp",
    "role": "user"
  }
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 6 characters
- Name: Required string
- Company: Required string

---

### POST /api/auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7b123456789abcdef0123",
    "email": "user@company.com",
    "name": "John Doe",
    "company": "ACME Corp",
    "role": "user",
    "connectedStores": [
      {
        "platform": "shopify",
        "storeId": "shopify_mystore",
        "storeName": "My Store",
        "isActive": true
      }
    ]
  }
}
```

---

### GET /api/auth/me
Get current user information.

**Headers:** Authorization required

**Response (200 OK):**
```json
{
  "user": {
    "id": "64f7b123456789abcdef0123",
    "email": "user@company.com",
    "name": "John Doe",
    "company": "ACME Corp",
    "role": "user",
    "connectedStores": []
  }
}
```

---

## Platform Connector Endpoints

### POST /api/connectors/shopify/oauth/init
Initiate Shopify OAuth flow.

**Headers:** Authorization required

**Request Body:**
```json
{
  "shop": "mystore.myshopify.com",
  "storeName": "My Store"
}
```

**Response (200 OK):**
```json
{
  "authUrl": "https://mystore.myshopify.com/admin/oauth/authorize?client_id=...",
  "state": "abc123...",
  "message": "Redirect user to authUrl to complete Shopify authorization"
}
```

---

### GET /api/connectors/shopify/oauth/callback
Shopify OAuth callback endpoint (handled automatically).

**Query Parameters:**
- `code`: Authorization code from Shopify
- `state`: OAuth state parameter
- `shop`: Shop domain

**Response:** Redirects to frontend with success/error status.

---

### POST /api/connectors/shopify/connect
Manually connect Shopify store with existing credentials.

**Headers:** Authorization required

**Request Body:**
```json
{
  "storeName": "My Store",
  "shopDomain": "mystore",
  "accessToken": "shpat_abc123..."
}
```

**Response (200 OK):**
```json
{
  "message": "Shopify store connected successfully",
  "storeId": "shopify_mystore",
  "storeName": "My Store"
}
```

---

### POST /api/connectors/amazon/connect
Connect Amazon Seller account.

**Headers:** Authorization required

**Request Body:**
```json
{
  "storeName": "Amazon Store",
  "sellerId": "A1BCDEFGHIJKLM",
  "accessKey": "AKIA...",
  "secretKey": "abc123...",
  "marketplaceId": "ATVPDKIKX0DER"
}
```

**Response (200 OK):**
```json
{
  "message": "Amazon store connected successfully",
  "storeId": "amazon_A1BCDEFGHIJKLM",
  "storeName": "Amazon Store"
}
```

---

### GET /api/connectors/stores
Get all connected stores for the current user.

**Headers:** Authorization required

**Response (200 OK):**
```json
{
  "stores": [
    {
      "platform": "shopify",
      "storeId": "shopify_mystore",
      "storeName": "My Store",
      "credentials": {
        "shopDomain": "mystore",
        "accessToken": "shpat_***"
      },
      "isActive": true
    }
  ]
}
```

---

### POST /api/connectors/sync/:storeId
Sync data for a specific store.

**Headers:** Authorization required

**Parameters:**
- `storeId`: Store identifier

**Request Body (Optional):**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response (200 OK):**
```json
{
  "message": "Data sync completed",
  "result": {
    "success": true,
    "recordsImported": 150,
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "syncDuration": 5.2
  }
}
```

---

### DELETE /api/connectors/stores/:storeId
Disconnect a store.

**Headers:** Authorization required

**Parameters:**
- `storeId`: Store identifier

**Response (200 OK):**
```json
{
  "message": "Store disconnected successfully"
}
```

---

## Data Ingestion Endpoints

### POST /api/data/upload-csv
Upload sales data via CSV file.

**Headers:** 
- Authorization required
- Content-Type: multipart/form-data

**Form Data:**
- `salesData`: CSV file
- `storeId`: Store identifier
- `platform`: Platform type (shopify, amazon, custom, etc.)

**CSV Format Requirements:**
Required columns: `date`, `productName`, `quantity`, `revenue`
Optional columns: `category`, `cost`, `currency`, `sku`, `productId`

**Example CSV:**
```csv
date,productName,quantity,revenue,category,cost
2024-01-01,Product A,5,100.00,Electronics,60.00
2024-01-01,Product B,2,50.00,Accessories,25.00
```

**Response (200 OK):**
```json
{
  "message": "Data processed successfully",
  "imported": 145,
  "total": 150,
  "errors": 5,
  "errorDetails": [
    {
      "row": 3,
      "data": {"date": "invalid-date", "productName": ""},
      "error": "Invalid date format"
    }
  ],
  "summary": {
    "totalRows": 150,
    "validRows": 145,
    "importedRows": 145,
    "errorRows": 5
  }
}
```

---

### POST /api/data/manual-entry
Add sales data manually.

**Headers:** Authorization required

**Request Body:**
```json
{
  "storeId": "store123",
  "platform": "custom",
  "productName": "Product Name",
  "category": "Electronics",
  "date": "2024-01-01",
  "quantity": 10,
  "revenue": 100.00,
  "cost": 60.00,
  "currency": "USD",
  "metadata": {
    "source": "manual_entry",
    "notes": "Special promotion"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Sales data created successfully",
  "data": {
    "id": "64f7b123456789abcdef0456",
    "storeId": "store123",
    "productName": "Product Name",
    "date": "2024-01-01T00:00:00.000Z",
    "quantity": 10,
    "revenue": 100.00,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### GET /api/data/sales-data
Retrieve sales data with filtering and pagination.

**Headers:** Authorization required

**Query Parameters:**
- `storeId` (optional): Filter by store
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `limit` (optional): Records per page (default: 100)
- `page` (optional): Page number (default: 1)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "64f7b123456789abcdef0456",
      "storeId": "shopify_mystore",
      "platform": "shopify",
      "productName": "Product A",
      "category": "Electronics",
      "date": "2024-01-01T00:00:00.000Z",
      "quantity": 5,
      "revenue": 100.00,
      "currency": "USD"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1500,
    "pages": 15
  }
}
```

---

### GET /api/data/analytics
Get analytics summary for sales data.

**Headers:** Authorization required

**Query Parameters:**
- `storeId` (optional): Filter by store
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response (200 OK):**
```json
{
  "summary": {
    "totalRevenue": 15000.00,
    "totalQuantity": 500,
    "averageOrderValue": 30.00,
    "totalProducts": 25,
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  },
  "trends": {
    "dailyRevenue": [
      {"date": "2024-01-01", "revenue": 500.00},
      {"date": "2024-01-02", "revenue": 450.00}
    ],
    "topProducts": [
      {"productName": "Product A", "revenue": 2000.00, "quantity": 100},
      {"productName": "Product B", "revenue": 1500.00, "quantity": 75}
    ],
    "categoryBreakdown": [
      {"category": "Electronics", "revenue": 8000.00, "percentage": 53.3},
      {"category": "Accessories", "revenue": 7000.00, "percentage": 46.7}
    ]
  }
}
```

---

## Machine Learning & Forecasting Endpoints

### POST /api/forecast/generate
Generate sales forecasts using ML models.

**Headers:** Authorization required

**Request Body:**
```json
{
  "storeId": "shopify_mystore",
  "modelType": "ensemble",
  "forecastType": "daily",
  "forecastDays": 30,
  "trainingPeriodDays": 365
}
```

**Parameters:**
- `modelType`: arima, lstm, prophet, ensemble (default: ensemble)
- `forecastType`: daily, weekly, monthly (default: daily)
- `forecastDays`: 1-365 (default: 30)
- `trainingPeriodDays`: 30-1095 (default: 365)

**Response (200 OK):**
```json
{
  "message": "Forecast generated successfully",
  "forecast": {
    "id": "64f7b123456789abcdef0789",
    "storeId": "shopify_mystore",
    "modelType": "ensemble",
    "forecastType": "daily",
    "predictions": [
      {
        "date": "2024-02-01",
        "predictedValue": 350.00,
        "confidence": {
          "lower": 280.00,
          "upper": 420.00
        }
      },
      {
        "date": "2024-02-02",
        "predictedValue": 375.00,
        "confidence": {
          "lower": 300.00,
          "upper": 450.00
        }
      }
    ],
    "accuracy": {
      "mape": 8.5,
      "rmse": 45.2,
      "r2": 0.92
    },
    "trainingPeriod": {
      "startDate": "2023-01-01",
      "endDate": "2023-12-31"
    },
    "generatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### GET /api/forecast/list
List all forecasts with filtering and pagination.

**Headers:** Authorization required

**Query Parameters:**
- `storeId` (optional): Filter by store
- `modelType` (optional): Filter by model type
- `limit` (optional): Records per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response (200 OK):**
```json
{
  "forecasts": [
    {
      "id": "64f7b123456789abcdef0789",
      "storeId": "shopify_mystore",
      "modelType": "ensemble",
      "forecastType": "daily",
      "accuracy": {
        "mape": 8.5,
        "rmse": 45.2,
        "r2": 0.92
      },
      "generatedAt": "2024-01-15T12:00:00.000Z",
      "predictionsCount": 30
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### GET /api/forecast/:id
Get detailed forecast by ID.

**Headers:** Authorization required

**Parameters:**
- `id`: Forecast ID

**Response (200 OK):**
```json
{
  "forecast": {
    "id": "64f7b123456789abcdef0789",
    "storeId": "shopify_mystore",
    "modelType": "ensemble",
    "forecastType": "daily",
    "predictions": [
      {
        "date": "2024-02-01",
        "predictedValue": 350.00,
        "confidence": {
          "lower": 280.00,
          "upper": 420.00
        }
      }
    ],
    "accuracy": {
      "mape": 8.5,
      "rmse": 45.2,
      "r2": 0.92
    },
    "parameters": {
      "ensembleWeights": {
        "lstm": 0.4,
        "arima": 0.3,
        "prophet": 0.3
      }
    },
    "generatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### POST /api/forecast/compare
Compare multiple forecasts.

**Headers:** Authorization required

**Request Body:**
```json
{
  "forecastIds": [
    "64f7b123456789abcdef0789",
    "64f7b123456789abcdef0790"
  ]
}
```

**Response (200 OK):**
```json
{
  "comparison": {
    "forecasts": [
      {
        "id": "64f7b123456789abcdef0789",
        "modelType": "ensemble",
        "accuracy": {"mape": 8.5, "rmse": 45.2, "r2": 0.92}
      },
      {
        "id": "64f7b123456789abcdef0790",
        "modelType": "lstm",
        "accuracy": {"mape": 12.1, "rmse": 58.7, "r2": 0.88}
      }
    ],
    "recommendation": {
      "bestModel": "ensemble",
      "reason": "Lowest MAPE and highest R²",
      "performanceGap": "28% better accuracy"
    },
    "visualData": {
      "chartData": [
        {
          "date": "2024-02-01",
          "actual": 340.00,
          "ensemble": 350.00,
          "lstm": 365.00
        }
      ]
    }
  }
}
```

---

### DELETE /api/forecast/:id
Deactivate/delete a forecast.

**Headers:** Authorization required

**Parameters:**
- `id`: Forecast ID

**Response (200 OK):**
```json
{
  "message": "Forecast deactivated successfully"
}
```

---

## Store Management Endpoints

### POST /api/stores
Create a new store (for brick-and-mortar stores).

**Headers:** Authorization required

**Request Body:**
```json
{
  "name": "Downtown Store",
  "type": "brick_mortar",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "contact": {
    "phone": "+1-555-0123",
    "email": "store@company.com",
    "website": "https://mystore.com"
  },
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD",
    "taxRate": 0.08
  },
  "metadata": {
    "storeSize": "medium",
    "category": "retail",
    "openingDate": "2020-01-15",
    "employees": 5
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Store created successfully",
  "store": {
    "id": "64f7b123456789abcdef0999",
    "name": "Downtown Store",
    "type": "brick_mortar",
    "storeId": "bm_downtown_store_123",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    },
    "isActive": true,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `EXTERNAL_SERVICE_ERROR` - Third-party service unavailable

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General API endpoints**: 100 requests per 15 minutes per user
- **Data upload endpoints**: 10 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642258800
```

---

## SDK and Code Examples

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

class OrderNimbusAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async login(email, password) {
    const response = await this.client.post('/api/auth/login', {
      email,
      password
    });
    this.token = response.data.token;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.token}`;
    return response.data;
  }

  async generateForecast(storeId, options = {}) {
    const response = await this.client.post('/api/forecast/generate', {
      storeId,
      modelType: options.modelType || 'ensemble',
      forecastType: options.forecastType || 'daily',
      forecastDays: options.forecastDays || 30,
      trainingPeriodDays: options.trainingPeriodDays || 365
    });
    return response.data.forecast;
  }

  async uploadCSV(filePath, storeId, platform) {
    const FormData = require('form-data');
    const fs = require('fs');
    
    const form = new FormData();
    form.append('salesData', fs.createReadStream(filePath));
    form.append('storeId', storeId);
    form.append('platform', platform);

    const response = await this.client.post('/api/data/upload-csv', form, {
      headers: form.getHeaders()
    });
    return response.data;
  }
}

// Usage
const api = new OrderNimbusAPI('http://localhost:3000', null);

(async () => {
  // Login
  const loginResult = await api.login('user@company.com', 'password');
  console.log('Logged in:', loginResult.user.name);

  // Generate forecast
  const forecast = await api.generateForecast('shopify_mystore', {
    modelType: 'ensemble',
    forecastDays: 30
  });
  console.log('Forecast generated:', forecast.id);

  // Upload data
  const uploadResult = await api.uploadCSV('./sales-data.csv', 'mystore', 'custom');
  console.log('Uploaded:', uploadResult.imported, 'records');
})();
```

### Python Example

```python
import requests
import json

class OrderNimbusAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        if token:
            self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    def login(self, email, password):
        response = self.session.post(f'{self.base_url}/api/auth/login', 
                                   json={'email': email, 'password': password})
        response.raise_for_status()
        
        data = response.json()
        self.token = data['token']
        self.session.headers.update({'Authorization': f'Bearer {self.token}'})
        return data
    
    def generate_forecast(self, store_id, **options):
        payload = {
            'storeId': store_id,
            'modelType': options.get('model_type', 'ensemble'),
            'forecastType': options.get('forecast_type', 'daily'),
            'forecastDays': options.get('forecast_days', 30),
            'trainingPeriodDays': options.get('training_period_days', 365)
        }
        
        response = self.session.post(f'{self.base_url}/api/forecast/generate', 
                                   json=payload)
        response.raise_for_status()
        return response.json()['forecast']
    
    def get_analytics(self, store_id=None, start_date=None, end_date=None):
        params = {}
        if store_id:
            params['storeId'] = store_id
        if start_date:
            params['startDate'] = start_date
        if end_date:
            params['endDate'] = end_date
            
        response = self.session.get(f'{self.base_url}/api/data/analytics', 
                                  params=params)
        response.raise_for_status()
        return response.json()

# Usage
api = OrderNimbusAPI('http://localhost:3000')

# Login
login_result = api.login('user@company.com', 'password')
print(f"Logged in: {login_result['user']['name']}")

# Generate forecast
forecast = api.generate_forecast('shopify_mystore', forecast_days=30)
print(f"Forecast generated: {forecast['id']}")

# Get analytics
analytics = api.get_analytics(store_id='shopify_mystore')
print(f"Total revenue: ${analytics['summary']['totalRevenue']}")
```

---

## Webhooks (Future Feature)

OrderNimbus will support webhooks for real-time notifications:

### Supported Events
- `forecast.completed` - Forecast generation completed
- `data.sync.completed` - Store data sync completed
- `data.upload.completed` - CSV upload processing completed
- `store.connected` - New store connection established
- `alert.threshold.exceeded` - Custom alert threshold reached

### Webhook Format
```json
{
  "event": "forecast.completed",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "data": {
    "forecastId": "64f7b123456789abcdef0789",
    "storeId": "shopify_mystore",
    "modelType": "ensemble",
    "accuracy": {
      "mape": 8.5
    }
  },
  "userId": "64f7b123456789abcdef0123"
}
```

---

*This API documentation provides comprehensive coverage of all OrderNimbus endpoints, authentication mechanisms, and integration patterns for developers building applications or integrations with the platform.*