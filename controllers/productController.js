const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const getAllProducts = async (req, res, next) => {
  try {
    const { search, category_id, supplier_id, stock_status } = req.query;
    const products = await Product.getAll({ search, category_id, supplier_id, stock_status });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Automobile part product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const existing = await Product.findByPartNumber(req.body.part_number);
    if (existing) {
      return res.status(400).json({ success: false, message: `OEM Part Number '${req.body.part_number}' already exists.` });
    }

    const newProduct = await Product.create(req.body);

    // Record initial stock movement log if initial stock > 0
    if (newProduct.quantity_in_stock > 0) {
      await StockMovement.create({
        product_id: newProduct.id,
        user_id: req.user.id,
        movement_type: 'IN',
        quantity: newProduct.quantity_in_stock,
        unit_price: newProduct.cost_price,
        notes: 'Initial part inventory setup'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Automobile part added successfully.',
      data: newProduct
    });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const existing = await Product.findById(productId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Automobile part product not found.' });
    }

    // Check if OEM part number conflicts with another item
    if (req.body.part_number && req.body.part_number !== existing.part_number) {
      const partCheck = await Product.findByPartNumber(req.body.part_number);
      if (partCheck) {
        return res.status(400).json({ success: false, message: `OEM Part Number '${req.body.part_number}' is already assigned to another item.` });
      }
    }

    const updatedProduct = await Product.update(productId, req.body);

    res.json({
      success: true,
      message: 'Automobile part updated successfully.',
      data: updatedProduct
    });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Automobile part product not found.' });
    }

    await Product.delete(req.params.id);
    res.json({ success: true, message: 'Automobile part deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

const getLowStockProducts = async (req, res, next) => {
  try {
    const lowStock = await Product.getLowStock();
    res.json({ success: true, count: lowStock.length, data: lowStock });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};
