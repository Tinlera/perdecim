const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Cart routes (optional auth - guest cart supported)
router.get('/', optionalAuth, cartController.getCart);
router.post('/add', optionalAuth, cartController.addToCart);
router.put('/items/:itemId', optionalAuth, cartController.updateCartItem);
router.delete('/items/:itemId', optionalAuth, cartController.removeFromCart);
router.delete('/clear', optionalAuth, cartController.clearCart);

// Merge cart after login (authenticated)
router.post('/merge', authenticate, cartController.mergeCart);

module.exports = router;
