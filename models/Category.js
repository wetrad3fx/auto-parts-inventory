const { query } = require('../config/db');

class Category {
  static async getAll() {
    return await query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByName(name) {
    const rows = await query('SELECT * FROM categories WHERE name = ?', [name]);
    return rows[0] || null;
  }

  static async create({ name, description }) {
    const result = await query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    return this.findById(result.insertId);
  }

  static async update(id, { name, description }) {
    await query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description || '', id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    return await query('DELETE FROM categories WHERE id = ?', [id]);
  }
}

module.exports = Category;
