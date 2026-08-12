/**
 * GEARSHIFT - Authentication & Role UI Handler
 */

const AuthUI = {
  init() {
    this.bindEvents();
    this.updateUserUI();
  },

  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertEl = document.getElementById('loginAlert');
        alertEl.classList.add('d-none');

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
          const res = await App.request('/auth/login', {
            method: 'POST',
            body: { username, password }
          });

          App.token = res.token;
          App.user = res.user;
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          const modalEl = document.getElementById('loginModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();

          loginForm.reset();
          App.showToast(`Welcome back, ${res.user.username}!`, 'success');
          this.updateUserUI();
          App.handleRoute();
        } catch (err) {
          alertEl.textContent = err.message;
          alertEl.classList.remove('d-none');
        }
      });
    }

    // Register Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertEl = document.getElementById('registerAlert');
        alertEl.classList.add('d-none');

        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;

        try {
          const res = await App.request('/auth/register', {
            method: 'POST',
            body: { username, email, password, role }
          });

          App.token = res.token;
          App.user = res.user;
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          const modalEl = document.getElementById('registerModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();

          registerForm.reset();
          App.showToast(`Registration successful. Logged in as ${res.user.username}.`, 'success');
          this.updateUserUI();
          App.handleRoute();
        } catch (err) {
          alertEl.textContent = err.message;
          alertEl.classList.remove('d-none');
        }
      });
    }

    // Logout Button
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.logout());
    }
  },

  logout() {
    App.token = null;
    App.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    App.showToast('You have logged out.', 'info');
    this.updateUserUI();
    App.handleRoute();
  },

  updateUserUI() {
    const userInfo = document.getElementById('userInfo');
    const authButtons = document.getElementById('authButtons');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (App.token && App.user) {
      userInfo.classList.remove('d-none');
      userInfo.classList.add('d-flex');
      authButtons.classList.add('d-none');

      userName.textContent = App.user.username;
      userRole.textContent = App.user.role;
      userAvatar.textContent = App.user.username.charAt(0).toUpperCase();

      // Enable role-based buttons
      this.toggleRolePermissions(App.user.role);
    } else {
      userInfo.classList.add('d-none');
      userInfo.classList.remove('d-flex');
      authButtons.classList.remove('d-none');
      this.toggleRolePermissions('guest');
    }
  },

  toggleRolePermissions(role) {
    const isAdminOrManager = ['admin', 'manager'].includes(role);
    const isAdmin = role === 'admin';

    // Show/Hide or Disable write buttons
    const writeButtons = [
      'btnQuickAddPart', 'btnCreateProduct', 'btnCreateCategory', 
      'btnCreateSupplier', 'btnQuickStockAdjust'
    ];

    writeButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        if (role === 'guest') {
          btn.classList.add('disabled');
          btn.setAttribute('title', 'Login required to perform write actions.');
        } else {
          btn.classList.remove('disabled');
          btn.removeAttribute('title');
        }
      }
    });
  }
};
