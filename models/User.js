const { query } = require('../config/db');

class User {
  static async findByUsername(username) {
    const rows = await query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const rows = await query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ username, email, password, role = 'staff' }) {
    const result = await query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    const userId = result.insertId;
    return this.findById(userId);
  }

  static async getAll() {
    return await query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
  }
}

module.exports = User;
