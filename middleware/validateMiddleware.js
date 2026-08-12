/**
 * Validation rules for incoming REST requests
 */

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long.');
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  if (!username) errors.push('Username or email is required.');
  if (!password) errors.push('Password is required.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  next();
};

const validateProduct = (req, res, next) => {
  const { part_number, name, category_id, supplier_id, unit_price } = req.body;
  const errors = [];

  if (!part_number || part_number.trim() === '') errors.push('OEM Part Number is required.');
  if (!name || name.trim() === '') errors.push('Product / Part Name is required.');
  if (!category_id) errors.push('Category is required.');
  if (!supplier_id) errors.push('Supplier is required.');
  if (unit_price === undefined || isNaN(unit_price) || Number(unit_price) < 0) {
    errors.push('Valid non-negative Unit Price is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  next();
};

const validateCategory = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Category Name is required.' });
  }
  next();
};

const validateSupplier = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Supplier Name is required.' });
  }
  next();
};

const validateStockMovement = (req, res, next) => {
  const { product_id, movement_type, quantity } = req.body;
  const errors = [];

  if (!product_id) errors.push('Product ID is required.');
  if (!['IN', 'OUT', 'ADJUSTMENT'].includes(movement_type)) {
    errors.push('Movement Type must be IN, OUT, or ADJUSTMENT.');
  }
  if (!quantity || isNaN(quantity) || Number(quantity) === 0) {
    errors.push('Quantity must be a non-zero integer.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(' ') });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCategory,
  validateSupplier,
  validateStockMovement
};
