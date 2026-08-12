const { query } = require('../config/db');

class Product {
  static async getAll({ search = '', category_id = '', supplier_id = '', stock_status = '' } = {}) {
    let sql = `
      SELECT p.*, 
             c.name as category_name, 
             s.name as supplier_name,
             (p.quantity_in_stock * p.unit_price) as total_value,
             CASE 
               WHEN p.quantity_in_stock = 0 THEN 'OUT_OF_STOCK'
               WHEN p.quantity_in_stock <= p.reorder_level THEN 'LOW_STOCK'
               ELSE 'IN_STOCK'
             END as stock_status
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (p.name LIKE ? OR p.part_number LIKE ? OR p.compatible_vehicles LIKE ? OR p.location_shelf LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (category_id) {
      sql += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    if (supplier_id) {
      sql += ` AND p.supplier_id = ?`;
      params.push(supplier_id);
    }

    if (stock_status === 'LOW_STOCK') {
      sql += ` AND (p.quantity_in_stock <= p.reorder_level AND p.quantity_in_stock > 0)`;
    } else if (stock_status === 'OUT_OF_STOCK') {
      sql += ` AND p.quantity_in_stock = 0`;
    } else if (stock_status === 'IN_STOCK') {
      sql += ` AND p.quantity_in_stock > p.reorder_level`;
    }

    sql += ` ORDER BY p.id DESC`;
    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT p.*, 
             c.name as category_name, 
             s.name as supplier_name,
             (p.quantity_in_stock * p.unit_price) as total_value
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async findByPartNumber(part_number) {
    const rows = await query('SELECT * FROM products WHERE part_number = ?', [part_number]);
    return rows[0] || null;
  }

  static async create(data) {
    const {
      part_number,
      name,
      category_id,
      supplier_id,
      compatible_vehicles,
      unit_price,
      cost_price,
      quantity_in_stock,
      reorder_level,
      location_shelf,
      description
    } = data;

    const result = await query(
      `INSERT INTO products (
        part_number, name, category_id, supplier_id, compatible_vehicles,
        unit_price, cost_price, quantity_in_stock, reorder_level, location_shelf, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        part_number,
        name,
        category_id,
        supplier_id,
        compatible_vehicles || '',
        unit_price || 0,
        cost_price || 0,
        quantity_in_stock || 0,
        reorder_level || 5,
        location_shelf || 'Aisle A - Rack 1',
        description || ''
      ]
    );

    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const {
      part_number,
      name,
      category_id,
      supplier_id,
      compatible_vehicles,
      unit_price,
      cost_price,
      quantity_in_stock,
      reorder_level,
      location_shelf,
      description
    } = data;

    await query(
      `UPDATE products SET
        part_number = ?,
        name = ?,
        category_id = ?,
        supplier_id = ?,
        compatible_vehicles = ?,
        unit_price = ?,
        cost_price = ?,
        quantity_in_stock = ?,
        reorder_level = ?,
        location_shelf = ?,
        description = ?
       WHERE id = ?`,
      [
        part_number,
        name,
        category_id,
        supplier_id,
        compatible_vehicles || '',
        unit_price || 0,
        cost_price || 0,
        quantity_in_stock || 0,
        reorder_level || 5,
        location_shelf || 'Aisle A - Rack 1',
        description || '',
        id
      ]
    );

    return this.findById(id);
  }

  static async delete(id) {
    return await query('DELETE FROM products WHERE id = ?', [id]);
  }

  static async updateQuantity(id, changeQty) {
    await query(
      'UPDATE products SET quantity_in_stock = quantity_in_stock + ? WHERE id = ?',
      [changeQty, id]
    );
    return this.findById(id);
  }

  static async getLowStock() {
    const sql = `
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.quantity_in_stock <= p.reorder_level
      ORDER BY p.quantity_in_stock ASC
    `;
    return await query(sql);
  }
}

module.exports = Product;
