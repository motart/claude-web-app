# OrderNimbus - Developer Onboarding Guide

## Welcome to OrderNimbus! 🚀

This comprehensive guide will help new developers quickly understand the codebase, set up their development environment, and start contributing effectively to OrderNimbus - our AI-powered sales forecasting platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Codebase Overview](#codebase-overview)
3. [Development Environment Setup](#development-environment-setup)
4. [Development Workflow](#development-workflow)
5. [Code Standards & Best Practices](#code-standards--best-practices)
6. [Testing Guidelines](#testing-guidelines)
7. [Common Development Tasks](#common-development-tasks)
8. [Debugging & Troubleshooting](#debugging--troubleshooting)
9. [Contributing Guidelines](#contributing-guidelines)
10. [Resources & Learning](#resources--learning)

---

## Getting Started

### What is OrderNimbus?

OrderNimbus is an enterprise-grade SaaS platform that provides:
- **AI-powered sales forecasting** using multiple ML models (LSTM, ARIMA, Prophet, Ensemble)
- **Multi-platform integrations** (Shopify, Amazon, CSV uploads)
- **Real-time analytics dashboards** with interactive visualizations
- **SOC 2 Type II compliance** with comprehensive security framework
- **Scalable AWS architecture** with containerized deployment

### Your First Week

#### Day 1: Environment Setup
- [ ] Complete [Development Environment Setup](#development-environment-setup)
- [ ] Run the application locally
- [ ] Explore the frontend interface
- [ ] Test API endpoints with Postman/curl

#### Day 2-3: Codebase Exploration
- [ ] Review [Codebase Overview](#codebase-overview)
- [ ] Read through key files in `/src` and `/frontend/src`
- [ ] Understand database models and API routes
- [ ] Review security middleware and authentication flow

#### Day 4-5: First Contribution
- [ ] Pick a "good first issue" from GitHub
- [ ] Follow the [Development Workflow](#development-workflow)
- [ ] Submit your first pull request
- [ ] Complete code review process

### Team Introduction

Schedule meetings with:
- **Product Manager**: Product roadmap and user stories
- **Tech Lead**: Architecture decisions and code reviews
- **DevOps Engineer**: Deployment and infrastructure
- **QA Engineer**: Testing processes and quality standards

---

## Codebase Overview

### Repository Structure

```
ordernimbus/
├── README.md                 # Project overview and quick start
├── package.json             # Backend dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── docker-compose.yml       # Local development containers
├── Dockerfile               # Backend container definition
│
├── src/                     # Backend source code
│   ├── index.ts            # Application entry point
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── security.ts     # Security headers & validation
│   │   ├── monitoring.ts   # Request/response logging
│   │   └── errorHandler.ts # Global error handling
│   ├── routes/             # API route handlers
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── connectors.ts   # Platform integrations
│   │   ├── dataIngestion.ts # Data upload/processing
│   │   ├── forecast.ts     # ML forecasting
│   │   └── stores.ts       # Store management
│   ├── models/             # MongoDB schemas
│   │   ├── User.ts         # User accounts
│   │   ├── SalesData.ts    # Sales transactions
│   │   ├── Forecast.ts     # ML predictions
│   │   └── AuditLog.ts     # Security audit trail
│   ├── services/           # Business logic
│   │   ├── MLService.ts    # Machine learning interface
│   │   ├── DataProcessor.ts # Data validation/cleaning
│   │   └── DataSyncService.ts # Platform synchronization
│   └── utils/              # Utility functions
│       ├── encryption.ts   # Data encryption
│       └── logger.ts       # Structured logging
│
├── frontend/               # React frontend
│   ├── package.json        # Frontend dependencies
│   ├── public/             # Static assets
│   └── src/
│       ├── App.tsx         # Main application component
│       ├── components/     # Reusable UI components
│       │   ├── Layout.tsx  # Page layout wrapper
│       │   ├── ProtectedRoute.tsx # Auth guard
│       │   └── AdvancedForecasting.tsx
│       ├── pages/          # Route-based pages
│       │   ├── Dashboard.tsx # Analytics dashboard
│       │   ├── Connectors.tsx # Platform integrations
│       │   ├── DataIngestion.tsx # Data upload
│       │   └── Forecasting.tsx # ML forecasting
│       ├── contexts/       # React Context providers
│       │   └── AuthContext.tsx # Authentication state
│       ├── services/       # API integration
│       │   └── api.ts      # HTTP client
│       └── types/          # TypeScript definitions
│
├── aws-cdk/               # Infrastructure as Code
│   ├── lib/               # CDK stack definitions
│   └── bin/               # CDK application entry
│
├── docs/                  # Documentation
│   ├── 01_PRODUCT_OVERVIEW.md
│   ├── 02_TECHNICAL_ARCHITECTURE.md
│   ├── 03_API_DOCUMENTATION.md
│   ├── 04_DEPLOYMENT_SETUP.md
│   └── 05_DEVELOPER_ONBOARDING.md (this file)
│
└── scripts/               # Utility scripts
    ├── generateDummyData.ts # Create sample data
    └── backup-mongodb.sh   # Database backup
```

### Key Technologies

#### Backend Stack
- **Node.js + TypeScript**: Server runtime and type safety
- **Express.js**: Web framework for REST API
- **MongoDB + Mongoose**: Database and object modeling
- **JWT + bcrypt**: Authentication and password hashing
- **Winston**: Structured logging
- **Joi**: Request validation
- **Helmet**: Security middleware

#### Frontend Stack
- **React 18 + TypeScript**: UI framework with type safety
- **Material-UI (MUI)**: Professional UI component library
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **Axios**: HTTP client for API calls
- **React Hook Form**: Form handling and validation

#### Machine Learning
- **TensorFlow.js**: Neural networks (LSTM)
- **Python**: ARIMA and Prophet models
- **NumPy/Pandas**: Data processing
- **Scikit-learn**: ML utilities

#### Infrastructure
- **Docker**: Containerization
- **AWS ECS Fargate**: Container hosting
- **DocumentDB**: MongoDB-compatible database
- **ElastiCache**: Redis caching
- **S3**: File storage
- **CloudWatch**: Monitoring and logging

---

## Development Environment Setup

### Prerequisites Checklist

Before starting, ensure you have:
- [ ] **Node.js 18+** installed
- [ ] **npm 8+** installed
- [ ] **MongoDB 5+** running locally
- [ ] **Python 3.8+** for ML models
- [ ] **Git** configured with your credentials
- [ ] **Code editor** (VS Code recommended)

### Quick Setup (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/your-org/ordernimbus.git
cd ordernimbus

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Generate security keys
openssl rand -hex 32 > .encryption_key
openssl rand -hex 64 > .jwt_secret

# 5. Update .env with generated keys
echo "ENCRYPTION_KEY=$(cat .encryption_key)" >> .env
echo "JWT_SECRET=$(cat .jwt_secret)" >> .env

# 6. Start development servers
npm run dev           # Backend (Terminal 1)
cd frontend && npm start  # Frontend (Terminal 2)
```

### Detailed Setup

#### 1. Backend Configuration

Create `.env` file:
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ordernimbus_dev
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here
LOG_LEVEL=debug

# Optional: Platform API keys for testing
SHOPIFY_CLIENT_ID=your-shopify-client-id
SHOPIFY_CLIENT_SECRET=your-shopify-client-secret
```

#### 2. Frontend Configuration

Create `frontend/.env`:
```bash
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=true
```

#### 3. Database Setup

```bash
# Start MongoDB
brew services start mongodb/brew/mongodb-community  # macOS
sudo systemctl start mongod                        # Linux

# Create sample data
npm run generate-data-clean
```

#### 4. Python Dependencies

```bash
# Install ML model dependencies
pip3 install pandas numpy scikit-learn tensorflow prophet statsmodels
```

### VS Code Setup

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "mongodb.mongodb-vscode",
    "ms-python.python",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascriptreact"
  }
}
```

#### Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

---

## Development Workflow

### Git Workflow

We use **Git Flow** with the following branches:
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation

#### Creating a Feature Branch
```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/add-new-forecasting-model

# Work on your feature...
git add .
git commit -m "feat: implement XGBoost forecasting model"

# Push branch
git push -u origin feature/add-new-forecasting-model
```

#### Commit Message Format
We follow **Conventional Commits**:
```bash
# Format: type(scope): description
git commit -m "feat(forecasting): add XGBoost model support"
git commit -m "fix(auth): resolve JWT token expiration issue"
git commit -m "docs(api): update authentication endpoints"
git commit -m "test(ml): add unit tests for ensemble model"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Pull Request Process

#### 1. Before Creating PR
```bash
# Ensure your branch is up to date
git checkout develop
git pull origin develop
git checkout feature/your-feature
git merge develop

# Run tests and linting
npm test
npm run lint
npm run typecheck

# Test the application manually
npm run dev
```

#### 2. Create Pull Request
- Use the PR template
- Include clear description of changes
- Reference related issues
- Add screenshots for UI changes
- Assign appropriate reviewers

#### 3. PR Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
```

### Code Review Guidelines

#### For Authors
- Keep PRs small and focused (< 400 lines)
- Write clear commit messages
- Add tests for new functionality
- Update documentation as needed
- Respond to feedback promptly

#### For Reviewers
- Review within 24 hours
- Focus on logic, security, and maintainability
- Provide constructive feedback
- Approve when satisfied with quality
- Use GitHub suggestions for minor fixes

---

## Code Standards & Best Practices

### TypeScript Guidelines

#### Type Safety
```typescript
// ✅ Good: Use explicit types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
}

function createUser(userData: Omit<User, 'id'>): User {
  return {
    id: generateId(),
    ...userData
  };
}

// ❌ Avoid: Using 'any'
function processData(data: any): any {
  return data.something;
}
```

#### Error Handling
```typescript
// ✅ Good: Proper error handling
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchUserData(id: string): Promise<User> {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Database error', 500, 'DB_ERROR');
  }
}
```

### React Guidelines

#### Component Structure
```typescript
// ✅ Good: Functional component with hooks
interface Props {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<Props> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await api.getUser(userId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{user.name}</Typography>
        <Typography color="textSecondary">{user.email}</Typography>
      </CardContent>
    </Card>
  );
};
```

#### State Management
```typescript
// ✅ Good: Use Context for shared state
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### API Design Guidelines

#### RESTful Endpoints
```typescript
// ✅ Good: RESTful design
GET    /api/users           # List users
GET    /api/users/:id       # Get specific user
POST   /api/users           # Create user
PUT    /api/users/:id       # Update user
DELETE /api/users/:id       # Delete user

GET    /api/users/:id/forecasts  # Get user's forecasts
POST   /api/forecasts            # Create forecast
```

#### Response Format
```typescript
// ✅ Good: Consistent response structure
interface APIResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Success response
{
  "data": {...},
  "message": "Operation successful"
}

// Error response
{
  "error": "Validation failed",
  "details": "Email is required"
}
```

### Database Guidelines

#### Schema Design
```typescript
// ✅ Good: Well-structured schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false  // Exclude from queries by default
  },
  profile: {
    name: { type: String, required: true },
    company: { type: String, required: true },
    avatar: String
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    }
  },
  audit: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: Date
  }
});

// Add indexes for performance
userSchema.index({ 'profile.company': 1 });
userSchema.index({ 'audit.createdAt': -1 });
```

### Security Best Practices

#### Input Validation
```typescript
// ✅ Good: Comprehensive validation
const userValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim(),
  company: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
});
```

#### Authentication Middleware
```typescript
// ✅ Good: Secure authentication
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Testing Guidelines

### Testing Strategy

We use a comprehensive testing approach:
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing

### Backend Testing

#### Unit Tests (Jest)
```typescript
// tests/services/MLService.test.ts
describe('MLService', () => {
  let mlService: MLService;

  beforeEach(() => {
    mlService = new MLService();
  });

  describe('generateForecast', () => {
    it('should generate ensemble forecast with valid data', async () => {
      const mockData = [
        { date: '2024-01-01', revenue: 100 },
        { date: '2024-01-02', revenue: 120 }
      ];

      const forecast = await mlService.generateForecast({
        userId: 'user123',
        storeId: 'store123',
        modelType: 'ensemble',
        forecastType: 'daily',
        forecastDays: 30,
        trainingPeriodDays: 365
      });

      expect(forecast).toHaveProperty('predictions');
      expect(forecast.predictions).toHaveLength(30);
      expect(forecast.modelType).toBe('ensemble');
      expect(forecast.accuracy.mape).toBeGreaterThan(0);
    });

    it('should throw error with insufficient data', async () => {
      const mockData = [{ date: '2024-01-01', revenue: 100 }];

      await expect(mlService.generateForecast({
        userId: 'user123',
        storeId: 'store123',
        modelType: 'lstm',
        forecastType: 'daily',
        forecastDays: 30,
        trainingPeriodDays: 365
      })).rejects.toThrow('Insufficient training data');
    });
  });
});
```

#### Integration Tests
```typescript
// tests/routes/auth.test.ts
describe('Authentication Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should create new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        company: 'Test Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        company: 'Test Company'
      };

      await request(app).post('/api/auth/register').send(userData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });
});
```

### Frontend Testing

#### Component Tests (React Testing Library)
```typescript
// frontend/src/components/__tests__/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../UserProfile';
import * as api from '../../services/api';

jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

describe('UserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display user information', async () => {
    const mockUser = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'ACME Corp'
    };

    mockApi.getUser.mockResolvedValue(mockUser);

    render(<UserProfile userId="123" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    mockApi.getUser.mockRejectedValue(new Error('User not found'));

    render(<UserProfile userId="invalid" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

#### E2E Tests (Cypress)
```typescript
// cypress/integration/forecasting.spec.ts
describe('Forecasting Workflow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
  });

  it('should generate forecast successfully', () => {
    cy.visit('/forecasting');
    
    // Select store
    cy.get('[data-testid="store-select"]').click();
    cy.get('[data-value="shopify_mystore"]').click();
    
    // Configure forecast
    cy.get('[data-testid="model-type"]').select('ensemble');
    cy.get('[data-testid="forecast-days"]').type('30');
    
    // Generate forecast
    cy.get('[data-testid="generate-button"]').click();
    
    // Verify results
    cy.get('[data-testid="forecast-chart"]').should('be.visible');
    cy.get('[data-testid="accuracy-metrics"]').should('contain', 'MAPE');
    cy.get('[data-testid="predictions-table"]').should('have.length.gt', 0);
  });
});
```

### Running Tests

```bash
# Backend tests
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report

# Frontend tests
cd frontend
npm test                   # Run component tests
npm run test:e2e          # Run E2E tests

# Database tests (with test database)
NODE_ENV=test npm test
```

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Define Route Handler**
```typescript
// src/routes/products.ts
router.get('/products', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { storeId, category, limit = 10, page = 1 } = req.query;
    
    const filter: any = { userId: req.user!._id };
    if (storeId) filter.storeId = storeId;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ name: 1 })
        .limit(Number(limit))
        .skip(skip),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});
```

2. **Add to Main App**
```typescript
// src/index.ts
import { productRoutes } from './routes/products';

app.use('/api/products', productRoutes);
```

3. **Add Tests**
```typescript
// tests/routes/products.test.ts
describe('Product Routes', () => {
  it('should list products with pagination', async () => {
    const response = await request(app)
      .get('/api/products?limit=5&page=1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.products).toHaveLength(5);
    expect(response.body.pagination.page).toBe(1);
  });
});
```

### Adding a New React Component

1. **Create Component**
```typescript
// frontend/src/components/ProductList.tsx
interface Product {
  id: string;
  name: string;
  category: string;
  revenue: number;
}

interface Props {
  storeId: string;
  onProductSelect?: (product: Product) => void;
}

export const ProductList: React.FC<Props> = ({ storeId, onProductSelect }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?storeId=${storeId}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <List>
      {products.map((product) => (
        <ListItem
          key={product.id}
          button
          onClick={() => onProductSelect?.(product)}
        >
          <ListItemText
            primary={product.name}
            secondary={`${product.category} • $${product.revenue}`}
          />
        </ListItem>
      ))}
    </List>
  );
};
```

2. **Add to Parent Component**
```typescript
// frontend/src/pages/Dashboard.tsx
import { ProductList } from '../components/ProductList';

export const Dashboard: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<string>('');

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ProductList
            storeId={selectedStore}
            onProductSelect={(product) => console.log(product)}
          />
        </Grid>
      </Grid>
    </Container>
  );
};
```

### Adding Database Migrations

1. **Create Migration Script**
```typescript
// scripts/migrations/001-add-product-categories.ts
import { connect, disconnect } from '../database';
import { Product } from '../models/Product';

async function migrate() {
  await connect();
  
  console.log('Starting migration: Add product categories');
  
  // Update products without category
  const result = await Product.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'Uncategorized' } }
  );
  
  console.log(`Updated ${result.modifiedCount} products`);
  
  await disconnect();
}

migrate().catch(console.error);
```

2. **Run Migration**
```bash
ts-node scripts/migrations/001-add-product-categories.ts
```

### Adding Environment Variables

1. **Update .env Files**
```bash
# .env.example
NEW_FEATURE_ENABLED=false
EXTERNAL_API_URL=https://api.example.com
EXTERNAL_API_KEY=your-api-key-here
```

2. **Add to Type Definitions**
```typescript
// src/types/environment.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    NEW_FEATURE_ENABLED: string;
    EXTERNAL_API_URL: string;
    EXTERNAL_API_KEY: string;
  }
}
```

3. **Use in Code**
```typescript
// src/config/index.ts
export const config = {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000'),
  database: {
    uri: process.env.MONGODB_URI
  },
  features: {
    newFeatureEnabled: process.env.NEW_FEATURE_ENABLED === 'true'
  },
  externalAPI: {
    url: process.env.EXTERNAL_API_URL,
    apiKey: process.env.EXTERNAL_API_KEY
  }
};
```

---

## Debugging & Troubleshooting

### Common Issues

#### Backend Issues

**Problem: Application won't start**
```bash
# Check Node.js version
node --version  # Should be 18+

# Check port availability
lsof -i :3000

# Check environment variables
printenv | grep NODE_ENV

# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"
```

**Problem: Database connection errors**
```bash
# Check MongoDB service
sudo systemctl status mongod

# Test connection manually
mongo mongodb://localhost:27017/ordernimbus_dev

# Check logs
tail -f logs/application-$(date +%Y-%m-%d).log
```

**Problem: Authentication issues**
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Test token generation
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({userId: 'test'}, process.env.JWT_SECRET);
console.log('Token:', token);
"

# Check user exists in database
mongo ordernimbus_dev --eval "db.users.findOne({email: 'test@example.com'})"
```

#### Frontend Issues

**Problem: Frontend won't start**
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3001
```

**Problem: API connection issues**
```bash
# Check API URL in frontend
grep -r "REACT_APP_API_URL" frontend/

# Test API from command line
curl http://localhost:3000/api/auth/me

# Check browser console for CORS errors
# Open DevTools > Console
```

**Problem: Build failures**
```bash
# Check TypeScript errors
npm run typecheck

# Fix linting issues
npm run lint --fix

# Clear build cache
rm -rf build/
npm run build
```

### Debugging Tools

#### Backend Debugging
```typescript
// Add debugging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

// Use debugger statements
async function processData(data: any) {
  debugger; // Execution will pause here
  const result = await transformData(data);
  console.log('Processed result:', result);
  return result;
}
```

#### Frontend Debugging
```typescript
// React DevTools
// Install browser extension: React Developer Tools

// Debug component state
const UserProfile: React.FC<Props> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Add debugging
  useEffect(() => {
    console.log('UserProfile mounted, userId:', userId);
  }, []);
  
  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);
  
  return (
    <div>
      {process.env.NODE_ENV === 'development' && (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      )}
      {/* Component content */}
    </div>
  );
};
```

#### Database Debugging
```bash
# Enable MongoDB query logging
mongo ordernimbus_dev --eval "db.setProfilingLevel(2, {slowms: 0})"

# View query log
mongo ordernimbus_dev --eval "db.system.profile.find().limit(5).sort({ts: -1}).pretty()"

# Analyze query performance
mongo ordernimbus_dev --eval "db.salesData.find({storeId: 'store123'}).explain('executionStats')"
```

### Performance Debugging

#### Backend Performance
```bash
# Monitor memory usage
node --max-old-space-size=4096 src/index.js

# Generate heap dump
kill -SIGUSR2 <node-process-id>

# Use clinic.js for performance analysis
npm install -g clinic
clinic doctor -- node src/index.js
clinic flame -- node src/index.js
```

#### Frontend Performance
```typescript
// Use React Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component rendered:', {
    id,
    phase,
    actualDuration
  });
}

<Profiler id="UserProfile" onRender={onRenderCallback}>
  <UserProfile userId={userId} />
</Profiler>

// Optimize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Optimize component renders
const OptimizedComponent = React.memo(MyComponent);
```

---

## Contributing Guidelines

### Before Contributing

1. **Check existing issues** - Look for related issues or feature requests
2. **Discuss major changes** - Create an issue to discuss significant changes
3. **Follow conventions** - Adhere to coding standards and commit message format
4. **Write tests** - Include tests for new functionality
5. **Update documentation** - Keep docs current with changes

### Pull Request Checklist

- [ ] Branch is up to date with `develop`
- [ ] All tests pass (`npm test`)
- [ ] Code follows style guidelines (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No sensitive information committed
- [ ] PR description clearly explains changes

### Code Review Process

1. **Self-review** - Review your own changes first
2. **Request review** - Assign appropriate reviewers
3. **Address feedback** - Respond to review comments promptly
4. **Update based on feedback** - Make requested changes
5. **Get approval** - Ensure at least one approval before merging

### Release Process

1. **Feature freeze** - All features merged to `develop`
2. **Create release branch** - `git checkout -b release/v1.2.0`
3. **Update version** - Update package.json versions
4. **Test release** - Deploy to staging and test thoroughly
5. **Merge to main** - Create PR from release branch to `main`
6. **Tag release** - Create git tag with version number
7. **Deploy production** - Deploy tagged version to production

---

## Resources & Learning

### Documentation Links

- **Product Overview**: [01_PRODUCT_OVERVIEW.md](./01_PRODUCT_OVERVIEW.md)
- **Technical Architecture**: [02_TECHNICAL_ARCHITECTURE.md](./02_TECHNICAL_ARCHITECTURE.md)
- **API Documentation**: [03_API_DOCUMENTATION.md](./03_API_DOCUMENTATION.md)
- **Deployment Guide**: [04_DEPLOYMENT_SETUP.md](./04_DEPLOYMENT_SETUP.md)

### External Resources

#### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Best Practices](https://typescript-eslint.io/docs/)

#### React
- [React Documentation](https://react.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Material-UI Documentation](https://mui.com/)

#### Node.js & Express
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

#### MongoDB
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

#### AWS
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [ECS Fargate User Guide](https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html)

### Development Tools

#### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Thunder Client** (API testing)

#### Useful npm Packages
```bash
# Development utilities
npm install -g nodemon          # Auto-restart server
npm install -g ts-node          # Run TypeScript directly
npm install -g @storybook/cli   # Component documentation

# Testing
npm install -g jest             # Test runner
npm install -g cypress          # E2E testing
```

### Getting Help

#### Internal Resources
- **Slack channels**: #development, #questions, #architecture
- **Team wiki**: Internal documentation and decisions
- **1:1 meetings**: Weekly with tech lead or mentor

#### External Communities
- **Stack Overflow**: Tag questions with relevant technologies
- **GitHub Discussions**: Project-specific questions
- **Discord/Reddit**: Community support for specific technologies

### Learning Path for New Developers

#### Week 1: Environment & Basics
- [ ] Set up development environment
- [ ] Read product overview and architecture docs
- [ ] Complete first feature implementation
- [ ] Understand authentication flow

#### Week 2: Core Features
- [ ] Work on data ingestion features
- [ ] Understand ML forecasting pipeline
- [ ] Implement frontend components
- [ ] Write comprehensive tests

#### Week 3: Advanced Topics
- [ ] Learn security implementation
- [ ] Understand deployment process
- [ ] Contribute to architectural decisions
- [ ] Mentor other new developers

#### Ongoing Learning
- [ ] Stay updated with technology changes
- [ ] Contribute to documentation
- [ ] Participate in code reviews
- [ ] Share knowledge through tech talks

---

**Welcome to the OrderNimbus team! 🎉**

Remember, the best way to learn is by doing. Don't hesitate to ask questions, experiment with the code, and contribute your ideas. We're here to support your growth and success!

For any questions about this onboarding guide or the codebase, reach out to:
- **Tech Lead**: @tech-lead on Slack
- **DevOps**: @devops-team on Slack  
- **Product**: @product-team on Slack

Happy coding! 🚀