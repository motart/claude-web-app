# Retail Forecast Platform

AI-powered sales forecasting web application that enables Shopify, Amazon, brick-and-mortar, and other retail stores to plug in their data and get accurate future sales predictions using advanced machine learning models.

## Features

### 🏪 Multi-Platform Integration
- **Shopify Integration**: Direct API connection for automatic sales data sync
- **Amazon Seller Integration**: SP-API integration for marketplace data
- **CSV Upload**: Manual data import for any e-commerce platform
- **Custom API**: RESTful API for custom integrations

### 🤖 Advanced ML Forecasting
- **Multiple Models**: ARIMA, LSTM Neural Networks, Prophet, and Ensemble methods
- **High Accuracy**: Ensemble model combining multiple algorithms for best predictions
- **Confidence Intervals**: Upper and lower bounds for risk assessment
- **Model Comparison**: Side-by-side accuracy metrics and performance analysis

### 📊 Comprehensive Analytics
- **Real-time Dashboard**: Revenue trends, category breakdowns, top products
- **Sales Insights**: Automated pattern detection and growth analysis
- **Interactive Charts**: Responsive visualizations with Recharts
- **Export Capabilities**: Download forecasts and analytics data

### 🔐 Enterprise Security
- **JWT Authentication**: Secure user authentication and authorization
- **Multi-tenant Architecture**: Isolated data per organization
- **Role-based Access**: Admin and user permission levels
- **Data Encryption**: Secure data storage and transmission

### ☁️ AWS-Ready Deployment
- **Docker Containerization**: Easy deployment with Docker and Docker Compose
- **AWS CDK Infrastructure**: Production-ready AWS infrastructure as code
- **Auto-scaling**: ECS Fargate with automatic scaling based on load
- **High Availability**: Multi-AZ deployment with load balancing

## Technology Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API
- **MongoDB** for data storage
- **TensorFlow.js** for ML models
- **Python Integration** for advanced analytics (ARIMA, Prophet)

### Frontend
- **React 18** with TypeScript
- **Material-UI** for modern UI components
- **Recharts** for data visualization
- **React Router** for navigation

### ML & Analytics
- **TensorFlow.js**: LSTM neural networks
- **Python**: ARIMA, Prophet models via Python Shell
- **Statistical Analysis**: Time series forecasting and trend analysis
- **Data Processing**: Automated cleaning and validation

### Infrastructure
- **AWS ECS Fargate**: Containerized application hosting
- **Application Load Balancer**: Traffic distribution and SSL termination
- **DocumentDB**: MongoDB-compatible managed database
- **ElastiCache Redis**: Session storage and caching
- **S3**: File storage for uploads and model artifacts
- **CloudWatch**: Monitoring and logging

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Python 3.8+ (for ML models)
- Docker (optional)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd claude-web-app
   npm install
   cd frontend && npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install Python Dependencies**
   ```bash
   pip install pandas numpy scikit-learn tensorflow prophet statsmodels
   ```

4. **Start Services**
   ```bash
   # Backend
   npm run dev

   # Frontend (new terminal)
   cd frontend && npm start
   ```

### Docker Deployment

1. **Build and Run**
   ```bash
   docker-compose up --build
   ```

2. **Access Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

### AWS Deployment

1. **Setup AWS CDK**
   ```bash
   cd aws-cdk
   npm install
   npm run build
   ```

2. **Deploy Infrastructure**
   ```bash
   cdk bootstrap
   cdk deploy
   ```

3. **Build and Push Docker Image**
   ```bash
   # Build image
   docker build -t retail-forecast-app .

   # Tag and push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
   docker tag retail-forecast-app:latest <account>.dkr.ecr.us-east-1.amazonaws.com/retail-forecast-app:latest
   docker push <account>.dkr.ecr.us-east-1.amazonaws.com/retail-forecast-app:latest
   ```

## API Documentation

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "user@company.com",
  "password": "password",
  "name": "John Doe",
  "company": "ACME Corp"
}

# Login
POST /api/auth/login
{
  "email": "user@company.com",
  "password": "password"
}
```

### Data Ingestion
```bash
# Upload CSV
POST /api/data/upload-csv
Content-Type: multipart/form-data
- salesData: file
- storeId: string
- platform: string

# Manual Entry
POST /api/data/manual-entry
{
  "storeId": "store123",
  "platform": "custom",
  "date": "2023-01-01",
  "quantity": 10,
  "revenue": 100.00,
  "productName": "Product Name"
}
```

### Forecasting
```bash
# Generate Forecast
POST /api/forecast/generate
{
  "storeId": "store123",
  "modelType": "ensemble",
  "forecastType": "daily",
  "forecastDays": 30,
  "trainingPeriodDays": 365
}

# Get Forecasts
GET /api/forecast/list?storeId=store123&limit=10
```

### Platform Connectors
```bash
# Connect Shopify
POST /api/connectors/shopify/connect
{
  "storeName": "My Store",
  "shopDomain": "mystore",
  "accessToken": "access_token"
}

# Sync Store Data
POST /api/connectors/sync/{storeId}
{
  "startDate": "2023-01-01",
  "endDate": "2023-12-31"
}
```

## Machine Learning Models

### 1. LSTM Neural Network
- **Best For**: Complex patterns and non-linear relationships
- **Features**: Deep learning with sequence memory
- **Accuracy**: High for products with historical patterns

### 2. ARIMA (AutoRegressive Integrated Moving Average)
- **Best For**: Stationary time series with clear trends
- **Features**: Statistical model with trend and seasonality
- **Accuracy**: Excellent for stable, predictable patterns

### 3. Prophet (Facebook's Time Series Forecasting)
- **Best For**: Data with strong seasonal patterns
- **Features**: Handles holidays and special events
- **Accuracy**: Great for retail with seasonal variations

### 4. Ensemble Model (Recommended)
- **Combines**: All three models with weighted averaging
- **Features**: Leverages strengths of each individual model
- **Accuracy**: Highest overall accuracy and reliability

## Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │    │   Load Balancer  │    │   ECS Fargate   │
│   Load Balancer │────│                  │────│   Containers    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   DocumentDB     │    │   ElastiCache   │
│   (Optional)    │    │   (MongoDB)      │    │   Redis         │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Route 53      │    │   S3 Bucket      │    │   CloudWatch    │
│   DNS           │    │   File Storage   │    │   Monitoring    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Security Features

- **Data Encryption**: All data encrypted at rest and in transit
- **API Security**: Rate limiting, input validation, SQL injection prevention
- **Authentication**: JWT tokens with configurable expiration
- **Authorization**: Role-based access control (RBAC)
- **Network Security**: VPC with private subnets, security groups
- **Monitoring**: CloudWatch logs and metrics for security events

## Performance & Scaling

- **Auto-scaling**: Automatic scaling based on CPU and memory usage
- **Load Balancing**: Application Load Balancer with health checks
- **Caching**: Redis for session storage and API response caching
- **Database**: DocumentDB with read replicas for scaling
- **CDN**: CloudFront for static asset delivery (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue in this repository
- Email: support@retailforecast.com
- Documentation: [Link to detailed docs]

## Roadmap

- [ ] Additional ML models (XGBoost, Random Forest)
- [ ] Real-time data streaming
- [ ] Advanced anomaly detection
- [ ] Mobile app for iOS/Android
- [ ] Integration with more e-commerce platforms
- [ ] Advanced reporting and business intelligence
- [ ] Multi-currency support
- [ ] Inventory optimization features
