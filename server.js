const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initDb, getDbType } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing and CORS middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// System Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Automobile Parts Inventory Management System',
    db_engine: getDbType(),
    timestamp: new Date().toISOString()
  });
});

// Fallback to SPA index.html for non-API GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize DB and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` AUTO PARTS INVENTORY SYSTEM RUNNING AT:`);
      console.log(` http://localhost:${PORT}`);
      console.log(` Database Engine Active: ${getDbType().toUpperCase()}`);
      console.log(`=======================================================`);
    });
  })
  .catch((err) => {
    console.error('Fatal Database Initialization Failure:', err);
    process.exit(1);
  });

module.exports = app;
