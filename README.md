# Automobile Parts Inventory Management System (GearShift)

> **SOFTWARE ENGINEERING INDUSTRIAL TRAINING (SE-IT)**  
> **Individual Full-Stack Project Assignment**

---

## 📌 Project Identification
- **Project Title**: Automobile Parts Inventory Management System
- **Student Name**: Favour Eteng Bassey
- **Matric Number**: 24/CSC/066
- **Assigned Inventory Domain**: Automobile Parts Inventory

---

## 🚗 Project Description
**GearShift Automobile Parts Inventory Management System** is a production-grade full-stack web application designed specifically for automotive spare part stores, distributors, and repair workshops. 

The system tracks original equipment manufacturer (OEM) part numbers, compatible vehicle models/year ranges, shelf and aisle locations, category classifications, parts suppliers, unit prices, cost margins, stock movements (Stock In, Sales Out, Audit Adjustments), low-stock alert thresholds, and real-time interactive executive analytics.

---

## 🛠️ Technologies Used
- **Backend Framework**: Node.js & Express.js (MVC Architecture)
- **Database Layer**: Dual Engine Architecture (Primary: MySQL with `mysql2`; Fallback: SQLite3 for zero-config local demo)
- **Authentication & Security**: JSON Web Tokens (JWT), `bcryptjs` password hashing, Role-Based Access Control (`admin`, `manager`, `staff`)
- **Frontend User Interface**: HTML5, Vanilla JavaScript (ES6+), Bootstrap 5, Custom Automotive Design System CSS, FontAwesome 6, Chart.js
- **Version Control**: Git & GitHub

---

## 🔑 Default Login Credentials

| Role | Username | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@autoparts.com` | `password123` | Full system access (Users, CRUD, Delete, Audits) |
| **Manager** | `manager` | `manager@autoparts.com` | `password123` | Inventory CRUD, Stock In/Out, Supplier/Category edit |
| **Staff** | `staff` | `staff@autoparts.com` | `password123` | View catalog, Log sales out, View low stock warnings |

---

## ✨ Core Features
1. **User Authentication & RBAC**:
   - Register, Login, JWT verification, password encryption with `bcrypt`.
   - Role permissions for Admin, Manager, and Staff.

2. **Automobile Parts (Products) CRUD**:
   - Part tracking with OEM SKU codes, compatible vehicle model ranges, storage aisle/shelf locations, cost price, selling unit price, stock count, and reorder levels.

3. **Category Management**:
   - Organize parts into functional automotive systems (Brake System, Engine, Electrical, Suspension, Transmission, Fluids).

4. **Supplier Management**:
   - Vendor directory for OEM and aftermarket manufacturers with contact information and supply logs.

5. **Stock Movement & Audit Logging**:
   - Stock In (Purchases/Restock), Stock Out (Sales/Dispatch), and Audit Adjustments with historical timestamp log ledger.

6. **Executive Dashboard & Visual Analytics**:
   - Key performance indicators: Total SKU count, Total Stock Value ($), Low Stock warning count, Category distribution doughnut chart powered by Chart.js, and recent transaction log.

7. **Search & Filtering**:
   - Instant search by OEM code, part name, or compatible vehicle model. Filters by category, supplier, and stock status.

---

## 🗄️ Database Setup Instructions

### Option 1: Zero-Config SQLite (Default Out-of-the-Box)
The application automatically detects whether MySQL is running. If MySQL is unconfigured, it initializes an SQLite database file (`inventory.db`) and seeds all tables, demo users, categories, suppliers, and automobile parts automatically!

### Option 2: MySQL Setup (For Production / MySQL Grading)
1. Open your MySQL client (e.g. MySQL Workbench, phpMyAdmin, or MySQL CLI).
2. Execute the provided database export file:
  
   mysql -u root -p < database.sql
  . Update `.env` with your MySQL connection credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=auto_parts_inventory
   DB_PORT=3306
   USE_MYSQL=true
   

---

## 🚀 Quick Start / Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/auto-parts-inventory.git
   cd auto-parts-inventory
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Run Server**:
   ```bash
   npm start
   ```
   Or for auto-reloading development mode:
   ```bash
   npm run dev
   ```

5. **Access Application**:
   Open browser at `http://localhost:3000`

---

## 📁 Directory Structure
```text
auto-parts-inventory/
├── config/
│   └── db.js                 # Dual Database Connection (MySQL / SQLite fallback)
├── controllers/
│   ├── authController.js     # User registration, login, profile, JWT token generation
│   ├── productController.js  # CRUD for Auto Parts + SKU search & low stock alerts
│   ├── categoryController.js # CRUD for Auto Part Categories
│   ├── supplierController.js # CRUD for Auto Parts Suppliers
│   ├── stockController.js    # Stock In, Stock Out, Audit Adjustments, Movement Logs
│   └── dashboardController.js# Summary stats, stock value, category distribution metrics
├── middleware/
│   ├── authMiddleware.js     # JWT verification & role protection (Admin, Manager, Staff)
│   ├── validateMiddleware.js # Input sanitization & validation rules
│   └── errorMiddleware.js    # Centralized API error handler
├── models/                   # Modular DB query abstractions
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Supplier.js
│   └── StockMovement.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── supplierRoutes.js
│   ├── stockRoutes.js
│   └── dashboardRoutes.js
├── public/                   # Frontend SPA / Web Application
│   ├── index.html            # Main Single-Page Interface with Bootstrap 5
│   ├── css/
│   │   └── style.css         # Automotive aesthetic styling, dark theme
│   ├── js/
│   │   ├── app.js            # Core router, state manager, toast notifications
│   │   ├── auth.js           # Login/Register modals & JWT session logic
│   │   ├── dashboard.js      # Stat cards & Chart.js integration
│   │   ├── products.js       # Auto parts CRUD UI, OEM search, stock badges
│   │   ├── categories.js     # Category management UI
│   │   ├── suppliers.js      # Supplier management UI
│   │   └── stock.js          # Stock movement logs & Quick Restock modal
├── database.sql              # Official MySQL Database Export & Seed Data
├── .env.example              # Environment variables template
├── package.json              # Project dependencies & scripts
└── README.md                 # Documentation
```

---

## 📡 RESTful API Reference

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/profile` - Get logged-in user profile (Protected)

### Products (Automobile Parts)
- `GET /api/products` - List all parts (Supports `search`, `category_id`, `supplier_id`, `stock_status`)
- `GET /api/products/low-stock` - Get low stock parts below reorder level
- `GET /api/products/:id` - Get single part details
- `POST /api/products` - Add new part (Admin/Manager)
- `PUT /api/products/:id` - Update part details (Admin/Manager)
- `DELETE /api/products/:id` - Remove part (Admin)

### Categories & Suppliers
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (Admin/Manager)
- `PUT /api/categories/:id` - Update category (Admin/Manager)
- `DELETE /api/categories/:id` - Delete category (Admin)
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier (Admin/Manager)
- `PUT /api/suppliers/:id` - Update supplier (Admin/Manager)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin)

### Stock & Analytics
- `POST /api/stock/movement` - Log Stock In, Stock Out, or Adjustment
- `GET /api/stock/logs` - Retrieve audit transaction logs
- `GET /api/dashboard/stats` - Summary statistics & chart breakdown metrics

---

## 📄 License
This project is submitted as part of the Software Engineering Industrial Training (SE-IT) coursework.
