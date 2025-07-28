# OrderNimbus - Deployment & Setup Guide

## Overview

This comprehensive guide covers all deployment scenarios for OrderNimbus, from local development to production AWS deployment. It includes environment setup, configuration management, security considerations, and operational procedures.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [AWS Production Deployment](#aws-production-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Security Configuration](#security-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores (4 recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 20GB free space (SSD recommended)
- **Network**: Stable internet connection

#### Software Dependencies
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **MongoDB**: Version 5.x or higher
- **Python**: Version 3.8+ (for ML models)
- **Docker**: Version 20.x+ (for containerized deployment)
- **AWS CLI**: Version 2.x (for AWS deployment)

#### Development Tools
```bash
# Check Node.js version
node --version  # Should be v18.x.x or higher

# Check npm version
npm --version   # Should be 8.x.x or higher

# Check Python version
python3 --version  # Should be 3.8.x or higher

# Check Docker version
docker --version   # Should be 20.x.x or higher
```

### Platform-Specific Prerequisites

#### macOS
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required packages
brew install node mongodb python3 docker
brew install --cask docker

# Install Python packages
pip3 install pandas numpy scikit-learn tensorflow prophet statsmodels
```

#### Ubuntu/Debian
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Python and dependencies
sudo apt-get install -y python3 python3-pip
pip3 install pandas numpy scikit-learn tensorflow prophet statsmodels

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### Windows
```powershell
# Install using Chocolatey (recommended)
# First install Chocolatey: https://chocolatey.org/install

# Install packages
choco install nodejs mongodb python3 docker-desktop

# Install Python packages
pip3 install pandas numpy scikit-learn tensorflow prophet statsmodels
```

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/ordernimbus.git
cd ordernimbus
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Install Python dependencies for ML models
pip3 install -r requirements.txt

# Create environment file
cp .env.example .env

# Generate encryption keys
openssl rand -hex 32 > .encryption_key
openssl rand -hex 64 > .jwt_secret

# Configure environment variables
cat >> .env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ordernimbus_dev
JWT_SECRET=$(cat .jwt_secret)
ENCRYPTION_KEY=$(cat .encryption_key)
FRONTEND_URL=http://localhost:3001
LOG_LEVEL=debug
EOF
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create environment file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=true
EOF

# Return to root directory
cd ..
```

### 4. Database Setup
```bash
# Start MongoDB
# macOS (via Homebrew)
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# Windows
# Start MongoDB from Services or run mongod.exe

# Create database and initial data
npm run generate-data-clean  # Creates sample data for development
```

### 5. Start Development Servers
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd frontend && npm start

# Terminal 3: Monitor logs (optional)
tail -f logs/application-$(date +%Y-%m-%d).log
```

### 6. Verify Installation
```bash
# Check backend health
curl http://localhost:3000/api/auth/me

# Check frontend
open http://localhost:3001  # macOS
# or
xdg-open http://localhost:3001  # Linux
# or navigate to http://localhost:3001 in browser
```

---

## Docker Deployment

### Development with Docker Compose

#### 1. Quick Start
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 2. Production-Ready Docker Compose
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/ordernimbus
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://localhost:3000
    depends_on:
      - backend
    restart: unless-stopped

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=ordernimbus
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:

networks:
  default:
    driver: bridge
```

#### 3. Environment Configuration for Docker
Create `.env.docker`:

```bash
# Generate secrets
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 64)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Application settings
NODE_ENV=production
LOG_LEVEL=info
API_RATE_LIMIT=100
```

#### 4. Deploy with Production Compose
```bash
# Load environment variables
export $(cat .env.docker | xargs)

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## AWS Production Deployment

### Architecture Overview
```
Internet Gateway
    ↓
Application Load Balancer (HTTPS)
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

### 1. AWS Prerequisites
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, region, and output format

# Install AWS CDK
npm install -g aws-cdk

# Verify installation
aws --version
cdk --version
```

### 2. Infrastructure Setup with CDK
```bash
# Navigate to CDK directory
cd aws-cdk

# Install CDK dependencies
npm install

# Bootstrap CDK (one-time per region/account)
cdk bootstrap

# Review infrastructure changes
cdk diff

# Deploy infrastructure
cdk deploy --all

# Note the outputs (ALB URL, database endpoints, etc.)
```

### 3. Build and Push Docker Images
```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag backend image
docker build -t ordernimbus-backend .
docker tag ordernimbus-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ordernimbus-backend:latest

# Build and tag frontend image
docker build -t ordernimbus-frontend ./frontend
docker tag ordernimbus-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ordernimbus-frontend:latest

# Push images
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ordernimbus-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ordernimbus-frontend:latest
```

### 4. Deploy Application to ECS
```bash
# Update ECS service with new images
aws ecs update-service \
  --cluster ordernimbus-cluster \
  --service ordernimbus-backend \
  --force-new-deployment

aws ecs update-service \
  --cluster ordernimbus-cluster \
  --service ordernimbus-frontend \
  --force-new-deployment

# Monitor deployment
aws ecs describe-services \
  --cluster ordernimbus-cluster \
  --services ordernimbus-backend ordernimbus-frontend
```

### 5. SSL Certificate Setup
```bash
# Request SSL certificate via ACM
aws acm request-certificate \
  --domain-name yourdomain.com \
  --domain-name *.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Update ALB listener to use HTTPS
# This is typically done through the CDK stack or AWS Console
```

### 6. Domain Configuration
```bash
# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names ordernimbus-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo "Point your domain's A record to: $ALB_DNS"

# Or create Route 53 hosted zone and records
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)
```

---

## Environment Configuration

### Development Environment (.env)
```bash
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# Database
MONGODB_URI=mongodb://localhost:27017/ordernimbus_dev
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-256-bit-secret-here
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-byte-encryption-key-here
BCRYPT_ROUNDS=12

# External APIs
SHOPIFY_CLIENT_ID=your-shopify-client-id
SHOPIFY_CLIENT_SECRET=your-shopify-client-secret
AMAZON_CLIENT_ID=your-amazon-client-id
AMAZON_CLIENT_SECRET=your-amazon-client-secret

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50MB

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs

# Rate Limiting
AUTH_RATE_LIMIT=5
API_RATE_LIMIT=100
UPLOAD_RATE_LIMIT=10

# Features
ENABLE_ANALYTICS=true
ENABLE_ML_FEATURES=true
ENABLE_AUDIT_LOGS=true
```

### Production Environment
```bash
# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Database (use connection strings from AWS)
MONGODB_URI=mongodb://username:password@cluster.cluster-xyz.docdb.amazonaws.com:27017/ordernimbus?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
REDIS_URL=redis://ordernimbus-cache.xyz.cache.amazonaws.com:6379

# Security (use AWS Secrets Manager or Parameter Store)
JWT_SECRET=${ssm:/ordernimbus/jwt-secret}
ENCRYPTION_KEY=${ssm:/ordernimbus/encryption-key}

# AWS Services
AWS_REGION=us-east-1
S3_BUCKET=ordernimbus-uploads-prod
CLOUDWATCH_LOG_GROUP=/aws/ecs/ordernimbus

# External APIs (use AWS Secrets Manager)
SHOPIFY_CLIENT_ID=${ssm:/ordernimbus/shopify/client-id}
SHOPIFY_CLIENT_SECRET=${ssm:/ordernimbus/shopify/client-secret}

# Security Headers
FORCE_HTTPS=true
ENABLE_SECURITY_HEADERS=true
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Performance
ENABLE_COMPRESSION=true
CACHE_TTL=3600
MAX_CONNECTIONS=100

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30
```

### Secrets Management

#### Using AWS Secrets Manager
```bash
# Store secrets
aws secretsmanager create-secret \
  --name ordernimbus/jwt-secret \
  --description "JWT signing secret" \
  --secret-string "$(openssl rand -hex 64)"

aws secretsmanager create-secret \
  --name ordernimbus/encryption-key \
  --description "Data encryption key" \
  --secret-string "$(openssl rand -hex 32)"

# Retrieve secrets in application
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const result = await secretsManager.getSecretValue({
    SecretId: secretName
  }).promise();
  return result.SecretString;
}
```

---

## Database Setup

### MongoDB Configuration

#### Development Setup
```bash
# Start MongoDB with authentication
mongod --auth --dbpath /data/db

# Connect and create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
})

# Create application database and user
use ordernimbus
db.createUser({
  user: "app_user",
  pwd: "app-password",
  roles: ["readWrite"]
})
```

#### Production Setup (DocumentDB)
```bash
# Download DocumentDB certificate
wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem

# Connection string format
mongodb://username:password@cluster-endpoint:27017/database?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

### Database Indexing Strategy
```javascript
// Create indexes for optimal performance
db.salesData.createIndex({ userId: 1, storeId: 1, date: -1 });
db.salesData.createIndex({ storeId: 1, productName: 1 });
db.salesData.createIndex({ date: 1 });
db.forecasts.createIndex({ userId: 1, storeId: 1, createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.auditLogs.createIndex({ userId: 1, timestamp: -1 });
db.auditLogs.createIndex({ action: 1, timestamp: -1 });

// TTL index for session cleanup
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
```

### Database Migrations
```bash
# Run database migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Create new migration
npm run migrate:create --name add_new_field
```

---

## Security Configuration

### SSL/TLS Setup

#### Development (Self-Signed Certificate)
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update server configuration
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3000);
```

#### Production (Let's Encrypt)
```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Security Headers Configuration
```javascript
// Security middleware setup
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "api.ordernimbus.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # Block direct backend access

# AWS Security Groups
aws ec2 create-security-group \
  --group-name ordernimbus-web \
  --description "OrderNimbus web application"

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

---

## Monitoring & Logging

### Application Logging
```javascript
// Winston logger configuration
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    })
  ]
});
```

### Health Check Endpoints
```javascript
// Health check routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime()
  });
});

app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      externalAPIs: await checkExternalAPIs()
    }
  };
  
  const isHealthy = Object.values(health.services).every(s => s.status === 'healthy');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

### CloudWatch Integration
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Start CloudWatch agent
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent
```

---

## Backup & Recovery

### Database Backup Strategy
```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="ordernimbus"

# Create backup
mongodump --host localhost --port 27017 --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/ordernimbus_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Upload to S3
aws s3 cp $BACKUP_DIR/ordernimbus_$DATE.tar.gz s3://ordernimbus-backups/mongodb/

# Cleanup local backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Remove temporary directory
rm -rf $BACKUP_DIR/$DATE
```

### Automated Backup with Cron
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /scripts/backup-mongodb.sh

# Weekly full backup on Sunday at 1 AM
0 1 * * 0 /scripts/backup-full-system.sh
```

### Disaster Recovery Procedure
```bash
# 1. Restore from backup
mongorestore --host localhost --port 27017 --db ordernimbus /backups/restore/

# 2. Verify data integrity
mongo ordernimbus --eval "db.users.count()"

# 3. Update application configuration
# Edit .env file with restored database connection

# 4. Restart services
docker-compose restart

# 5. Verify application functionality
curl http://localhost:3000/health
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check Node.js version
node --version

# Check port availability
netstat -tulpn | grep :3000

# Check environment variables
printenv | grep NODE_ENV

# Check logs
tail -f logs/application-$(date +%Y-%m-%d).log
```

#### Database Connection Issues
```bash
# Test MongoDB connection
mongo --host localhost --port 27017 --eval "db.adminCommand('ismaster')"

# Check MongoDB service status
sudo systemctl status mongod

# Check network connectivity
telnet localhost 27017
```

#### Performance Issues
```bash
# Check system resources
top
htop
free -h
df -h

# Check database performance
mongo ordernimbus --eval "db.stats()"

# Analyze slow queries
mongo ordernimbus --eval "db.setProfilingLevel(2, {slowms: 100})"
mongo ordernimbus --eval "db.system.profile.find().limit(5).sort({ts: -1}).pretty()"
```

#### Memory Leaks
```bash
# Monitor Node.js memory usage
node --max-old-space-size=4096 src/index.js

# Generate heap dump
kill -SIGUSR2 <node-process-id>

# Analyze heap dump with Chrome DevTools or clinic.js
npm install -g clinic
clinic doctor -- node src/index.js
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
export DEBUG=ordernimbus:*

# Start application with debugging
node --inspect src/index.js

# Connect debugger (Chrome DevTools)
# Navigate to chrome://inspect
```

### Log Analysis
```bash
# Search for errors
grep -i error logs/application-$(date +%Y-%m-%d).log

# Count API requests by endpoint
awk '{print $7}' access.log | sort | uniq -c | sort -nr

# Monitor real-time logs
tail -f logs/application-$(date +%Y-%m-%d).log | grep ERROR
```

---

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily
```bash
# Check system health
./scripts/health-check.sh

# Monitor disk space
df -h

# Check error logs
grep -c ERROR logs/application-$(date +%Y-%m-%d).log
```

#### Weekly
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Rotate log files
./scripts/rotate-logs.sh

# Verify backups
./scripts/verify-backups.sh

# Performance analysis
./scripts/performance-report.sh
```

#### Monthly
```bash
# Database maintenance
mongo ordernimbus --eval "db.runCommand({compact: 'salesData'})"

# Security audit
npm audit
./scripts/security-scan.sh

# Capacity planning review
./scripts/capacity-report.sh
```

### Scaling Procedures

#### Horizontal Scaling (AWS ECS)
```bash
# Update ECS service desired count
aws ecs update-service \
  --cluster ordernimbus-cluster \
  --service ordernimbus-backend \
  --desired-count 3

# Auto-scaling configuration
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/ordernimbus-cluster/ordernimbus-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
```

#### Database Scaling
```bash
# MongoDB sharding setup
mongo --eval "sh.enableSharding('ordernimbus')"
mongo --eval "sh.shardCollection('ordernimbus.salesData', {userId: 1, date: 1})"

# Read replicas (DocumentDB)
aws docdb create-db-instance \
  --db-instance-identifier ordernimbus-replica-1 \
  --db-instance-class db.r5.large \
  --engine docdb \
  --db-cluster-identifier ordernimbus-cluster
```

---

*This deployment and setup guide provides comprehensive instructions for deploying OrderNimbus across different environments, from local development to production AWS infrastructure, with detailed security configurations and operational procedures.*