const Supplier = require('../models/Supplier');

const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    next(err);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }
    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const newSupplier = await Supplier.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Supplier added successfully.',
      data: newSupplier
    });
  } catch (err) {
    next(err);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const existing = await Supplier.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    const updated = await Supplier.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Supplier updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const existing = await Supplier.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    await Supplier.delete(req.params.id);
    res.json({ success: true, message: 'Supplier deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
