/**
 * GEARSHIFT - Suppliers Client Module
 */

const SuppliersUI = {
  init() {
    const form = document.getElementById('supplierForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveSupplier(e));
    }
  },

  async loadSuppliers() {
    try {
      const res = await App.request('/suppliers');
      this.renderSuppliersGrid(res.data || []);
    } catch (err) {
      console.error('[Load Suppliers Failed]:', err);
    }
  },

  renderSuppliersGrid(suppliers) {
    const grid = document.getElementById('suppliersGrid');
    if (!grid) return;

    if (!suppliers || suppliers.length === 0) {
      grid.innerHTML = `<div class="col-12 text-center text-secondary py-4">No suppliers created yet.</div>`;
      return;
    }

    const isAdmin = App.user && App.user.role === 'admin';
    const isManager = App.user && ['admin', 'manager'].includes(App.user.role);

    grid.innerHTML = suppliers.map(s => `
      <div class="col-md-6 col-lg-4">
        <div class="card card-dark border-0 shadow-sm h-100 gradient-border-emerald">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold text-light mb-0"><i class="fa-solid fa-truck-field text-emerald me-2"></i> ${s.name}</h5>
              <span class="badge bg-success bg-opacity-20 text-emerald border border-success border-opacity-25">${s.product_count || 0} Supplied</span>
            </div>
            
            <div class="fs-8 text-secondary mb-2">
              <div><i class="fa-solid fa-user me-1 text-light"></i> Contact: <span class="text-light">${s.contact_person || 'N/A'}</span></div>
              <div><i class="fa-solid fa-envelope me-1 text-info"></i> ${s.email || 'N/A'}</div>
              <div><i class="fa-solid fa-phone me-1 text-warning"></i> ${s.phone || 'N/A'}</div>
              <div><i class="fa-solid fa-location-dot me-1 text-danger"></i> ${s.address || 'N/A'}</div>
            </div>

            <div class="d-flex justify-content-end gap-2 border-top border-secondary border-opacity-25 pt-2 mt-3">
              ${isManager ? `
                <button class="btn btn-outline-info btn-sm px-2 fs-8" onclick="SuppliersUI.openEditModal(${s.id})">
                  <i class="fa-solid fa-pen me-1"></i> Edit
                </button>
              ` : ''}
              ${isAdmin ? `
                <button class="btn btn-outline-danger btn-sm px-2 fs-8" onclick="SuppliersUI.deleteSupplier(${s.id}, '${s.name.replace(/'/g, "\\'")}')">
                  <i class="fa-solid fa-trash me-1"></i> Delete
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  openAddModal() {
    if (!App.token) {
      App.showToast('Please login to add suppliers.', 'warning');
      const modal = new bootstrap.Modal(document.getElementById('loginModal'));
      modal.show();
      return;
    }

    document.getElementById('supplierForm').reset();
    document.getElementById('suppId').value = '';
    document.getElementById('supplierModalTitle').innerHTML = `<i class="fa-solid fa-truck-field text-emerald me-2"></i> Add Parts Supplier`;
    document.getElementById('supplierAlert').classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
    modal.show();
  },

  async openEditModal(id) {
    try {
      const res = await App.request(`/suppliers/${id}`);
      const s = res.data;

      document.getElementById('suppId').value = s.id;
      document.getElementById('suppName').value = s.name;
      document.getElementById('suppContact').value = s.contact_person || '';
      document.getElementById('suppEmail').value = s.email || '';
      document.getElementById('suppPhone').value = s.phone || '';
      document.getElementById('suppAddress').value = s.address || '';

      document.getElementById('supplierModalTitle').innerHTML = `<i class="fa-solid fa-pen text-emerald me-2"></i> Edit Supplier`;
      document.getElementById('supplierAlert').classList.add('d-none');

      const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
      modal.show();
    } catch (err) {
      App.showToast(err.message, 'danger');
    }
  },

  async handleSaveSupplier(e) {
    e.preventDefault();
    const alertEl = document.getElementById('supplierAlert');
    alertEl.classList.add('d-none');

    const id = document.getElementById('suppId').value;
    const body = {
      name: document.getElementById('suppName').value,
      contact_person: document.getElementById('suppContact').value,
      email: document.getElementById('suppEmail').value,
      phone: document.getElementById('suppPhone').value,
      address: document.getElementById('suppAddress').value
    };

    try {
      if (id) {
        await App.request(`/suppliers/${id}`, { method: 'PUT', body });
        App.showToast('Supplier details updated.', 'success');
      } else {
        await App.request('/suppliers', { method: 'POST', body });
        App.showToast('New supplier added.', 'success');
      }

      const modalEl = document.getElementById('supplierModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      this.loadSuppliers();
    } catch (err) {
      alertEl.textContent = err.message;
      alertEl.classList.remove('d-none');
    }
  },

  async deleteSupplier(id, name) {
    if (!confirm(`Are you sure you want to delete supplier '${name}'?`)) return;

    try {
      await App.request(`/suppliers/${id}`, { method: 'DELETE' });
      App.showToast(`Deleted supplier '${name}'.`, 'info');
      this.loadSuppliers();
    } catch (err) {
      App.showToast(err.message, 'danger');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SuppliersUI.init();
});
