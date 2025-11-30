const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, adminOnly, managerOrAdmin, staffOrAbove } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Customer routes
router.get('/favorites', userController.getFavorites);
router.post('/favorites', userController.addToFavorites);
router.delete('/favorites/:productId', userController.removeFromFavorites);

router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:id', userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);

// Staff list (Manager/Admin)
router.get('/staff', managerOrAdmin, userController.getStaffList);

// Admin routes
router.get('/', adminOnly, userController.getUsers);
router.get('/:id', adminOnly, userController.getUser);
router.post('/', managerOrAdmin, userController.createUser);
router.put('/:id', adminOnly, userController.updateUser);
router.delete('/:id', adminOnly, userController.deleteUser);
router.put('/:id/role', managerOrAdmin, userController.changeUserRole);

module.exports = router;
