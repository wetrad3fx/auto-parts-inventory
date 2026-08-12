const { query } = require('../config/db');

class Supplier {
  static async getAll() {
    return await query(`
      SELECT s.*, COUNT(p.id) as product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM suppliers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ name, contact_person, email, phone, address }) {
    const result = await query(
      'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_person || '', email || '', phone || '', address || '']
    );
    return this.findById(result.insertId);
  }

  static async update(id, { name, contact_person, email, phone, address }) {
    await query(
      'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, contact_person || '', email || '', phone || '', address || '', id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    return await query('DELETE FROM suppliers WHERE id = ?', [id]);
  }
}

module.exports = Supplier;
