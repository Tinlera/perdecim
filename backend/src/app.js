const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const routes = require('./routes');
const { initializeAdmin } = require('./utils/initializeAdmin');
const {
  helmetConfig,
  corsOptions,
  generalLimiter,
  xssClean,
  errorHandler,
  notFoundHandler,
  hpp
} = require('./middleware/security');

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(hpp);
app.use(xssClean);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', generalLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Connect to Redis (optional)
    await connectRedis();

    // Initialize admin user and default settings
    await initializeAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Server başlatma hatası:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
