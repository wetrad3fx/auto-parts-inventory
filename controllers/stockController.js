const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const recordStockMovement = async (req, res, next) => {
  try {
    const { product_id, movement_type, quantity, unit_price, notes } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Automobile part product not found.' });
    }

    const qtyNumber = parseInt(quantity);
    let stockChange = 0;

    if (movement_type === 'IN') {
      stockChange = Math.abs(qtyNumber);
    } else if (movement_type === 'OUT') {
      stockChange = -Math.abs(qtyNumber);
      if (product.quantity_in_stock + stockChange < 0) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Current stock is ${product.quantity_in_stock}, requested output is ${Math.abs(qtyNumber)}.`
        });
      }
    } else if (movement_type === 'ADJUSTMENT') {
      stockChange = qtyNumber; // Can be positive or negative
      if (product.quantity_in_stock + stockChange < 0) {
        return res.status(400).json({
          success: false,
          message: `Adjustment would result in negative stock count (${product.quantity_in_stock + stockChange}).`
        });
      }
    }

    // Update quantity in products table
    const updatedProduct = await Product.updateQuantity(product_id, stockChange);

    // Record movement audit log
    const log = await StockMovement.create({
      product_id,
      user_id: userId,
      movement_type,
      quantity: Math.abs(qtyNumber),
      unit_price: unit_price || product.unit_price,
      notes
    });

    res.status(201).json({
      success: true,
      message: `Stock movement logged successfully (${movement_type}).`,
      data: {
        movement: log,
        updated_stock: updatedProduct.quantity_in_stock
      }
    });
  } catch (err) {
    next(err);
  }
};

const getStockLogs = async (req, res, next) => {
  try {
    const { product_id, limit } = req.query;
    const logs = await StockMovement.getAll({ product_id, limit: limit || 100 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordStockMovement,
  getStockLogs
};
