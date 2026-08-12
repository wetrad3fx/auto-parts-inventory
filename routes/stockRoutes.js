const express = require('express');
const router = express.Router();
const { recordStockMovement, getStockLogs } = require('../controllers/stockController');
const { validateStockMovement } = require('../middleware/validateMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/logs', authenticateToken, getStockLogs);
router.post('/movement', authenticateToken, validateStockMovement, recordStockMovement);

module.exports = router;
