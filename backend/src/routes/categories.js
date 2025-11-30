const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategory);

// Admin routes
router.use(authenticate, adminOnly);

router.get('/admin/all', categoryController.getAllCategories);
router.post('/', uploadSingle('image'), categoryController.createCategory);
router.put('/:id', uploadSingle('image'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.put('/admin/order', categoryController.updateCategoryOrder);

module.exports = router;
