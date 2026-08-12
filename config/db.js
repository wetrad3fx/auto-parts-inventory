const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

let dbType = 'sqlite'; // Default fallback
let mysqlPool = null;
let sqliteDb = null;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'auto_parts_inventory';
const DB_PORT = process.env.DB_PORT || 3306;

/**
 * Initializes Database Connection (MySQL primary, SQLite fallback)
 */
async function initDb() {
  // Try MySQL connection first if configured
  if (process.env.USE_MYSQL === 'true' || (!process.env.USE_SQLITE_FALLBACK || process.env.USE_SQLITE_FALLBACK === 'false')) {
    try {
      const mysql = require('mysql2/promise');
      // Create pool without database to create DB if needed
      const rootConn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        port: DB_PORT
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await rootConn.end();

      mysqlPool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test pool connection
      const connection = await mysqlPool.getConnection();
      console.log(`[DB] Successfully connected to MySQL database: ${DB_NAME}`);
      connection.release();
      dbType = 'mysql';
      await setupTables();
      return;
    } catch (err) {
      console.warn(`[DB Warning] Could not connect to MySQL (${err.message}). Falling back to SQLite local database.`);
    }
  }

  // SQLite Fallback setup
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(process.env.SQLITE_DB_PATH || './inventory.db');
  console.log(`[DB] Initializing SQLite database at: ${dbPath}`);

  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('[DB Error] Failed to open SQLite database:', err);
        return reject(err);
      }
      dbType = 'sqlite';
      // Enable Foreign Keys for SQLite
      sqliteDb.run('PRAGMA foreign_keys = ON;');
      await setupTables();
      resolve();
    });
  });
}

/**
 * Executes schema creation and seeds default data if empty
 */
async function setupTables() {
  if (dbType === 'mysql') {
    // MySQL table initialization handled via database.sql script or auto queries
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        part_number VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category_id INT NOT NULL,
        supplier_id INT NOT NULL,
        compatible_vehicles TEXT,
        unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        quantity_in_stock INT NOT NULL DEFAULT 0,
        reorder_level INT NOT NULL DEFAULT 5,
        location_shelf VARCHAR(50) DEFAULT 'Aisle A - Rack 1',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
      );
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        movement_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) DEFAULT 0.00,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await seedDefaultData();
  } else {
    // SQLite Tables
    await runSqlite(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'manager', 'staff')) DEFAULT 'staff',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await runSqlite(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await runSqlite(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await runSqlite(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        part_number TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        supplier_id INTEGER NOT NULL,
        compatible_vehicles TEXT,
        unit_price REAL NOT NULL DEFAULT 0.00,
        cost_price REAL NOT NULL DEFAULT 0.00,
        quantity_in_stock INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 5,
        location_shelf TEXT DEFAULT 'Aisle A - Rack 1',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
      );
    `);
    await runSqlite(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        movement_type TEXT CHECK(movement_type IN ('IN', 'OUT', 'ADJUSTMENT')) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL DEFAULT 0.00,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await seedDefaultData();
  }
}

/**
 * Seeds initial demo data if tables are empty
 */
async function seedDefaultData() {
  const usersCountArr = await query('SELECT COUNT(*) as count FROM users');
  const count = usersCountArr[0]?.count || usersCountArr[0]?.['COUNT(*)'] || 0;
  
  if (count === 0) {
    console.log('[DB Seed] Seeding default admin, manager, staff users and sample automobile parts...');
    const hashedPass = await bcrypt.hash('password123', 10);

    await query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', ['admin', 'admin@autoparts.com', hashedPass, 'admin']);
    await query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', ['manager', 'manager@autoparts.com', hashedPass, 'manager']);
    await query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', ['staff', 'staff@autoparts.com', hashedPass, 'staff']);

    // Categories
    await query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Brake System', 'Brake pads, rotors, calipers, master cylinders, and brake fluids']);
    await query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Engine & Components', 'Oil filters, spark plugs, timing belts, pistons, and gaskets']);
    await query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Electrical & Ignition', 'Batteries, alternators, starter motors, ignition coils, and sensors']);
    await query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Suspension & Steering', 'Shock absorbers, struts, control arms, ball joints, and tie rods']);
    await query('INSERT INTO categories (name, description) VALUES (?, ?)', ['Transmission & Drivetrain', 'Clutch kits, transmission filters, drive shafts, and CV joints']);

    // Suppliers
    await query('INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)', ['Brembo Global Dynamics', 'Marco Rossi', 'sales@bremboparts.com', '+1-800-555-0199', '100 Braking Way, Detroit, MI']);
    await query('INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)', ['Bosch Automotive Supply', 'Sarah Jenkins', 'contact@bosch-auto.com', '+1-800-555-0144', '500 Tech Blvd, Chicago, IL']);
    await query('INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)', ['Denso Auto Technologies', 'Kenji Sato', 'orders@denso-parts.com', '+1-800-555-0188', '77 Electronics Way, San Jose, CA']);
    await query('INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)', ['Monroe Suspension Parts', 'David Miller', 'info@monroe-auto.com', '+1-800-555-0122', '320 Strut Rd, Akron, OH']);

    // Products
    await query(
      `INSERT INTO products (part_number, name, category_id, supplier_id, compatible_vehicles, unit_price, cost_price, quantity_in_stock, reorder_level, location_shelf, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['BP-7742-FR', 'Ceramic Front Brake Pad Set', 1, 1, 'Toyota Corolla 2018-2023, Honda Civic 2019-2022', 49.99, 25.00, 35, 10, 'Aisle A - Rack 2', 'High performance dustless ceramic front brake pads.']
    );
    await query(
      `INSERT INTO products (part_number, name, category_id, supplier_id, compatible_vehicles, unit_price, cost_price, quantity_in_stock, reorder_level, location_shelf, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['OF-8921-ENG', 'Heavy Duty Spin-On Oil Filter', 2, 2, 'Ford F-150 2015-2023, Chevrolet Silverado 2016-2022', 12.50, 5.00, 120, 25, 'Aisle B - Rack 1', 'Synthetic blend media oil filter for heavy engine protection.']
    );
    await query(
      `INSERT INTO products (part_number, name, category_id, supplier_id, compatible_vehicles, unit_price, cost_price, quantity_in_stock, reorder_level, location_shelf, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['ALT-9904-12V', 'High-Output 140A Alternator', 3, 3, 'Nissan Altima 2016-2021, Maxima 2017-2022', 189.99, 110.00, 4, 5, 'Aisle C - Rack 4', 'Remanufactured 12V 140-amp alternator assembly.']
    );
    await query(
      `INSERT INTO products (part_number, name, category_id, supplier_id, compatible_vehicles, unit_price, cost_price, quantity_in_stock, reorder_level, location_shelf, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['SHK-4401-RR', 'Rear Gas-Charged Shock Absorber', 4, 4, 'Hyundai Elantra 2017-2022, Kia Forte 2018-2023', 64.99, 35.00, 8, 10, 'Aisle D - Rack 3', 'Twin-tube nitrogen gas charged rear shock absorber.']
    );
    await query(
      `INSERT INTO products (part_number, name, category_id, supplier_id, compatible_vehicles, unit_price, cost_price, quantity_in_stock, reorder_level, location_shelf, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['SP-1002-IR', 'Iridium IX Spark Plug (Pack of 4)', 2, 3, 'Toyota Camry 2018-2024, RAV4 2019-2024', 38.00, 18.00, 50, 15, 'Aisle B - Rack 3', 'Fine wire iridium center electrode spark plugs for optimized ignition.']
    );

    // Stock Movement Logs
    await query(
      `INSERT INTO inventory_logs (product_id, user_id, movement_type, quantity, unit_price, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 1, 'IN', 50, 25.00, 'Initial supplier bulk order delivery']
    );
    await query(
      `INSERT INTO inventory_logs (product_id, user_id, movement_type, quantity, unit_price, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 2, 'OUT', 15, 49.99, 'Over-the-counter sale for Toyota Corolla']
    );
    await query(
      `INSERT INTO inventory_logs (product_id, user_id, movement_type, quantity, unit_price, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [3, 3, 'OUT', 2, 189.99, 'Installed for Nissan Altima repair service']
    );

    console.log('[DB Seed] Seed completed successfully!');
  }
}

/**
 * Universal Unified Query Runner
 */
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  } else {
    // SQLite
    const trimmedSql = sql.trim().toUpperCase();
    if (trimmedSql.startsWith('SELECT')) {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      });
    }
  }
}

function runSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ insertId: this.lastID, affectedRows: this.changes });
    });
  });
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDb,
  query,
  getDbType
};
