/**
 * GEARSHIFT - Stock Audit & Movement Client Module
 */

const StockUI = {
  init() {
    const form = document.getElementById('stockForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveMovement(e));
    }
  },

  async loadLogs() {
    try {
      const res = await App.request('/stock/logs');
      this.renderLogsTable(res.data || []);
    } catch (err) {
      console.error('[Load Stock Logs Failed]:', err);
    }
  },

  renderLogsTable(logs) {
    const tbody = document.getElementById('stockLogsTableBody');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-secondary py-4">No stock transaction logs recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      let badgeClass = 'bg-info text-dark';
      if (l.movement_type === 'IN') badgeClass = 'bg-success text-white';
      if (l.movement_type === 'OUT') badgeClass = 'bg-primary text-white';
      if (l.movement_type === 'ADJUSTMENT') badgeClass = 'bg-warning text-dark';

      return `
        <tr>
          <td><small class="text-secondary font-monospace">#LOG-${l.id}</small></td>
          <td class="text-secondary fs-8">${App.formatDate(l.created_at)}</td>
          <td><code class="text-cyan fw-bold">${l.part_number}</code></td>
          <td class="fw-bold text-light">${l.product_name}</td>
          <td><span class="badge ${badgeClass}">${l.movement_type}</span></td>
          <td class="fw-extrabold ${l.movement_type === 'OUT' ? 'text-primary' : 'text-emerald'}">
            ${l.movement_type === 'OUT' ? '-' : '+'}${l.quantity}
          </td>
          <td><small class="text-light">${App.formatCurrency(l.unit_price)}</small></td>
          <td><small class="badge bg-secondary text-light">${l.user_name}</small></td>
          <td class="text-secondary fs-8">${l.notes || '-'}</td>
        </tr>
      `;
    }).join('');
  },

  async populateProductsDropdown(selectedId = '') {
    try {
      const res = await App.request('/products');
      const select = document.getElementById('stockProdSelect');
      if (select) {
        select.innerHTML = `<option value="">Select Part...</option>` +
          (res.data || []).map(p => `
            <option value="${p.id}" ${p.id == selectedId ? 'selected' : ''}>
              [${p.part_number}] ${p.name} (Stock: ${p.quantity_in_stock})
            </option>
          `).join('');
      }
    } catch (err) {
      console.error('[Populate Parts Dropdown Failed]:', err);
    }
  },

  async openMovementModal() {
    if (!App.token) {
      App.showToast('Please login to log stock movements.', 'warning');
      const modal = new bootstrap.Modal(document.getElementById('loginModal'));
      modal.show();
      return;
    }

    document.getElementById('stockForm').reset();
    document.getElementById('stockAlert').classList.add('d-none');
    await this.populateProductsDropdown();

    const modal = new bootstrap.Modal(document.getElementById('stockModal'));
    modal.show();
  },

  async quickRestock(productId, productName) {
    if (!App.token) {
      App.showToast('Please login to log stock movements.', 'warning');
      const modal = new bootstrap.Modal(document.getElementById('loginModal'));
      modal.show();
      return;
    }

    document.getElementById('stockForm').reset();
    document.getElementById('stockAlert').classList.add('d-none');
    await this.populateProductsDropdown(productId);

    document.getElementById('stockMovementType').value = 'IN';

    const modal = new bootstrap.Modal(document.getElementById('stockModal'));
    modal.show();
  },

  async handleSaveMovement(e) {
    e.preventDefault();
    const alertEl = document.getElementById('stockAlert');
    alertEl.classList.add('d-none');

    const body = {
      product_id: document.getElementById('stockProdSelect').value,
      movement_type: document.getElementById('stockMovementType').value,
      quantity: document.getElementById('stockQty').value,
      unit_price: document.getElementById('stockUnitPrice').value || 0,
      notes: document.getElementById('stockNotes').value
    };

    try {
      const res = await App.request('/stock/movement', { method: 'POST', body });
      App.showToast(res.message, 'success');

      const modalEl = document.getElementById('stockModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      // Refresh current views
      this.loadLogs();
      if (typeof ProductsUI !== 'undefined') ProductsUI.loadProducts();
      if (typeof DashboardUI !== 'undefined') DashboardUI.loadStats();
    } catch (err) {
      alertEl.textContent = err.message;
      alertEl.classList.remove('d-none');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  StockUI.init();
});
