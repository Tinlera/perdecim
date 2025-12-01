const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Geçerli bir email adresi girin'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Şifre en az 8 karakter olmalı')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli'),
  body('firstName').trim().notEmpty().withMessage('Ad gerekli'),
  body('lastName').trim().notEmpty().withMessage('Soyad gerekli')
];

const loginValidation = [
  body('email').isEmail().withMessage('Geçerli bir email adresi girin'),
  body('password').notEmpty().withMessage('Şifre gerekli')
];

// Public routes
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Google OAuth
router.post('/google', authLimiter, [
  body('googleId').notEmpty().withMessage('Google ID gerekli'),
  body('email').isEmail().withMessage('Geçerli bir email adresi gerin'),
  body('firstName').trim().notEmpty().withMessage('Ad gerekli'),
  body('lastName').trim().notEmpty().withMessage('Soyad gerekli')
], authController.googleAuth);

// Password reset routes (public)
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().withMessage('Geçerli bir email adresi girin')
], authController.forgotPassword);

router.post('/reset-password', authLimiter, [
  body('token').notEmpty().withMessage('Token gerekli'),
  body('newPassword').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı')
], authController.resetPassword);

router.get('/verify-reset-token/:token', authController.verifyResetToken);

// 2FA routes
router.post('/2fa/verify', authController.verify2FA);

// Protected routes
router.use(authenticate);

router.get('/me', authController.me);
router.post('/logout', authController.logout);
router.put('/profile', authController.updateProfile);
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Mevcut şifre gerekli'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Yeni şifre en az 8 karakter olmalı')
], authController.changePassword);

// 2FA setup (authenticated)
router.post('/2fa/setup', authController.setup2FA);
router.post('/2fa/disable', authController.disable2FA);

module.exports = router;
