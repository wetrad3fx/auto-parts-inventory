const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} = require('../controllers/productController');
const { validateProduct } = require('../middleware/validateMiddleware');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public read or protected read
router.get('/', authenticateToken, getAllProducts);
router.get('/low-stock', authenticateToken, getLowStockProducts);
router.get('/:id', authenticateToken, getProductById);

// Admin & Manager write privileges
router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), validateProduct, createProduct);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), validateProduct, updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteProduct);

module.exports = router;
