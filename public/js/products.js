/**
 * GEARSHIFT - Auto Parts (Products) Client Module
 */

const ProductsUI = {
  categoriesCache: [],
  suppliersCache: [],

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Live Search & Filter listeners
    const searchInput = document.getElementById('productSearchInput');
    const filterCat = document.getElementById('filterCategory');
    const filterSupp = document.getElementById('filterSupplier');
    const filterStatus = document.getElementById('filterStockStatus');

    if (searchInput) searchInput.addEventListener('input', () => this.loadProducts());
    if (filterCat) filterCat.addEventListener('change', () => this.loadProducts());
    if (filterSupp) filterSupp.addEventListener('change', () => this.loadProducts());
    if (filterStatus) filterStatus.addEventListener('change', () => this.loadProducts());

    // Submit Product Form
    const prodForm = document.getElementById('productForm');
    if (prodForm) {
      prodForm.addEventListener('submit', (e) => this.handleSaveProduct(e));
    }
  },

  async loadDropdowns() {
    try {
      const [catRes, suppRes] = await Promise.all([
        App.request('/categories'),
        App.request('/suppliers')
      ]);

      this.categoriesCache = catRes.data || [];
      this.suppliersCache = suppRes.data || [];

      // Populate Filter Category
      const filterCat = document.getElementById('filterCategory');
      if (filterCat) {
        filterCat.innerHTML = `<option value="">All Categories</option>` +
          this.categoriesCache.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }

      // Populate Filter Supplier
      const filterSupp = document.getElementById('filterSupplier');
      if (filterSupp) {
        filterSupp.innerHTML = `<option value="">All Suppliers</option>` +
          this.suppliersCache.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      }

      // Populate Product Modal Dropdowns
      const prodCat = document.getElementById('prodCategory');
      const prodSupp = document.getElementById('prodSupplier');
      if (prodCat) {
        prodCat.innerHTML = `<option value="">Select Category</option>` +
          this.categoriesCache.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }
      if (prodSupp) {
        prodSupp.innerHTML = `<option value="">Select Supplier</option>` +
          this.suppliersCache.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      }
    } catch (err) {
      console.error('[Load Dropdowns Failed]:', err);
    }
  },

  async loadProducts() {
    const search = document.getElementById('productSearchInput')?.value || '';
    const category_id = document.getElementById('filterCategory')?.value || '';
    const supplier_id = document.getElementById('filterSupplier')?.value || '';
    const stock_status = document.getElementById('filterStockStatus')?.value || '';

    try {
      const queryParams = new URLSearchParams({ search, category_id, supplier_id, stock_status }).toString();
      const res = await App.request(`/products?${queryParams}`);
      this.renderProductsTable(res.data || []);
    } catch (err) {
      console.error('[Load Products Failed]:', err);
    }
  },

  renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (!products || products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-secondary py-4">No automobile parts found matching current filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => {
      let statusBadge = `<span class="badge badge-in-stock"><i class="fa-solid fa-circle-check me-1"></i> In Stock (${p.quantity_in_stock})</span>`;
      if (p.quantity_in_stock === 0) {
        statusBadge = `<span class="badge badge-out-stock"><i class="fa-solid fa-circle-xmark me-1"></i> Out of Stock</span>`;
      } else if (p.quantity_in_stock <= p.reorder_level) {
        statusBadge = `<span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation me-1"></i> Low Stock (${p.quantity_in_stock})</span>`;
      }

      const isAdmin = App.user && App.user.role === 'admin';
      const isManager = App.user && ['admin', 'manager'].includes(App.user.role);

      return `
        <tr>
          <td><code class="text-cyan fw-bold fs-7">${p.part_number}</code></td>
          <td>
            <div class="fw-bold text-light">${p.name}</div>
            <small class="text-secondary fs-8">${p.description ? p.description.substring(0, 45) + '...' : ''}</small>
          </td>
          <td><span class="badge bg-secondary bg-opacity-50 text-light">${p.category_name}</span></td>
          <td><small class="text-light">${p.supplier_name}</small></td>
          <td><small class="text-info fs-8"><i class="fa-solid fa-car me-1"></i> ${p.compatible_vehicles || 'Universal'}</small></td>
          <td><small class="text-secondary"><i class="fa-solid fa-warehouse me-1"></i> ${p.location_shelf || 'Rack A'}</small></td>
          <td>${statusBadge}</td>
          <td class="fw-bold text-emerald">${App.formatCurrency(p.unit_price)}</td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-warning btn-sm" onclick="StockUI.quickRestock(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Quick Stock Movement">
                <i class="fa-solid fa-boxes-packing"></i>
              </button>
              ${isManager ? `
                <button class="btn btn-outline-info btn-sm" onclick="ProductsUI.openEditModal(${p.id})" title="Edit Part">
                  <i class="fa-solid fa-pen"></i>
                </button>
              ` : ''}
              ${isAdmin ? `
                <button class="btn btn-outline-danger btn-sm" onclick="ProductsUI.deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Delete Part">
                  <i class="fa-solid fa-trash"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  resetFilters() {
    document.getElementById('productSearchInput').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterSupplier').value = '';
    document.getElementById('filterStockStatus').value = '';
    this.loadProducts();
  },

  openAddModal() {
    if (!App.token) {
      App.showToast('Please login to add parts.', 'warning');
      const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
      loginModal.show();
      return;
    }

    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('productModalTitle').innerHTML = `<i class="fa-solid fa-gear text-primary me-2"></i> Add Automobile Spare Part`;
    document.getElementById('productAlert').classList.add('d-none');
    
    this.loadDropdowns();
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
  },

  async openEditModal(id) {
    try {
      await this.loadDropdowns();
      const res = await App.request(`/products/${id}`);
      const p = res.data;

      document.getElementById('prodId').value = p.id;
      document.getElementById('prodPartNumber').value = p.part_number;
      document.getElementById('prodName').value = p.name;
      document.getElementById('prodCategory').value = p.category_id;
      document.getElementById('prodSupplier').value = p.supplier_id;
      document.getElementById('prodCompatible').value = p.compatible_vehicles || '';
      document.getElementById('prodUnitPrice').value = p.unit_price;
      document.getElementById('prodCostPrice').value = p.cost_price;
      document.getElementById('prodQty').value = p.quantity_in_stock;
      document.getElementById('prodReorder').value = p.reorder_level;
      document.getElementById('prodShelf').value = p.location_shelf || '';
      document.getElementById('prodDescription').value = p.description || '';

      document.getElementById('productModalTitle').innerHTML = `<i class="fa-solid fa-pen text-info me-2"></i> Edit Part #${p.part_number}`;
      document.getElementById('productAlert').classList.add('d-none');

      const modal = new bootstrap.Modal(document.getElementById('productModal'));
      modal.show();
    } catch (err) {
      App.showToast(err.message, 'danger');
    }
  },

  async handleSaveProduct(e) {
    e.preventDefault();
    const alertEl = document.getElementById('productAlert');
    alertEl.classList.add('d-none');

    const id = document.getElementById('prodId').value;
    const body = {
      part_number: document.getElementById('prodPartNumber').value,
      name: document.getElementById('prodName').value,
      category_id: document.getElementById('prodCategory').value,
      supplier_id: document.getElementById('prodSupplier').value,
      compatible_vehicles: document.getElementById('prodCompatible').value,
      unit_price: document.getElementById('prodUnitPrice').value,
      cost_price: document.getElementById('prodCostPrice').value,
      quantity_in_stock: document.getElementById('prodQty').value,
      reorder_level: document.getElementById('prodReorder').value,
      location_shelf: document.getElementById('prodShelf').value,
      description: document.getElementById('prodDescription').value
    };

    try {
      let res;
      if (id) {
        res = await App.request(`/products/${id}`, { method: 'PUT', body });
        App.showToast('Part updated successfully.', 'success');
      } else {
        res = await App.request('/products', { method: 'POST', body });
        App.showToast('New automobile part added successfully.', 'success');
      }

      const modalEl = document.getElementById('productModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      this.loadProducts();
    } catch (err) {
      alertEl.textContent = err.message;
      alertEl.classList.remove('d-none');
    }
  },

  async deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete '${name}'? This action cannot be undone.`)) return;

    try {
      await App.request(`/products/${id}`, { method: 'DELETE' });
      App.showToast(`Deleted '${name}'.`, 'info');
      this.loadProducts();
    } catch (err) {
      App.showToast(err.message, 'danger');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ProductsUI.init();
});
