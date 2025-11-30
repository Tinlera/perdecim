const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, staffOrAbove, adminOnly } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// Staff/Admin routes
router.get('/', staffOrAbove, orderController.getAllOrders);
router.put('/:id/status', staffOrAbove, orderController.updateOrderStatus);

// Admin routes
router.get('/stats/overview', adminOnly, orderController.getOrderStats);

module.exports = router;
