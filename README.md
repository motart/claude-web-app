# OrderNimbus - Enterprise Sales Forecasting Platform

AI-powered sales forecasting web application that enables Shopify, Amazon, brick-and-mortar, and other retail stores to plug in their data and get accurate future sales predictions using advanced machine learning models.

**🔒 SOC 2 Type II Compliant** | **🛡️ Enterprise Security** | **📊 Advanced Analytics** | **🤖 AI-Powered Forecasting**

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

### 🔐 Enterprise Security & Compliance
- **SOC 2 Type II Compliance**: Complete Trust Services implementation (Security, Availability, Processing Integrity, Confidentiality, Privacy)
- **Advanced Authentication**: JWT with MFA support, session management, and enhanced security logging
- **Data Protection**: AES-256-GCM encryption at rest, TLS 1.3 in transit, secure key management
- **Access Control**: Role-based access control (RBAC) with principle of least privilege
- **Security Monitoring**: Real-time threat detection, comprehensive audit logging with 7-year retention
- **API Security**: Rate limiting, request signing (HMAC), IP whitelisting, API key authentication
- **Compliance Ready**: GDPR, HIPAA, PCI-DSS preparation with automated compliance reporting

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
- OpenSSL (for generating encryption keys)

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
   # Generate secure encryption keys
   openssl rand -hex 32 > .encryption_key
   export JWT_SECRET=$(openssl rand -hex 64)
   export ENCRYPTION_KEY=$(cat .encryption_key)
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

## Security & Compliance Features

### 🛡️ Enterprise Security
- **Multi-Factor Authentication**: TOTP-based authentication with hardware security key support
- **Advanced Encryption**: AES-256-GCM for data at rest, TLS 1.3 for data in transit
- **Zero-Trust Architecture**: Principle of least privilege, micro-segmentation
- **API Security**: HMAC request signing, rate limiting (5 auth/100 API per 15min), IP whitelisting
- **Security Headers**: Comprehensive security headers (HSTS, CSP, X-Frame-Options, etc.)
- **Input Validation**: XSS protection, SQL injection prevention, parameter pollution protection

### 📋 SOC 2 Type II Compliance
- **Security Controls (CC1-CC8)**: Complete control environment implementation
- **Availability (A1)**: SLA monitoring, backup procedures, disaster recovery
- **Processing Integrity (PI1)**: Data validation, error handling, completeness checks
- **Confidentiality (C1)**: Data classification, encryption, access restrictions
- **Privacy (P1-P8)**: GDPR-ready privacy controls, consent management, data subject rights

### 📊 Audit & Monitoring
- **Comprehensive Logging**: Structured audit logs with 7-year retention for compliance
- **Real-time Monitoring**: Security event detection, performance monitoring, alerting
- **Automated Reporting**: SOC 2 compliance reports, risk assessments, control testing
- **Incident Response**: Automated incident detection, escalation procedures, forensic capabilities

### 🔒 Data Protection
- **Data Classification**: Public, Internal, Confidential, Restricted classification scheme
- **Secure Storage**: Encrypted databases, secure file storage, key rotation
- **Privacy Controls**: Data masking, anonymization, secure deletion procedures
- **Backup Security**: Encrypted backups with separate keys, offsite storage

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

## Security Documentation

### 📋 Compliance Resources
- **Security Policy**: [`docs/SECURITY_POLICY.md`](docs/SECURITY_POLICY.md) - Comprehensive security policies and procedures
- **SOC 2 Guide**: [`docs/SOC2_COMPLIANCE_GUIDE.md`](docs/SOC2_COMPLIANCE_GUIDE.md) - Implementation guide for SOC 2 compliance
- **Risk Assessment**: Quarterly risk assessments and mitigation strategies
- **Incident Response**: 24/7 incident response procedures and escalation matrix

### 🔐 Security Configuration
```bash
# Production Security Setup
export NODE_ENV=production
export JWT_SECRET=$(openssl rand -hex 64)
export ENCRYPTION_KEY=$(openssl rand -hex 32)
export FORCE_HTTPS=true
export ENABLE_AUDIT_LOGS=true
export LOG_RETENTION_DAYS=2555  # 7 years for compliance
```

### 📊 Compliance Monitoring
```typescript
// Generate SOC 2 compliance report
import { ComplianceService } from './src/services/ComplianceService';

const compliance = new ComplianceService();
const report = await compliance.generateSOC2Report(
  new Date('2024-01-01'),
  new Date('2024-12-31'),
  'compliance-officer'
);
```

### 🛡️ Security Best Practices
1. **Environment Variables**: Never commit secrets to version control
2. **Access Reviews**: Quarterly access certification and role validation
3. **Vulnerability Management**: Monthly security scans and patch management
4. **Incident Response**: 15-minute response time for P0 security incidents
5. **Data Classification**: All data must be classified and handled appropriately

## Roadmap

### Q1 2024
- [x] SOC 2 Type II compliance implementation
- [x] Advanced security framework
- [x] Comprehensive audit logging
- [ ] GDPR compliance certification
- [ ] PCI-DSS compliance (if processing payments)

### Q2 2024
- [ ] Additional ML models (XGBoost, Random Forest)
- [ ] Real-time data streaming
- [ ] Advanced anomaly detection
- [ ] ISO 27001 certification

### Q3 2024
- [ ] Mobile app for iOS/Android
- [ ] Integration with more e-commerce platforms
- [ ] Advanced reporting and business intelligence
- [ ] HIPAA compliance (for healthcare retailers)

### Q4 2024
- [ ] Multi-currency support
- [ ] Inventory optimization features
- [ ] Advanced threat detection
- [ ] Zero-trust network architecture
