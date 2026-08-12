const { query } = require('../config/db');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total products count and total value
    const totalProdRows = await query(`
      SELECT 
        COUNT(*) as total_parts,
        COALESCE(SUM(quantity_in_stock), 0) as total_units,
        COALESCE(SUM(quantity_in_stock * unit_price), 0) as total_inventory_value,
        COALESCE(SUM(quantity_in_stock * cost_price), 0) as total_cost_value
      FROM products
    `);
    const stats = totalProdRows[0] || {};

    // 2. Low stock count
    const lowStockRows = await query(`
      SELECT COUNT(*) as low_stock_count
      FROM products
      WHERE quantity_in_stock <= reorder_level
    `);
    stats.low_stock_count = lowStockRows[0]?.low_stock_count || 0;

    // 3. Category count
    const catRows = await query(`SELECT COUNT(*) as total_categories FROM categories`);
    stats.total_categories = catRows[0]?.total_categories || 0;

    // 4. Supplier count
    const suppRows = await query(`SELECT COUNT(*) as total_suppliers FROM suppliers`);
    stats.total_suppliers = suppRows[0]?.total_suppliers || 0;

    // 5. Breakdown by category (for visual charts)
    const categoryBreakdown = await query(`
      SELECT c.name as category_name, COUNT(p.id) as part_count, COALESCE(SUM(p.quantity_in_stock), 0) as unit_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY part_count DESC
    `);

    // 6. Recent stock movements
    const recentMovements = await StockMovement.getAll({ limit: 5 });

    // 7. Low stock items list (up to 5)
    const lowStockItems = await Product.getLowStock();

    res.json({
      success: true,
      data: {
        summary: stats,
        category_breakdown: categoryBreakdown,
        recent_movements: recentMovements,
        low_stock_items: lowStockItems.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};
