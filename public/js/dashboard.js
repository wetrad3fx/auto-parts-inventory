/**
 * GEARSHIFT - Dashboard Analytics Client Module
 */

const DashboardUI = {
  chartInstance: null,

  async loadStats() {
    try {
      const res = await App.request('/dashboard/stats');
      const stats = res.data.summary;

      // Update stat cards
      document.getElementById('statTotalParts').textContent = stats.total_parts || 0;
      document.getElementById('statTotalUnits').textContent = `${stats.total_units || 0} total units in stock`;
      document.getElementById('statInventoryValue').textContent = App.formatCurrency(stats.total_inventory_value);
      document.getElementById('statLowStock').textContent = stats.low_stock_count || 0;
      document.getElementById('statCategories').textContent = stats.total_categories || 0;
      document.getElementById('statSuppliers').textContent = stats.total_suppliers || 0;

      // Render Category Chart
      this.renderCategoryChart(res.data.category_breakdown || []);

      // Render Low Stock Table
      this.renderLowStockTable(res.data.low_stock_items || []);

      // Render Recent Transactions
      this.renderRecentTransactions(res.data.recent_movements || []);
    } catch (err) {
      console.error('[Dashboard Stats Load Failed]:', err);
    }
  },

  renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const labels = data.map(item => item.category_name);
    const counts = data.map(item => item.part_count);

    const colors = [
      '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', 
      '#ef4444', '#3b82f6', '#ec4899', '#64748b'
    ];

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#151c2c',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    });
  },

  renderLowStockTable(items) {
    const tbody = document.getElementById('dashLowStockBody');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-emerald py-3"><i class="fa-solid fa-circle-check me-1"></i> All stock levels optimal. No urgent restocks required.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td><code class="text-cyan fw-bold">${item.part_number}</code></td>
        <td class="fw-semibold text-light">${item.name}</td>
        <td>
          <span class="badge ${item.quantity_in_stock === 0 ? 'badge-out-stock' : 'badge-low-stock'}">
            ${item.quantity_in_stock} units
          </span>
        </td>
        <td class="text-secondary">${item.reorder_level}</td>
        <td class="text-end">
          <button class="btn btn-warning btn-sm px-2 py-1 fs-8" onclick="StockUI.quickRestock(${item.id}, '${item.name.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-boxes-packing me-1"></i> Restock
          </button>
        </td>
      </tr>
    `).join('');
  },

  renderRecentTransactions(logs) {
    const tbody = document.getElementById('dashRecentLogsBody');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary py-3">No inventory transactions logged yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(log => {
      let badgeClass = 'bg-info text-dark';
      if (log.movement_type === 'IN') badgeClass = 'bg-success text-white';
      if (log.movement_type === 'OUT') badgeClass = 'bg-primary text-white';
      if (log.movement_type === 'ADJUSTMENT') badgeClass = 'bg-warning text-dark';

      return `
        <tr>
          <td class="text-secondary fs-8">${App.formatDate(log.created_at)}</td>
          <td><code class="text-cyan">${log.part_number}</code></td>
          <td class="fw-semibold text-light">${log.product_name}</td>
          <td><span class="badge ${badgeClass}">${log.movement_type}</span></td>
          <td class="fw-bold">${log.movement_type === 'OUT' ? '-' : '+'}${log.quantity}</td>
          <td><small class="text-secondary">${log.user_name}</small></td>
          <td class="text-secondary fs-8">${log.notes || '-'}</td>
        </tr>
      `;
    }).join('');
  }
};
