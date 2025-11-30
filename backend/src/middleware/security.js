const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

// Rate limiting
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Genel rate limiter
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 dakika
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

// Auth rate limiter (daha katı)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 dakika
  5, // 5 deneme
  'Çok fazla giriş denemesi, 15 dakika sonra tekrar deneyin'
);

// API rate limiter
const apiLimiter = createRateLimiter(
  60 * 1000, // 1 dakika
  60 // 60 istek/dakika
);

// Helmet güvenlik ayarları
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL]
    }
  },
  crossOriginEmbedderPolicy: false
});

// XSS temizleme middleware
const xssClean = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

const sanitizeString = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// CORS ayarları
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Postman ve benzeri araçlar için origin olmayabilir
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS politikası tarafından engellendi'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error('Hata:', err);

  // Sequelize validation hatası
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Doğrulama hatası',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint hatası
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Bu kayıt zaten mevcut',
      errors: err.errors.map(e => ({
        field: e.path,
        message: `Bu ${e.path} zaten kullanılıyor`
      }))
    });
  }

  // JWT hatası
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }

  // Multer dosya boyutu hatası
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Dosya boyutu çok büyük'
    });
  }

  // Genel hata
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Sunucu hatası oluştu'
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı'
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  helmetConfig,
  xssClean,
  corsOptions,
  errorHandler,
  notFoundHandler,
  hpp: hpp()
};
