const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, adminOnly, managerOrAdmin, staffOrAbove } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');

// All admin routes require authentication
router.use(authenticate);

// ==================== PUBLIC (for frontend) ====================
// Banners (public get)
router.get('/banners/active', adminController.getBanners);

// Pages (public get)
router.get('/pages/:slug', adminController.getPage);

// Settings (public get - limited)
router.get('/settings/public', adminController.getSettings);

// Coupon validation (public)
router.post('/coupons/validate', adminController.validateCoupon);

// ==================== STAFF ROUTES ====================
// Sales logs (staff can see their own)
router.get('/sales-logs', staffOrAbove, adminController.getSalesLogs);

// ==================== MANAGER ROUTES ====================
// Stock logs
router.get('/stock-logs', managerOrAdmin, adminController.getStockLogs);
router.put('/stock-logs/:id/approve', managerOrAdmin, adminController.approveStockLog);

// ==================== ADMIN ONLY ROUTES ====================
router.use(adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Banners
router.get('/banners', adminController.getBanners);
router.post('/banners', 
  uploadFields([
    { name: 'image', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
  ]),
  adminController.createBanner
);
router.put('/banners/:id',
  uploadFields([
    { name: 'image', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
  ]),
  adminController.updateBanner
);
router.delete('/banners/:id', adminController.deleteBanner);

// Pages
router.get('/pages', adminController.getPages);
router.post('/pages', adminController.createPage);
router.put('/pages/:id', adminController.updatePage);
router.delete('/pages/:id', adminController.deletePage);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

module.exports = router;
