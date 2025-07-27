import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { authRoutes } from './routes/auth';
import { dataIngestionRoutes } from './routes/dataIngestion';
import { forecastRoutes } from './routes/forecast';
import { connectorRoutes } from './routes/connectors';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/data', dataIngestionRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/connectors', connectorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // In development, serve a simple message for non-API routes
  app.get('*', (req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      message: 'This is the API server. The frontend should be running on port 3001.',
      availableRoutes: [
        'GET /health',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/auth/me'
      ]
    });
  });
}

app.use(errorHandler);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/retail-forecast');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);