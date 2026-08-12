/**
 * GEARSHIFT - Core Client Application Module
 */

const App = {
  apiBase: '/api',
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  init() {
    this.setupNavigation();
    AuthUI.init();
    
    // Initial route handling
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  /**
   * Router for Single Page Application sections
   */
  handleRoute() {
    const hash = window.location.hash || '#dashboard';
    const sections = document.querySelectorAll('.spa-section');
    sections.forEach(sec => sec.classList.add('d-none'));

    const targetSection = document.querySelector(`#section-${hash.replace('#', '')}`);
    if (targetSection) {
      targetSection.classList.remove('d-none');
    } else {
      document.querySelector('#section-dashboard').classList.remove('d-none');
    }

    // Update nav link active state
    const navLinks = document.querySelectorAll('#mainNav .nav-link');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });

    // Refresh view data on navigation
    switch (hash) {
      case '#dashboard':
        DashboardUI.loadStats();
        break;
      case '#products':
        ProductsUI.loadProducts();
        ProductsUI.loadDropdowns();
        break;
      case '#categories':
        CategoriesUI.loadCategories();
        break;
      case '#suppliers':
        SuppliersUI.loadSuppliers();
        break;
      case '#stock-logs':
        StockUI.loadLogs();
        break;
      default:
        DashboardUI.loadStats();
        break;
    }
  },

  setupNavigation() {
    // Close mobile navbar on click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navCollapse = document.getElementById('topNav');
    navLinks.forEach(l => l.addEventListener('click', () => {
      if (navCollapse.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(navCollapse);
        bsCollapse.hide();
      }
    }));
  },

  /**
   * Universal Fetch Wrapper with Auth Bearer Headers & Toast Notifications
   */
  async request(url, options = {}) {
    options.headers = options.headers || {};
    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${this.apiBase}${url}`, options);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid
          if (this.token && !url.includes('/auth/login')) {
            this.showToast('Session expired. Please login again.', 'warning');
            AuthUI.logout();
          }
        }
        throw new Error(data.message || 'API request failed.');
      }
      return data;
    } catch (err) {
      console.error('[API Error]:', err.message);
      throw err;
    }
  },

  showToast(message, type = 'primary') {
    const toastEl = document.getElementById('appToast');
    const toastMsg = document.getElementById('toastMessage');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastMsg.textContent = message;
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  },

  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
