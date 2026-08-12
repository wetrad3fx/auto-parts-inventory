const express = require('express');
const router = express.Router();
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { validateSupplier } = require('../middleware/validateMiddleware');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getAllSuppliers);
router.get('/:id', authenticateToken, getSupplierById);
router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), validateSupplier, createSupplier);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), validateSupplier, updateSupplier);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSupplier);

module.exports = router;
