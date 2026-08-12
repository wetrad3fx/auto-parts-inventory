/**
 * GEARSHIFT - Category Client Module
 */

const CategoriesUI = {
  init() {
    const form = document.getElementById('categoryForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSaveCategory(e));
    }
  },

  async loadCategories() {
    try {
      const res = await App.request('/categories');
      this.renderCategoriesGrid(res.data || []);
    } catch (err) {
      console.error('[Load Categories Failed]:', err);
    }
  },

  renderCategoriesGrid(categories) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    if (!categories || categories.length === 0) {
      grid.innerHTML = `<div class="col-12 text-center text-secondary py-4">No categories created yet.</div>`;
      return;
    }

    const isAdmin = App.user && App.user.role === 'admin';
    const isManager = App.user && ['admin', 'manager'].includes(App.user.role);

    grid.innerHTML = categories.map(c => `
      <div class="col-md-6 col-lg-4">
        <div class="card card-dark border-0 shadow-sm h-100 gradient-border-cyan">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="fw-bold text-light mb-0"><i class="fa-solid fa-layer-group text-info me-2"></i> ${c.name}</h5>
              <span class="badge bg-info bg-opacity-20 text-info border border-info border-opacity-25">${c.product_count || 0} Parts</span>
            </div>
            <p class="text-secondary fs-8 mb-3" style="min-height: 40px;">${c.description || 'No description provided.'}</p>
            <div class="d-flex justify-content-end gap-2 border-top border-secondary border-opacity-25 pt-2">
              ${isManager ? `
                <button class="btn btn-outline-info btn-sm px-2 fs-8" onclick="CategoriesUI.openEditModal(${c.id})">
                  <i class="fa-solid fa-pen me-1"></i> Edit
                </button>
              ` : ''}
              ${isAdmin ? `
                <button class="btn btn-outline-danger btn-sm px-2 fs-8" onclick="CategoriesUI.deleteCategory(${c.id}, '${c.name.replace(/'/g, "\\'")}')">
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
      App.showToast('Please login to create categories.', 'warning');
      const modal = new bootstrap.Modal(document.getElementById('loginModal'));
      modal.show();
      return;
    }

    document.getElementById('categoryForm').reset();
    document.getElementById('catId').value = '';
    document.getElementById('categoryModalTitle').innerHTML = `<i class="fa-solid fa-layer-group text-info me-2"></i> Add Part Category`;
    document.getElementById('categoryAlert').classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
  },

  async openEditModal(id) {
    try {
      const res = await App.request(`/categories/${id}`);
      const c = res.data;

      document.getElementById('catId').value = c.id;
      document.getElementById('catName').value = c.name;
      document.getElementById('catDesc').value = c.description || '';

      document.getElementById('categoryModalTitle').innerHTML = `<i class="fa-solid fa-pen text-info me-2"></i> Edit Category`;
      document.getElementById('categoryAlert').classList.add('d-none');

      const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
      modal.show();
    } catch (err) {
      App.showToast(err.message, 'danger');
    }
  },

  async handleSaveCategory(e) {
    e.preventDefault();
    const alertEl = document.getElementById('categoryAlert');
    alertEl.classList.add('d-none');

    const id = document.getElementById('catId').value;
    const body = {
      name: document.getElementById('catName').value,
      description: document.getElementById('catDesc').value
    };

    try {
      if (id) {
        await App.request(`/categories/${id}`, { method: 'PUT', body });
        App.showToast('Category updated.', 'success');
      } else {
        await App.request('/categories', { method: 'POST', body });
        App.showToast('New category added.', 'success');
      }

      const modalEl = document.getElementById('categoryModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();

      this.loadCategories();
    } catch (err) {
      alertEl.textContent = err.message;
      alertEl.classList.remove('d-none');
    }
  },

  async deleteCategory(id, name) {
    if (!confirm(`Are you sure you want to delete category '${name}'?`)) return;

    try {
      await App.request(`/categories/${id}`, { method: 'DELETE' });
      App.showToast(`Deleted category '${name}'.`, 'info');
      this.loadCategories();
    } catch (err) {
      App.showToast(err.message, 'danger');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CategoriesUI.init();
});
