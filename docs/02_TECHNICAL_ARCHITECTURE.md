# OrderNimbus - Technical Architecture Documentation

## System Architecture Overview

OrderNimbus is built on a modern, cloud-native architecture designed for scalability, security, and performance. The system follows a microservices-inspired approach with clear separation of concerns between frontend, backend, machine learning, and data layers.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer (ALB)                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
    ┌─────────────────┴──────────────────┐
    │                                    │
    ▼                                    ▼
┌─────────────────┐              ┌─────────────────┐
│   React App     │              │   Node.js API   │
│   (Frontend)    │              │   (Backend)     │
│   Port: 3001    │              │   Port: 3000    │
└─────────────────┘              └─────────────────┘
    │                                    │
    │                                    ▼
    │                            ┌─────────────────┐
    │                            │   ML Engine     │
    │                            │   (Python)      │
    │                            └─────────────────┘
    │                                    │
    ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   MongoDB       │   Redis Cache   │   S3 File Storage          │
│   (Primary DB)  │   (Sessions)    │   (Uploads/Models)          │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **State Management**: React Context API + React Hooks
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router DOM v6
- **Data Visualization**: Recharts
- **HTTP Client**: Axios
- **Build Tool**: React Scripts (Webpack)

### Component Architecture

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── ProtectedRoute.tsx # Authentication guard
│   ├── AdvancedForecasting.tsx
│   ├── Chatbot.tsx
│   ├── CookieConsent.tsx
│   ├── GlobalSearch.tsx
│   └── StoreManager.tsx
├── pages/               # Route-based page components
│   ├── Dashboard.tsx    # Main analytics dashboard
│   ├── Connectors.tsx   # Platform integration management
│   ├── DataIngestion.tsx # Data upload and management
│   ├── Forecasting.tsx  # ML forecasting interface
│   ├── Login.tsx        # Authentication
│   ├── Settings.tsx     # User preferences
│   └── PrivacyPolicy.tsx
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── SearchContext.tsx # Global search state
├── services/            # API integration layer
│   ├── api.ts          # Main API client
│   ├── advancedML.ts   # ML model interactions
│   ├── dataIngestion.ts # Data processing
│   └── searchEngine.ts  # Search functionality
└── types/               # TypeScript type definitions
    └── search.ts
```

### Key Frontend Features

#### 1. Authentication System
```typescript
// AuthContext implementation
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

#### 2. Real-time Dashboard
- **Live Data Updates**: WebSocket connections for real-time metrics
- **Interactive Charts**: Recharts with drill-down capabilities
- **Responsive Design**: Mobile-first approach with breakpoints
- **Performance Optimization**: React.memo and useMemo for expensive operations

#### 3. Data Visualization
- **Revenue Trends**: Time series charts with zoom/pan
- **Product Performance**: Bar charts and pie charts
- **Forecast Displays**: Line charts with confidence intervals
- **Export Functionality**: SVG/PNG chart exports and CSV data

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for sessions and API responses
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: AWS S3 for uploads and model artifacts
- **Logging**: Winston with structured logging

### API Architecture

```
src/
├── index.ts             # Application entry point
├── middleware/          # Express middleware
│   ├── auth.ts         # JWT authentication
│   ├── security.ts     # Security headers and validation
│   ├── monitoring.ts   # Request/response logging
│   ├── errorHandler.ts # Global error handling
│   └── gdprCompliance.ts # Privacy controls
├── routes/              # API route handlers
│   ├── auth.ts         # Authentication endpoints
│   ├── connectors.ts   # Platform integration APIs
│   ├── dataIngestion.ts # Data upload and processing
│   ├── forecast.ts     # ML forecasting endpoints
│   ├── stores.ts       # Store management
│   └── gdpr.ts         # Privacy compliance APIs
├── models/              # Database schemas
│   ├── User.ts         # User account model
│   ├── Store.ts        # Store configuration
│   ├── SalesData.ts    # Sales transaction records
│   ├── Forecast.ts     # Prediction results
│   └── AuditLog.ts     # Security audit trail
├── services/            # Business logic layer
│   ├── DataProcessor.ts # Data validation and cleaning
│   ├── MLService.ts    # Machine learning interface
│   ├── DataSyncService.ts # Platform synchronization
│   └── ComplianceService.ts # SOC 2 compliance tools
└── utils/               # Utility functions
    ├── encryption.ts   # Data encryption utilities
    └── logger.ts       # Structured logging
```

### Database Schema Design

#### Core Collections

**Users Collection**
```typescript
interface User {
  _id: ObjectId;
  email: string;           // Unique identifier
  passwordHash: string;    // bcrypt hashed password
  name: string;
  company: string;
  role: 'admin' | 'user' | 'viewer';
  mfaEnabled: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  gdprConsent: {
    granted: boolean;
    timestamp: Date;
    version: string;
  };
}
```

**Stores Collection**
```typescript
interface Store {
  _id: ObjectId;
  userId: ObjectId;        // Foreign key to Users
  name: string;
  platform: 'shopify' | 'amazon' | 'csv' | 'custom';
  configuration: {
    shopifyDomain?: string;
    accessToken?: string;   // Encrypted
    apiCredentials?: any;   // Platform-specific config
  };
  lastSync: Date;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  updatedAt: Date;
}
```

**SalesData Collection**
```typescript
interface SalesData {
  _id: ObjectId;
  storeId: ObjectId;       // Foreign key to Stores
  date: Date;              // Transaction date
  productName: string;
  category: string;
  quantity: number;
  revenue: number;
  currency: string;
  platform: string;
  metadata: any;           // Platform-specific data
  createdAt: Date;
}
```

**Forecasts Collection**
```typescript
interface Forecast {
  _id: ObjectId;
  storeId: ObjectId;       // Foreign key to Stores
  modelType: 'lstm' | 'arima' | 'prophet' | 'ensemble';
  forecastType: 'daily' | 'weekly' | 'monthly';
  predictions: Array<{
    date: Date;
    predictedValue: number;
    confidence: {
      lower: number;
      upper: number;
    };
  }>;
  accuracy: {
    mape: number;          // Mean Absolute Percentage Error
    rmse: number;          // Root Mean Square Error
    r2: number;            // R-squared
  };
  trainingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  parameters: any;         // Model-specific parameters
  createdAt: Date;
}
```

## Machine Learning Architecture

### ML Pipeline Overview

```
Data Input → Preprocessing → Model Training → Prediction → Validation → Output
     ↓             ↓             ↓             ↓           ↓          ↓
  CSV/API     Cleaning &     Multiple ML    Forecast    Accuracy   Dashboard
             Validation      Models        Generation   Testing    Display
```

### Model Implementation

#### 1. LSTM Neural Network (TensorFlow.js)
```typescript
// Neural network architecture
class LSTMForecastModel {
  private model: tf.Sequential;
  
  constructor(inputShape: number[], units: number = 50) {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: units,
          returnSequences: true,
          inputShape: inputShape
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: units,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 1 })
      ]
    });
  }
}
```

#### 2. ARIMA (Python Integration)
```python
# ARIMA model implementation
from statsmodels.tsa.arima.model import ARIMA
import pandas as pd
import numpy as np

class ARIMAForecastModel:
    def __init__(self, order=(1,1,1)):
        self.order = order
        self.model = None
    
    def fit(self, data):
        self.model = ARIMA(data, order=self.order)
        self.fitted_model = self.model.fit()
    
    def forecast(self, steps=30):
        forecast = self.fitted_model.forecast(steps=steps)
        confidence_int = self.fitted_model.get_forecast(steps).conf_int()
        return forecast, confidence_int
```

#### 3. Prophet (Facebook's Forecasting Tool)
```python
# Prophet model implementation
from prophet import Prophet
import pandas as pd

class ProphetForecastModel:
    def __init__(self):
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False
        )
    
    def fit(self, data):
        # Data must have 'ds' (date) and 'y' (value) columns
        self.model.fit(data)
    
    def forecast(self, periods=30):
        future = self.model.make_future_dataframe(periods=periods)
        forecast = self.model.predict(future)
        return forecast
```

#### 4. Ensemble Model
```typescript
// Ensemble model combining all approaches
interface ModelPrediction {
  model: string;
  predictions: number[];
  weight: number;
  accuracy: number;
}

class EnsembleForecastModel {
  private models: ModelPrediction[];
  
  combineForecasts(): number[] {
    const weightedSum = this.models.reduce((acc, model) => {
      return acc.map((val, idx) => 
        val + (model.predictions[idx] * model.weight)
      );
    }, new Array(this.models[0].predictions.length).fill(0));
    
    const totalWeight = this.models.reduce((sum, model) => sum + model.weight, 0);
    return weightedSum.map(val => val / totalWeight);
  }
}
```

## Security Architecture

### Security Layers

#### 1. Network Security
- **TLS 1.3**: All communications encrypted in transit
- **HTTPS Enforcement**: Automatic HTTP to HTTPS redirect
- **CORS Policy**: Strict origin validation
- **Rate Limiting**: API endpoint protection
- **IP Whitelisting**: Enterprise account protection

#### 2. Application Security
- **JWT Authentication**: Stateless token-based auth
- **Password Security**: bcrypt with salt rounds
- **Input Validation**: Joi schema validation
- **XSS Protection**: Content Security Policy
- **SQL Injection Prevention**: Mongoose parameterized queries

#### 3. Data Security
- **Encryption at Rest**: AES-256-GCM for sensitive data
- **Key Management**: AWS KMS integration
- **Data Classification**: Public/Internal/Confidential/Restricted
- **Secure Deletion**: Cryptographic erasure procedures

#### 4. Access Control
```typescript
// Role-based access control
interface UserPermissions {
  userId: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: Permission[];
  stores: string[];  // Accessible store IDs
  features: Feature[]; // Available features
}

enum Permission {
  READ_SALES_DATA = 'read:sales_data',
  WRITE_SALES_DATA = 'write:sales_data',
  MANAGE_FORECASTS = 'manage:forecasts',
  ADMIN_USERS = 'admin:users',
  EXPORT_DATA = 'export:data'
}
```

## Performance & Scalability

### Optimization Strategies

#### 1. Frontend Performance
- **Code Splitting**: Lazy loading of routes and components
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: Large dataset rendering optimization
- **Image Optimization**: WebP format and lazy loading
- **Bundle Analysis**: Webpack bundle optimization

#### 2. Backend Performance
- **Database Indexing**: Strategic MongoDB indexes
- **Caching Layer**: Redis for frequently accessed data
- **Connection Pooling**: MongoDB connection optimization
- **Async Processing**: Non-blocking operations
- **Response Compression**: Gzip/Brotli compression

#### 3. Database Optimization
```javascript
// Strategic indexes for performance
db.salesData.createIndex({ storeId: 1, date: -1 });
db.salesData.createIndex({ storeId: 1, productName: 1 });
db.forecasts.createIndex({ storeId: 1, createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

#### 4. Caching Strategy
```typescript
// Redis caching implementation
interface CacheStrategy {
  key: string;
  ttl: number;  // Time to live in seconds
  data: any;
}

const cacheStrategies = {
  userSession: { ttl: 3600 },      // 1 hour
  salesData: { ttl: 300 },        // 5 minutes
  forecasts: { ttl: 1800 },       // 30 minutes
  staticData: { ttl: 86400 }      // 24 hours
};
```

## Deployment Architecture

### AWS Infrastructure

#### Production Environment
```
Internet Gateway
    ↓
Application Load Balancer (ALB)
    ↓
ECS Fargate Cluster
├── Frontend Service (React)
├── Backend Service (Node.js)
└── ML Service (Python)
    ↓
Data Layer
├── DocumentDB (MongoDB-compatible)
├── ElastiCache (Redis)
└── S3 (File Storage)
```

#### Infrastructure as Code (AWS CDK)
```typescript
// CDK stack definition
export class OrderNimbusStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC with public/private subnets
    const vpc = new Vpc(this, 'OrderNimbusVPC', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS
        }
      ]
    });

    // ECS Fargate cluster
    const cluster = new Cluster(this, 'Cluster', {
      vpc: vpc,
      containerInsights: true
    });

    // Application Load Balancer
    const alb = new ApplicationLoadBalancer(this, 'ALB', {
      vpc: vpc,
      internetFacing: true
    });
  }
}
```

### Container Configuration

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Monitoring & Observability

### Monitoring Stack
- **Application Monitoring**: CloudWatch metrics and alarms
- **Log Aggregation**: Structured logging with Winston
- **Error Tracking**: Custom error reporting and alerting
- **Performance Monitoring**: Response time and throughput metrics
- **Security Monitoring**: Audit log analysis and threat detection

### Key Metrics
```typescript
interface SystemMetrics {
  application: {
    responseTime: number;
    errorRate: number;
    throughput: number;
    activeUsers: number;
  };
  infrastructure: {
    cpuUtilization: number;
    memoryUsage: number;
    diskSpace: number;
    networkTraffic: number;
  };
  business: {
    forecastAccuracy: number;
    dataProcessingTime: number;
    userEngagement: number;
    revenueGenerated: number;
  };
}
```

---

*This technical architecture documentation provides a comprehensive overview of OrderNimbus's system design, implementation details, and operational considerations for developers, DevOps engineers, and technical stakeholders.*