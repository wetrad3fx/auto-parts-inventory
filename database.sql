-- ============================================================
-- AUTOMOBILE PARTS INVENTORY MANAGEMENT SYSTEM
-- SQL Database Export / Schema & Initial Seed Data
-- Database Engine: MySQL / Compatible with SQLite DDL
-- ============================================================

CREATE DATABASE IF NOT EXISTS auto_parts_inventory;
USE auto_parts_inventory;

-- ------------------------------------------------------------
-- Table 1: Users (Authentication & Roles)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table 2: Categories (Auto Parts System Categories)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table 3: Suppliers (Auto Parts Manufacturers / Distributors)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table 4: Products (Auto Spare Parts)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(100) NOT NULL UNIQUE, -- OEM / SKU Code
    name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    compatible_vehicles TEXT, -- Models & Year ranges (e.g. Toyota Corolla 2018-2023)
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 5, -- Low stock trigger
    location_shelf VARCHAR(50) DEFAULT 'Aisle A - Rack 1',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Table 5: Inventory Logs / Stock Movements
-- ------------------------------------------------------------
DROP TABLE IF EXISTS inventory_logs;
CREATE TABLE inventory_logs (
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

-- ============================================================
-- SEED DATA INSERTIONS
-- Default Password for all seed users: "password123"
-- (Hashed with bcrypt: $2a$10$wTzS7G3vJdYV6hN.KzQO0.mQ6sN0i8/1.w/9M9e/rW1Wk.K4y.c.C)
-- ============================================================

INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@autoparts.com', '$2a$10$wTzS7G3vJdYV6hN.KzQO0.mQ6sN0i8/1.w/9M9e/rW1Wk.K4y.c.C', 'admin'),
('manager', 'manager@autoparts.com', '$2a$10$wTzS7G3vJdYV6hN.KzQO0.mQ6sN0i8/1.w/9M9e/rW1Wk.K4y.c.C', 'manager'),
('staff', 'staff@autoparts.com', '$2a$10$wTzS7G3vJdYV6hN.KzQO0.mQ6sN0i8/1.w/9M9e/rW1Wk.K4y.c.C', 'staff');

INSERT INTO categories (name, description) VALUES
('Brake System', 'Brake pads, rotors, calipers, master cylinders, and brake fluids'),
('Engine & Components', 'Oil filters, spark plugs, timing belts, pistons, and gaskets'),
('Electrical & Ignition', 'Batteries, alternators, starter motors, ignition coils, and sensors'),
('Suspension & Steering', 'Shock absorbers, struts, control arms, ball joints, and tie rods'),
('Transmission & Drivetrain', 'Clutch kits, transmission filters, drive shafts, and CV joints'),
('Fluids & Chemical Maintenance', 'Engine oils, coolants, transmission fluid, and additives');

INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('Brembo Global Dynamics', 'Marco Rossi', 'sales@bremboparts.com', '+1-800-555-0199', '100 Braking Way, Detroit, MI'),
('Bosch Automotive Supply', 'Sarah Jenkins', 'contact@bosch-auto.com', '+1-800-555-0144', '500 Tech Blvd, Chicago, IL'),
('Denso Auto Technologies', 'Kenji Sato', 'orders@denso-parts.com', '+1-800-555-0188', '77 Electronics Way, San Jose, CA'),
('Monroe Suspension Parts', 'David Miller', 'info@monroe-auto.com', '+1-800-555-0122', '320 Strut Rd, Akron, OH');

INSERT INTO products (part_number, name, category_id, supplier_id, compatible_vehicles, unit_price, cost_price, quantity_in_stock, reorder_level, location_shelf, description) VALUES
('BP-7742-FR', 'Ceramic Front Brake Pad Set', 1, 1, 'Toyota Corolla 2018-2023, Honda Civic 2019-2022', 49.99, 25.00, 35, 10, 'Aisle A - Rack 2', 'High performance dustless ceramic front brake pads.'),
('OF-8921-ENG', 'Heavy Duty Spin-On Oil Filter', 2, 2, 'Ford F-150 2015-2023, Chevrolet Silverado 2016-2022', 12.50, 5.00, 120, 25, 'Aisle B - Rack 1', 'Synthetic blend media oil filter for heavy engine protection.'),
('ALT-9904-12V', 'High-Output 140A Alternator', 3, 3, 'Nissan Altima 2016-2021, Maxima 2017-2022', 189.99, 110.00, 4, 5, 'Aisle C - Rack 4', 'Remanufactured 12V 140-amp alternator assembly.'),
('SHK-4401-RR', 'Rear Gas-Charged Shock Absorber', 4, 4, 'Hyundai Elantra 2017-2022, Kia Forte 2018-2023', 64.99, 35.00, 8, 10, 'Aisle D - Rack 3', 'Twin-tube nitrogen gas charged rear shock absorber.'),
('SP-1002-IR', 'Iridium IX Spark Plug (Pack of 4)', 2, 3, 'Toyota Camry 2018-2024, RAV4 2019-2024', 38.00, 18.00, 50, 15, 'Aisle B - Rack 3', 'Fine wire iridium center electrode spark plugs for optimized ignition.');

INSERT INTO inventory_logs (product_id, user_id, movement_type, quantity, unit_price, notes) VALUES
(1, 1, 'IN', 50, 25.00, 'Initial supplier bulk order delivery'),
(1, 2, 'OUT', 15, 49.99, 'Over-the-counter sale for Toyota Corolla'),
(2, 1, 'IN', 120, 5.00, 'Restocked oil filters from Bosch'),
(3, 3, 'OUT', 2, 189.99, 'Installed for Nissan Altima repair service'),
(4, 2, 'ADJUSTMENT', -2, 35.00, 'Damaged box packaging - written off');
