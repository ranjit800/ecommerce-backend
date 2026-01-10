import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDatabase from './config/database.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDatabase();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet()); // Security headers

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
  ],
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Logging Middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Import Routes
import authRoutes from './routes/auth.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// API Info Route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Vendor E-commerce API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth (register, login, logout, me)',
      vendor: '/api/vendor (apply, profile, stats, shop)',
      superadmin: '/api/superadmin (vendors, stats, approve/reject)',
      products: '/api/products (CRUD, search, filter)',
      categories: '/api/categories (CRUD, hierarchical)',
      cart: '/api/cart (add, update, remove, grouped)',
      orders: '/api/orders (create, track, vendor management)',
    },
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler (will be moved to middleware later)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`\n✅ Backend is ready!\n`);
});

export default app;
