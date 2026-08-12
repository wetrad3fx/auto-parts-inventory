const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { validateCategory } = require('../middleware/validateMiddleware');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getAllCategories);
router.get('/:id', authenticateToken, getCategoryById);
router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), validateCategory, createCategory);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), validateCategory, updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteCategory);

module.exports = router;
