const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');

// Public routes
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProduct);

// Admin routes
router.use(authenticate, adminOnly);

router.get('/admin/all', productController.getAllProducts);

router.post('/', 
  uploadFields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  productController.createProduct
);

router.put('/:id',
  uploadFields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  productController.updateProduct
);

router.delete('/:id', productController.deleteProduct);

// Image routes
router.post('/:id/images', 
  uploadFields([{ name: 'image', maxCount: 1 }]),
  productController.uploadProductImage
);
router.delete('/:id/images/:imageId', productController.deleteProductImage);
router.put('/:id/images/:imageId/featured', productController.setFeaturedImage);

// Variant routes
router.post('/:id/variants', productController.addVariant);
router.put('/:id/variants/:variantId', productController.updateVariant);
router.delete('/:id/variants/:variantId', productController.deleteVariant);

module.exports = router;
