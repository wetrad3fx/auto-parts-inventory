const { query } = require('../config/db');

class StockMovement {
  static async create({ product_id, user_id, movement_type, quantity, unit_price, notes }) {
    const result = await query(
      `INSERT INTO inventory_logs (product_id, user_id, movement_type, quantity, unit_price, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product_id, user_id, movement_type, quantity, unit_price || 0, notes || '']
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const sql = `
      SELECT l.*, p.name as product_name, p.part_number, u.username as user_name
      FROM inventory_logs l
      JOIN products p ON l.product_id = p.id
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async getAll({ product_id = '', limit = 100 } = {}) {
    let sql = `
      SELECT l.*, p.name as product_name, p.part_number, u.username as user_name
      FROM inventory_logs l
      JOIN products p ON l.product_id = p.id
      JOIN users u ON l.user_id = u.id
    `;
    const params = [];

    if (product_id) {
      sql += ` WHERE l.product_id = ?`;
      params.push(product_id);
    }

    sql += ` ORDER BY l.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    return await query(sql, params);
  }
}

module.exports = StockMovement;
