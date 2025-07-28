# OrderNimbus - Troubleshooting & FAQ Guide

## Overview

This comprehensive troubleshooting guide provides solutions to common issues, debugging procedures, and frequently asked questions for OrderNimbus. It covers both technical and user-facing problems across development, deployment, and production environments.

## Table of Contents

1. [Common Issues & Solutions](#common-issues--solutions)
2. [Development Environment Troubleshooting](#development-environment-troubleshooting)
3. [Production Issues](#production-issues)
4. [API & Integration Issues](#api--integration-issues)
5. [Database Problems](#database-problems)
6. [Authentication & Authorization Issues](#authentication--authorization-issues)
7. [Performance Issues](#performance-issues)
8. [Security & Compliance Troubleshooting](#security--compliance-troubleshooting)
9. [Frequently Asked Questions](#frequently-asked-questions)
10. [Getting Help](#getting-help)

---

## Common Issues & Solutions

### Application Won't Start

#### Issue: Backend server fails to start
**Symptoms:**
- Error: "EADDRINUSE: address already in use :::3000"
- Process exits immediately
- Connection refused errors

**Solutions:**
```bash
# 1. Check if port is already in use
lsof -i :3000
# Kill existing process if found
kill -9 <PID>

# 2. Check Node.js version
node --version  # Should be 18.x or higher
nvm use 18      # If using nvm

# 3. Verify environment variables
printenv | grep NODE_ENV
cat .env        # Check if .env file exists

# 4. Check for missing dependencies
npm install
npm audit fix   # Fix any vulnerabilities

# 5. Verify database connection
mongo --eval "db.adminCommand('ismaster')"
```

**Prevention:**
- Always stop previous instances before starting new ones
- Use process managers like PM2 for production
- Set up proper health checks

#### Issue: Frontend build fails
**Symptoms:**
- TypeScript compilation errors
- Module not found errors
- Build process hangs

**Solutions:**
```bash
# 1. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. Fix TypeScript errors
npm run typecheck
# Address any type errors in the output

# 3. Check for missing environment variables
ls frontend/.env
# Create if missing:
echo "REACT_APP_API_URL=http://localhost:3000" > frontend/.env

# 4. Update dependencies
npm update
cd frontend && npm update

# 5. Check memory limits
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Database Connection Issues

#### Issue: MongoDB connection timeout
**Symptoms:**
- "MongoTimeoutError: Server selection timed out"
- "ECONNREFUSED" errors
- Application hangs on database operations

**Diagnosis & Solutions:**
```bash
# 1. Check MongoDB service status
sudo systemctl status mongod     # Linux
brew services list | grep mongo  # macOS

# 2. Start MongoDB if stopped
sudo systemctl start mongod      # Linux
brew services start mongodb/brew/mongodb-community  # macOS

# 3. Test connection manually
mongo mongodb://localhost:27017/ordernimbus_dev

# 4. Check connection string format
# Correct format:
mongodb://username:password@host:port/database

# 5. Verify network connectivity
telnet localhost 27017
nc -zv localhost 27017

# 6. Check MongoDB logs
tail -f /var/log/mongodb/mongod.log  # Linux
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
```

**Advanced Debugging:**
```javascript
// Add connection debugging to your application
mongoose.set('debug', true);

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

### Authentication Problems

#### Issue: JWT token expired or invalid
**Symptoms:**
- "Invalid token" errors
- Users randomly logged out
- 401 Unauthorized responses

**Solutions:**
```bash
# 1. Check JWT secret configuration
echo $JWT_SECRET
# Should be a long, random string

# 2. Verify token expiration settings
grep JWT_EXPIRES_IN .env
# Default: 7d (7 days)

# 3. Test token generation/verification
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({userId: 'test'}, process.env.JWT_SECRET);
console.log('Generated token:', token);
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log('Decoded token:', decoded);
"

# 4. Check system clock synchronization
date
# Ensure server time is accurate
```

**Code Fix:**
```typescript
// Add better error handling for JWT
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token - user not found',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid token format',
        code: 'TOKEN_INVALID'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};
```

---

## Development Environment Troubleshooting

### Package Installation Issues

#### Issue: npm install fails with permission errors
**Solutions:**
```bash
# 1. Use node version manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 2. Fix npm permissions (Linux/macOS)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 3. Clear npm cache
npm cache clean --force

# 4. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Python dependencies fail to install
**Solutions:**
```bash
# 1. Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install python3-dev python3-pip build-essential

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. macOS specific (if using Apple Silicon)
pip install --upgrade pip setuptools wheel
pip install tensorflow-macos
pip install tensorflow-metal  # For GPU acceleration
```

### Docker Issues

#### Issue: Docker containers won't start
**Solutions:**
```bash
# 1. Check Docker daemon status
docker info
systemctl status docker  # Linux

# 2. Check container logs
docker-compose logs backend
docker-compose logs frontend

# 3. Remove orphaned containers
docker-compose down --remove-orphans
docker system prune -f

# 4. Rebuild containers
docker-compose build --no-cache
docker-compose up --force-recreate

# 5. Check port conflicts
docker ps
netstat -tulpn | grep :3000
```

#### Issue: MongoDB container data persistence
**Solutions:**
```yaml
# Update docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:5.0
    volumes:
      - mongodb_data:/data/db  # Named volume for persistence
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

volumes:
  mongodb_data:  # Define named volume
```

### Hot Reload Not Working

#### Issue: Frontend/backend changes not reflected
**Solutions:**
```bash
# Frontend (React)
# 1. Check if polling is enabled (needed for some systems)
echo "CHOKIDAR_USEPOLLING=true" >> frontend/.env

# 2. Increase file watcher limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 3. Restart development server
cd frontend
npm start

# Backend (Node.js with nodemon)
# 1. Check nodemon configuration
cat nodemon.json
# Should include:
{
  "watch": ["src"],
  "ext": "ts,js",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/index.ts"
}

# 2. Clear require cache (add to development setup)
if (process.env.NODE_ENV === 'development') {
  Object.keys(require.cache).forEach(key => {
    delete require.cache[key];
  });
}
```

---

## Production Issues

### Deployment Failures

#### Issue: AWS ECS deployment fails
**Symptoms:**
- Tasks fail to start
- Health check failures
- Service stuck in "PENDING" state

**Diagnosis:**
```bash
# 1. Check ECS service events
aws ecs describe-services \
  --cluster ordernimbus-cluster \
  --services ordernimbus-backend \
  --query 'services[0].events[0:10]'

# 2. Check task definition
aws ecs describe-task-definition \
  --task-definition ordernimbus-backend:latest

# 3. Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix /ecs/ordernimbus

# 4. Check task status
aws ecs list-tasks --cluster ordernimbus-cluster
aws ecs describe-tasks --cluster ordernimbus-cluster --tasks <task-arn>
```

**Solutions:**
```bash
# 1. Fix resource allocation
# Update task definition with adequate CPU/memory
{
  "cpu": "512",
  "memory": "1024",
  "requiresCompatibilities": ["FARGATE"]
}

# 2. Fix health check configuration
{
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3,
    "startPeriod": 60
  }
}

# 3. Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxx

# 4. Verify IAM roles and policies
aws iam get-role --role-name ecsTaskExecutionRole
```

#### Issue: Database connection fails in production
**Solutions:**
```bash
# 1. Check DocumentDB cluster status
aws docdb describe-db-clusters --db-cluster-identifier ordernimbus-cluster

# 2. Test connectivity from ECS task
# Add temporary debug container with network tools
docker run --rm -it --network container:<task-id> busybox
telnet docdb-cluster.cluster-xxx.docdb.amazonaws.com 27017

# 3. Verify connection string
# Ensure proper SSL configuration for DocumentDB
mongodb://username:password@cluster-endpoint:27017/database?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false

# 4. Check VPC and subnet configuration
aws ec2 describe-subnets --subnet-ids subnet-xxx
aws ec2 describe-route-tables --filters "Name=association.subnet-id,Values=subnet-xxx"
```

### Performance Degradation

#### Issue: High response times
**Diagnosis:**
```bash
# 1. Check system resources
top
htop
free -h
df -h

# 2. Monitor database performance
mongo ordernimbus --eval "db.runCommand({serverStatus: 1})"
mongo ordernimbus --eval "db.stats()"

# 3. Check slow queries
mongo ordernimbus --eval "db.setProfilingLevel(2, {slowms: 100})"
mongo ordernimbus --eval "db.system.profile.find().limit(5).sort({ts: -1}).pretty()"

# 4. Check connection pool status
mongo ordernimbus --eval "db.runCommand({connPoolStats: 1})"
```

**Solutions:**
```javascript
// 1. Add database indexes
db.salesData.createIndex({ userId: 1, storeId: 1, date: -1 });
db.salesData.createIndex({ storeId: 1, productName: 1 });
db.forecasts.createIndex({ userId: 1, createdAt: -1 });

// 2. Implement caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const getCachedData = async (key) => {
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
};

const setCachedData = async (key, data, ttl = 3600) => {
  await client.setex(key, ttl, JSON.stringify(data));
};

// 3. Optimize queries with pagination
const getSalesData = async (userId, page = 1, limit = 100) => {
  const skip = (page - 1) * limit;
  return SalesData.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);
};

// 4. Add request timeouts
app.use('/api', timeout('30s'));
```

---

## API & Integration Issues

### Shopify Integration Problems

#### Issue: OAuth flow fails
**Symptoms:**
- Users redirected to error page
- "Invalid shop domain" errors
- OAuth state mismatch

**Solutions:**
```bash
# 1. Verify Shopify app configuration
# Check in Shopify Partner Dashboard:
# - App URL: https://yourdomain.com
# - Allowed redirection URLs: https://yourdomain.com/api/connectors/shopify/oauth/callback

# 2. Check environment variables
echo $SHOPIFY_CLIENT_ID
echo $SHOPIFY_CLIENT_SECRET
echo $APP_BASE_URL

# 3. Validate shop domain format
# Must be: shopname.myshopify.com or just shopname
```

**Code Fixes:**
```typescript
// Fix OAuth state validation
const validateOAuthState = (state: string): boolean => {
  const stateData = oauthStates.get(state);
  if (!stateData) return false;
  
  // Check if state hasn't expired (10 minutes)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  if (stateData.timestamp < tenMinutesAgo) {
    oauthStates.delete(state);
    return false;
  }
  
  return true;
};

// Improve shop domain validation
const validateShopDomain = (shop: string): boolean => {
  // Remove .myshopify.com if present
  const shopName = shop.replace('.myshopify.com', '');
  
  // Validate shop name format
  const shopNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]$/;
  return shopNameRegex.test(shopName);
};
```

#### Issue: API rate limits exceeded
**Solutions:**
```typescript
class ShopifyRateLimiter {
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequest = 0;
  private readonly RATE_LIMIT_DELAY = 500; // 500ms between requests

  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequest;
          
          if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
            await this.delay(this.RATE_LIMIT_DELAY - timeSinceLastRequest);
          }
          
          this.lastRequest = Date.now();
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const requestFn = this.requestQueue.shift()!;
      await requestFn();
    }
    
    this.isProcessing = false;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Amazon SP-API Issues

#### Issue: Authentication failures
**Solutions:**
```bash
# 1. Verify SP-API credentials
# Check Amazon Seller Central > Settings > User Permissions

# 2. Validate IAM role permissions
# Required permissions for SP-API:
# - Execute-api:Invoke on SP-API endpoints
# - STS:AssumeRole if using role-based access

# 3. Check refresh token validity
# SP-API refresh tokens expire if not used for 12 months
```

**Implementation:**
```typescript
class AmazonSPAPIClient {
  private accessToken?: string;
  private tokenExpiry?: number;

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const tokenResponse = await this.refreshAccessToken();
    this.accessToken = tokenResponse.access_token;
    this.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
    
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret
    });

    const response = await axios.post(
      'https://api.amazon.com/auth/o2/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  }
}
```

---

## Database Problems

### Performance Issues

#### Issue: Slow queries
**Diagnosis:**
```bash
# 1. Enable profiling
mongo ordernimbus --eval "db.setProfilingLevel(2, {slowms: 100})"

# 2. Find slow queries
mongo ordernimbus --eval "
db.system.profile.find(
  { millis: { \$gte: 100 } }
).sort({ ts: -1 }).limit(10).pretty()
"

# 3. Check current operations
mongo ordernimbus --eval "db.currentOp()"

# 4. Check index usage
mongo ordernimbus --eval "
db.salesData.find({userId: 'xxx'}).explain('executionStats')
"
```

**Solutions:**
```javascript
// 1. Create proper indexes
db.salesData.createIndex({ userId: 1, storeId: 1, date: -1 });
db.salesData.createIndex({ storeId: 1, productName: 1 });
db.salesData.createIndex({ date: 1 });
db.forecasts.createIndex({ userId: 1, storeId: 1, createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });

// 2. Optimize aggregation pipelines
const optimizedPipeline = [
  { $match: { userId: ObjectId(userId), date: { $gte: startDate } } },
  { $group: { _id: '$productName', totalRevenue: { $sum: '$revenue' } } },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 }
];

// 3. Use projection to limit returned fields
const salesData = await SalesData.find(
  { userId },
  { productName: 1, revenue: 1, date: 1 } // Only return needed fields
);

// 4. Implement proper pagination
const getPaginatedSalesData = async (userId, page = 1, limit = 100) => {
  const skip = (page - 1) * limit;
  return SalesData.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip)
    .lean(); // Use lean() for read-only operations
};
```

#### Issue: Memory usage growing
**Solutions:**
```bash
# 1. Check MongoDB memory usage
mongo ordernimbus --eval "db.runCommand({serverStatus: 1}).mem"

# 2. Check for memory leaks in queries
mongo ordernimbus --eval "db.runCommand({top: 1})"

# 3. Set WiredTiger cache size (in production)
# Add to mongod.conf:
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2  # Adjust based on available RAM

# 4. Monitor with tools
mongostat
mongotop
```

### Data Corruption Issues

#### Issue: Inconsistent data
**Diagnosis:**
```javascript
// Check for orphaned records
db.salesData.find({ userId: { $nin: db.users.distinct('_id') } });

// Check for invalid dates
db.salesData.find({ date: { $type: 'string' } });

// Check for negative values
db.salesData.find({ $or: [{ quantity: { $lt: 0 } }, { revenue: { $lt: 0 } }] });
```

**Cleanup:**
```javascript
// Fix data type issues
db.salesData.updateMany(
  { date: { $type: 'string' } },
  [{ $set: { date: { $dateFromString: { dateString: '$date' } } } }]
);

// Remove orphaned records
db.salesData.deleteMany({ userId: { $nin: db.users.distinct('_id') } });

// Fix negative values
db.salesData.updateMany(
  { quantity: { $lt: 0 } },
  { $set: { quantity: 0 } }
);
```

---

## Authentication & Authorization Issues

### Session Management Problems

#### Issue: Users logged out randomly
**Diagnosis:**
```typescript
// Add session debugging
class SessionDebugService {
  static async validateSession(sessionId: string): Promise<SessionValidationResult> {
    const session = await Session.findOne({ sessionId });
    
    const result: SessionValidationResult = {
      sessionExists: !!session,
      isActive: session?.isActive || false,
      isExpired: session ? new Date() > session.expiresAt : true,
      userId: session?.userId,
      lastActivity: session?.lastActivity,
      debugInfo: {
        sessionId,
        currentTime: new Date(),
        expiry: session?.expiresAt,
        timeUntilExpiry: session ? session.expiresAt.getTime() - Date.now() : 0
      }
    };
    
    console.log('Session validation:', result);
    return result;
  }
}
```

**Solutions:**
```typescript
// Implement sliding session expiration
class SessionService {
  async extendSession(sessionId: string): Promise<void> {
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await Session.updateOne(
      { sessionId, isActive: true },
      { 
        expiresAt: newExpiry,
        lastActivity: new Date()
      }
    );
  }
  
  // Call this on each authenticated request
  async updateLastActivity(sessionId: string): Promise<void> {
    await Session.updateOne(
      { sessionId },
      { lastActivity: new Date() }
    );
  }
}

// Add session cleanup job
const cleanupExpiredSessions = async (): Promise<void> => {
  const result = await Session.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
  
  console.log(`Cleaned up ${result.deletedCount} expired sessions`);
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
```

### Permission Errors

#### Issue: Access denied for valid users
**Debugging:**
```typescript
// Add detailed permission logging
const checkPermissions = async (userId: string, resource: string, action: string): Promise<boolean> => {
  const user = await User.findById(userId).populate('role');
  
  console.log('Permission check:', {
    userId,
    userRole: user?.role,
    resource,
    action,
    userPermissions: user?.permissions,
    requiredPermission: `${action}:${resource}`
  });
  
  if (!user) {
    console.log('Permission denied: User not found');
    return false;
  }
  
  const hasPermission = user.permissions.includes(`${action}:${resource}`) ||
                       user.permissions.includes(`${action}:*`) ||
                       user.permissions.includes('*:*');
  
  console.log('Permission result:', hasPermission);
  return hasPermission;
};
```

---

## Performance Issues

### Frontend Performance

#### Issue: Slow React rendering
**Solutions:**
```typescript
// 1. Use React.memo for expensive components
const ExpensiveForecastChart = React.memo(({ data, onUpdate }) => {
  console.log('ForecastChart rendering');
  return <Chart data={data} onUpdate={onUpdate} />;
});

// 2. Optimize state updates
const useOptimizedState = <T>(initialValue: T) => {
  const [state, setState] = useState(initialValue);
  
  const setStateOptimized = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prevState)
        : newState;
      
      // Only update if state actually changed
      return JSON.stringify(nextState) !== JSON.stringify(prevState) 
        ? nextState 
        : prevState;
    });
  }, []);
  
  return [state, setStateOptimized] as const;
};

// 3. Virtualize large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedSalesData = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        {data[index].productName} - ${data[index].revenue}
      </div>
    )}
  </List>
);

// 4. Debounce search inputs
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

### Backend Performance

#### Issue: High CPU usage
**Diagnosis:**
```bash
# 1. Check process CPU usage
top -p $(pgrep -f "node.*index")

# 2. Profile Node.js application
node --prof src/index.js
# After running, analyze profile:
node --prof-process isolate-*.log > processed.txt

# 3. Use clinic.js for detailed analysis
npm install -g clinic
clinic doctor -- node src/index.js
clinic flame -- node src/index.js
```

**Solutions:**
```typescript
// 1. Implement request caching
const cache = new Map();

const getCachedResult = <T>(key: string, fetchFn: () => Promise<T>, ttl = 300000): Promise<T> => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }
  
  return fetchFn().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
};

// 2. Use worker threads for CPU-intensive tasks
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main thread
  const runMLCalculation = (data) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };
} else {
  // Worker thread
  const { calculateForecast } = require('./mlService');
  const result = calculateForecast(workerData);
  parentPort.postMessage(result);
}

// 3. Optimize database queries
const getOptimizedSalesData = async (userId: string, filters: any) => {
  // Use aggregation pipeline instead of multiple queries
  return SalesData.aggregate([
    { $match: { userId: new ObjectId(userId), ...filters } },
    { $group: {
        _id: '$productName',
        totalRevenue: { $sum: '$revenue' },
        totalQuantity: { $sum: '$quantity' },
        avgPrice: { $avg: { $divide: ['$revenue', '$quantity'] } }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 100 }
  ]);
};
```

---

## Security & Compliance Troubleshooting

### Security Alerts

#### Issue: Suspicious login attempts
**Investigation:**
```bash
# 1. Check audit logs
grep "failed_login" logs/security-$(date +%Y-%m-%d).log

# 2. Analyze IP patterns
awk '/failed_login/ {print $5}' logs/security-*.log | sort | uniq -c | sort -nr

# 3. Check for brute force patterns
grep -E "failed_login.*$(date +%Y-%m-%d)" logs/security-*.log | \
  awk '{print $5}' | sort | uniq -c | awk '$1 > 5 {print $2}'
```

**Response Actions:**
```typescript
// Implement account lockout
class SecurityService {
  async handleFailedLogin(userId: string, ipAddress: string): Promise<void> {
    const failedAttempts = await this.getFailedAttempts(userId, ipAddress);
    
    if (failedAttempts >= 5) {
      await this.lockAccount(userId);
      await this.blockIP(ipAddress);
      await this.notifySecurityTeam(userId, ipAddress, failedAttempts);
    }
  }
  
  private async lockAccount(userId: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      { 
        isLocked: true,
        lockedAt: new Date(),
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
    );
  }
  
  private async blockIP(ipAddress: string): Promise<void> {
    await IPBlacklist.create({
      ipAddress,
      reason: 'brute_force_attack',
      blockedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }
}
```

### Compliance Violations

#### Issue: Data retention policy violations
**Audit & Fix:**
```javascript
// Check for data retention violations
db.salesData.aggregate([
  {
    $match: {
      createdAt: { $lt: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000) } // 7 years
    }
  },
  {
    $group: {
      _id: '$userId',
      count: { $sum: 1 },
      oldestRecord: { $min: '$createdAt' }
    }
  }
]);

// Automated cleanup script
const cleanupOldData = async () => {
  const sevenYearsAgo = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000);
  
  const result = await SalesData.deleteMany({
    createdAt: { $lt: sevenYearsAgo }
  });
  
  console.log(`Deleted ${result.deletedCount} records older than 7 years`);
  
  // Log retention action
  await AuditLog.create({
    action: 'data_retention_cleanup',
    details: { deletedCount: result.deletedCount, cutoffDate: sevenYearsAgo },
    timestamp: new Date()
  });
};
```

---

## Frequently Asked Questions

### General Questions

#### Q: How do I reset my password?
**A:** Password reset functionality:
1. Click "Forgot Password" on login page
2. Enter your email address
3. Check email for reset link
4. Follow link and set new password
5. New password must meet security requirements

#### Q: Why is my forecast accuracy low?
**A:** Common reasons for low accuracy:
- **Insufficient data**: Need at least 30 days of historical data
- **Seasonal patterns**: Use Prophet model for seasonal businesses
- **Data quality**: Check for missing or inconsistent data
- **External factors**: Major events/promotions not captured in data

**Solutions:**
- Upload more historical data
- Try different forecasting models
- Clean and validate your data
- Use ensemble model for best results

#### Q: How do I connect multiple stores?
**A:** To connect additional stores:
1. Go to Connectors page
2. Click "Add New Store"
3. Select platform (Shopify, Amazon, CSV)
4. Follow authentication flow
5. Wait for initial data sync to complete

### Technical Questions

#### Q: What data formats are supported for CSV upload?
**A:** Required CSV columns:
- `date` (YYYY-MM-DD format)
- `productName` (string)
- `quantity` (positive number)
- `revenue` (positive number)

Optional columns:
- `category`, `cost`, `sku`, `productId`

#### Q: How often is data synchronized?
**A:** Synchronization frequency:
- **Shopify**: Every 4 hours automatically
- **Amazon**: Every 6 hours automatically  
- **Manual sync**: Available anytime via Connectors page
- **CSV uploads**: Processed immediately

#### Q: What forecasting models are available?
**A:** Available models:
- **LSTM Neural Network**: Best for complex patterns
- **ARIMA**: Good for stationary time series
- **Prophet**: Excellent for seasonal data
- **Ensemble**: Combines all models (recommended)

### Troubleshooting Questions

#### Q: Why can't I connect my Shopify store?
**A:** Common issues and solutions:
1. **Invalid credentials**: Verify store URL and access token
2. **Permissions**: Ensure app has required scopes
3. **Store not found**: Check spelling of store domain
4. **Network issues**: Try again in a few minutes

#### Q: My data isn't showing in forecasts. Why?
**A:** Possible causes:
1. **Recent upload**: Allow 5-10 minutes for processing
2. **Insufficient data**: Need minimum 30 days of history
3. **Data validation errors**: Check Data Ingestion page for errors
4. **Wrong store selected**: Verify correct store in forecast settings

#### Q: How do I improve forecast accuracy?
**A:** Best practices:
1. **Upload clean data**: Remove outliers and errors
2. **Include seasonal patterns**: Upload at least 1 year of data
3. **Regular updates**: Keep data current with frequent syncs
4. **Try different models**: Compare results across models
5. **Validate results**: Check predictions against known patterns

### Security Questions

#### Q: Is my data secure?
**A:** Security measures:
- **SOC 2 Type II compliant**
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Access control**: Role-based permissions
- **Monitoring**: 24/7 security monitoring
- **Auditing**: Comprehensive audit trails

#### Q: Can I export my data?
**A:** Data export options:
1. **Dashboard exports**: CSV/PDF from any chart
2. **API access**: Full data via REST API
3. **Data portability**: Complete account data export
4. **GDPR compliance**: Right to data portability

#### Q: How is data retained?
**A:** Retention policies:
- **Active accounts**: Data retained indefinitely
- **Inactive accounts**: 2 years after last login
- **Deleted accounts**: 30-day grace period
- **Audit logs**: 7 years for compliance

---

## Getting Help

### Support Channels

#### Community Support
- **GitHub Issues**: [https://github.com/ordernimbus/ordernimbus/issues](https://github.com/ordernimbus/ordernimbus/issues)
- **Documentation**: [https://docs.ordernimbus.com](https://docs.ordernimbus.com)
- **Community Forum**: [https://community.ordernimbus.com](https://community.ordernimbus.com)

#### Technical Support
- **Email**: support@ordernimbus.com
- **Response Time**: 
  - P0 (Critical): 1 hour
  - P1 (High): 4 hours
  - P2 (Medium): 24 hours
  - P3 (Low): 72 hours

#### Enterprise Support
- **Dedicated support team**
- **Slack integration**
- **Video conferencing**
- **Custom SLA agreements**

### Reporting Issues

#### Bug Reports
Include the following information:
- **Environment**: Development/Production
- **Version**: Application version number
- **Steps to reproduce**: Detailed reproduction steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Browser/OS**: Environment details
- **Screenshots/logs**: Supporting evidence

#### Feature Requests
- **Use case**: Why you need this feature
- **Acceptance criteria**: How you'll know it works
- **Priority**: Business impact level
- **Alternatives**: Current workarounds

### Emergency Procedures

#### Security Incidents
1. **Immediate**: Contact security@ordernimbus.com
2. **Phone**: +1-555-SECURITY (24/7 hotline)
3. **Provide**: Incident details, affected systems, timeline
4. **Follow up**: Written report within 24 hours

#### System Outages
1. **Check status**: https://status.ordernimbus.com
2. **Report**: If not listed, contact support@ordernimbus.com
3. **Updates**: Follow @OrderNimbusOps on Twitter
4. **Escalation**: Call emergency line for critical business impact

---

*This comprehensive troubleshooting guide covers the most common issues encountered with OrderNimbus. For issues not covered here, please contact our support team with detailed information about your problem.*