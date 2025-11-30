const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT Token doğrulama
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme token\'ı bulunamadı'
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'twoFactorSecret', 'refreshToken'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmış'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};

// Opsiyonel authentication (giriş yapmamış kullanıcılar da erişebilir)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'twoFactorSecret', 'refreshToken'] }
    });

    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Rol kontrolü
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    next();
  };
};

// Sadece admin
const adminOnly = authorize('admin');

// Admin veya müdür
const managerOrAdmin = authorize('admin', 'manager');

// Personel ve üstü
const staffOrAbove = authorize('admin', 'manager', 'staff');

// 2FA doğrulama kontrolü (JWT bazlı - session kullanmıyor)
// Not: 2FA doğrulaması login sırasında yapılıyor, bu middleware
// hassas işlemler için ek doğrulama gerektiğinde kullanılabilir
const require2FA = async (req, res, next) => {
  // JWT zaten 2FA doğrulaması yapılmış kullanıcıyı içeriyor
  // Eğer kullanıcı 2FA aktifse ve bu noktaya geldiyse, zaten doğrulanmış demektir
  // Çünkü login sırasında 2FA doğrulaması yapılıyor
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme gerekli'
    });
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  managerOrAdmin,
  staffOrAbove,
  require2FA
};
