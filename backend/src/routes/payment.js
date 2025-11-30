const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Initialize payment (authenticated)
router.post('/initialize', authenticate, paymentController.initializePayment);

// Payment callback (public - called by Iyzico)
router.post('/callback', paymentController.paymentCallback);

// Check payment status (authenticated)
router.get('/status/:orderId', authenticate, paymentController.checkPaymentStatus);

// Test payment (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', authenticate, paymentController.testPayment);
}

// Refund (admin only)
router.post('/refund', authenticate, adminOnly, paymentController.refundPayment);

module.exports = router;
