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

// ==================== STAFF ROUTES ====================
// Notifications
router.get('/notifications', staffOrAbove, adminController.getNotifications);
router.put('/notifications/:id/read', staffOrAbove, adminController.markNotificationRead);
router.put('/notifications/read-all', staffOrAbove, adminController.markAllNotificationsRead);

// Price change request (staff)
router.post('/products/request-price-change', staffOrAbove, adminController.requestPriceChange);

// Remove from sale request (staff - needs approval if staff)
router.post('/products/remove-from-sale', staffOrAbove, adminController.removeFromSale);

// ==================== MANAGER ROUTES ====================
// Stock logs
router.get('/stock-logs', managerOrAdmin, adminController.getStockLogs);
router.put('/stock-logs/:id/approve', managerOrAdmin, adminController.approveStockLog);

// Pending Approvals (manager and admin can approve)
router.get('/pending-approvals', managerOrAdmin, adminController.getPendingApprovals);
router.put('/pending-approvals/:id/approve', managerOrAdmin, adminController.approveRequest);
router.put('/pending-approvals/:id/reject', managerOrAdmin, adminController.rejectRequest);

// Return to sale (manager+)
router.post('/products/return-to-sale', managerOrAdmin, adminController.returnToSale);

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

// Removed products
router.get('/products/removed', adminController.getRemovedProducts);

// Activity logs
router.get('/activity-logs', adminController.getActivityLogs);

module.exports = router;
