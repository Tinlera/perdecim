const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { User, Setting } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Token oluşturma
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Kayıt
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Şifre hash
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcı oluştur
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'customer'
    });

    // Token oluştur
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Refresh token kaydet
    await user.update({ refreshToken });

    // Hoşgeldiniz emaili gönder
    try {
      const emailEnabled = await Setting.findOne({ where: { key: 'email_welcome_enabled' } });
      if (emailEnabled?.value === 'true') {
        await emailService.sendWelcomeEmail(user);
      }

      // Admin'e yeni üye bildirimi
      const adminNotifyEnabled = await Setting.findOne({ where: { key: 'email_new_user_notify' } });
      const adminEmail = await Setting.findOne({ where: { key: 'admin_notification_email' } });
      if (adminNotifyEnabled?.value === 'true' && adminEmail?.value) {
        await emailService.sendNewUserNotification(user, adminEmail.value);
      }
    } catch (emailError) {
      console.error('[Auth] Email gönderme hatası:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Giriş
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Hesap aktif mi?
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmış'
      });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // 2FA aktif mi?
    if (user.twoFactorEnabled) {
      // Geçici token oluştur (2FA doğrulaması için)
      const tempToken = jwt.sign(
        { id: user.id, require2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        success: true,
        message: '2FA doğrulaması gerekli',
        data: {
          require2FA: true,
          tempToken
        }
      });
    }

    // Token oluştur
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Refresh token ve son giriş güncelle
    await user.update({
      refreshToken,
      lastLogin: new Date()
    });

    // Rol bazlı yönlendirme bilgisi
    const redirectPath = getRedirectPath(user.role);

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        },
        accessToken,
        refreshToken,
        redirectPath
      }
    });
  } catch (error) {
    next(error);
  }
};

// Rol bazlı yönlendirme
const getRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'manager':
    case 'staff':
      return '/staff';
    default:
      return '/';
  }
};

// 2FA Kurulumu
exports.setup2FA = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Secret oluştur
    const secret = speakeasy.generateSecret({
      name: `${process.env.TWO_FA_APP_NAME || 'Perdecim'}:${user.email}`
    });

    // Geçici olarak secret'ı kaydet (henüz aktif değil)
    await user.update({ twoFactorSecret: secret.base32 });

    // QR kod oluştur
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2FA Doğrulama ve Aktivasyon
exports.verify2FA = async (req, res, next) => {
  try {
    const { token, tempToken } = req.body;
    let userId;

    // Giriş sırasında 2FA doğrulama
    if (tempToken) {
      try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.require2FA) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz token'
          });
        }
        userId = decoded.id;
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Token süresi dolmuş, tekrar giriş yapın'
        });
      }
    } else {
      // 2FA kurulum doğrulama
      userId = req.user.id;
    }

    const user = await User.findByPk(userId);

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA kurulumu yapılmamış'
      });
    }

    // Token doğrula
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // Giriş sırasında doğrulama
    if (tempToken) {
      const { accessToken, refreshToken } = generateTokens(user.id);

      await user.update({
        refreshToken,
        lastLogin: new Date()
      });

      const redirectPath = getRedirectPath(user.role);

      return res.json({
        success: true,
        message: 'Giriş başarılı',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled
          },
          accessToken,
          refreshToken,
          redirectPath
        }
      });
    }

    // 2FA aktivasyonu
    await user.update({ twoFactorEnabled: true });

    res.json({
      success: true,
      message: '2FA başarıyla aktifleştirildi'
    });
  } catch (error) {
    next(error);
  }
};

// 2FA Devre Dışı Bırakma
exports.disable2FA = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findByPk(req.user.id);

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Şifre hatalı'
      });
    }

    // 2FA token kontrolü
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    await user.update({
      twoFactorEnabled: false,
      twoFactorSecret: null
    });

    res.json({
      success: true,
      message: '2FA devre dışı bırakıldı'
    });
  } catch (error) {
    next(error);
  }
};

// Token Yenileme
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token gerekli'
      });
    }

    // Token doğrula
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz refresh token'
      });
    }

    // Kullanıcı ve token kontrolü
    const user = await User.findOne({
      where: {
        id: decoded.id,
        refreshToken
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz refresh token'
      });
    }

    // Yeni tokenlar oluştur
    const tokens = generateTokens(user.id);

    // Refresh token güncelle
    await user.update({ refreshToken: tokens.refreshToken });

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

// Çıkış
exports.logout = async (req, res, next) => {
  try {
    await User.update(
      { refreshToken: null },
      { where: { id: req.user.id } }
    );

    res.json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    next(error);
  }
};

// Mevcut kullanıcı bilgisi
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'twoFactorSecret', 'refreshToken'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Şifre değiştirme
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // Admin şifre değişikliği kısıtlaması
    if (user.role === 'admin' || user.canChangePassword === false) {
      return res.status(403).json({
        success: false,
        message: 'Yönetici şifresi web üzerinden değiştirilemez. Lütfen sistem yöneticisi ile iletişime geçin.'
      });
    }

    // Mevcut şifre kontrolü
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mevcut şifre hatalı'
      });
    }

    // Yeni şifre hash
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth ile giriş/kayıt
exports.googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, firstName, lastName, avatar } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID ve email gerekli'
      });
    }

    // Önce Google ID ile ara
    let user = await User.findOne({ where: { googleId } });

    if (!user) {
      // Email ile ara
      user = await User.findOne({ where: { email } });

      if (user) {
        // Mevcut hesabı Google ile bağla
        await user.update({ googleId, avatar: avatar || user.avatar });
      } else {
        // Yeni kullanıcı oluştur
        user = await User.create({
          googleId,
          email,
          firstName,
          lastName,
          avatar,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // Random password
          role: 'customer',
          canChangePassword: true
        });

        // Hoşgeldiniz emaili gönder
        try {
          const emailEnabled = await Setting.findOne({ where: { key: 'email_welcome_enabled' } });
          if (emailEnabled?.value === 'true') {
            await emailService.sendWelcomeEmail(user);
          }
        } catch (emailError) {
          console.error('[Auth] Email gönderme hatası:', emailError.message);
        }
      }
    }

    // Hesap aktif mi?
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmış'
      });
    }

    // Token oluştur
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Refresh token ve son giriş güncelle
    await user.update({
      refreshToken,
      lastLogin: new Date()
    });

    const redirectPath = getRedirectPath(user.role);

    res.json({
      success: true,
      message: 'Google ile giriş başarılı',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          twoFactorEnabled: user.twoFactorEnabled
        },
        accessToken,
        refreshToken,
        redirectPath
      }
    });
  } catch (error) {
    next(error);
  }
};

// Profil güncelleme
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    await User.update(
      { firstName, lastName, phone },
      { where: { id: req.user.id } }
    );

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'twoFactorSecret', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] }
    });

    res.json({
      success: true,
      message: 'Profil güncellendi',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Şifremi Unuttum - Reset token oluştur ve email gönder
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    
    // Güvenlik: Kullanıcı bulunamasa bile aynı mesajı ver
    if (!user) {
      return res.json({
        success: true,
        message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi'
      });
    }

    // Reset token oluştur (32 byte hex string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token'ı hashle ve kaydet
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Token'ı kullanıcıya kaydet (1 saat geçerli)
    await user.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 saat
    });

    // Email gönderimi (gerçek implementasyonda nodemailer kullanılacak)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // TODO: Email servisi entegrasyonu
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Şifre Sıfırlama',
    //   html: `<p>Şifrenizi sıfırlamak için <a href="${resetUrl}">buraya tıklayın</a>. Bu link 1 saat geçerlidir.</p>`
    // });

    console.log(`[DEV] Şifre sıfırlama linki: ${resetUrl}`);

    res.json({
      success: true,
      message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi',
      // Development ortamında token'ı döndür (production'da kaldırılacak)
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });
  } catch (error) {
    next(error);
  }
};

// Şifre Sıfırlama - Token ile yeni şifre belirle
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token ve yeni şifre gerekli'
      });
    }

    // Şifre uzunluk kontrolü
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Token'ı hashle
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Token ile kullanıcıyı bul ve süresinin dolmadığını kontrol et
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Yeni şifreyi hashle ve kaydet
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await user.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null // Güvenlik için tüm oturumları kapat
    });

    res.json({
      success: true,
      message: 'Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.'
    });
  } catch (error) {
    next(error);
  }
};

// Reset token geçerliliğini kontrol et
exports.verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    res.json({
      success: true,
      message: 'Token geçerli'
    });
  } catch (error) {
    next(error);
  }
};
