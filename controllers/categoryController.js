const Category = require('../models/Category');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.getAll();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const existing = await Category.findByName(req.body.name);
    if (existing) {
      return res.status(400).json({ success: false, message: `Category '${req.body.name}' already exists.` });
    }

    const newCategory = await Category.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: newCategory
    });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const existing = await Category.findById(categoryId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (req.body.name && req.body.name !== existing.name) {
      const nameCheck = await Category.findByName(req.body.name);
      if (nameCheck) {
        return res.status(400).json({ success: false, message: `Category '${req.body.name}' already exists.` });
      }
    }

    const updated = await Category.update(categoryId, req.body);
    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await Category.delete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
