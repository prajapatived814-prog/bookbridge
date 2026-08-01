/**
 * ==========================================================================
 * BOOKBRIDGE PREMIUM APPLICATION CONTROLLER
 * Handles all page logic, components, animations, and UI interactions
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  initGlobalComponents();
  await updateNavUserUI();

  const path = window.location.pathname;
  if (path.includes('admin')) initAdminPage();
  else if (path.includes('browse')) initBrowsePage();
  else if (path.includes('exchange')) initExchangePage();
  else if (path.includes('donate')) initDonatePage();
  else if (path.includes('contact')) initContactPage();
  else if (path.includes('login')) initLoginPage();
  else if (path.includes('register')) initRegisterPage();
  else if (path.includes('dashboard')) initDashboardPage();
  else initHomePage();
});

/* ==========================================================================
   GLOBAL COMPONENTS
   ========================================================================== */

function initGlobalComponents() {
  setupMobileMenu();
  setupScrollToTop();
  setupNavbarScroll();
  setupScrollAnimations();
  setupAccordions();
  setupModals();
  setupCounterAnimations();
}

/* 📱 MOBILE MENU */
function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = drawer.classList.toggle('active');
    btn.innerHTML = isActive ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    btn.setAttribute('aria-expanded', isActive);
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('active');
      btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* 🔝 SCROLL TO TOP */
function setupScrollToTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* 🧊 NAVBAR SCROLL EFFECT */
function setupNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* ✨ SCROLL ANIMATIONS (Intersection Observer) */
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* 🔢 COUNTER ANIMATIONS */
function setupCounterAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* 🎵 ACCORDION */
function setupAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');

      // Close all siblings
      item.closest('.accordion').querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* 🪟 MODALS */
function setupModals() {
  // Book details modal
  const bookModal = document.getElementById('bookDetailsModal');
  const closeBookModal = document.getElementById('closeBookDetailsModal');
  if (bookModal && closeBookModal) {
    closeBookModal.addEventListener('click', () => bookModal.classList.remove('active'));
    bookModal.addEventListener('click', (e) => {
      if (e.target === bookModal) bookModal.classList.remove('active');
    });
  }

  // Upload modal
  const uploadModal = document.getElementById('uploadModal');
  const closeUpload = document.getElementById('closeUploadModal');
  if (uploadModal && closeUpload) {
    closeUpload.addEventListener('click', () => uploadModal.classList.remove('active'));
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) uploadModal.classList.remove('active');
    });
  }

  // Escape key closes all modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
  });
}

/* 🔔 TOAST NOTIFICATION SYSTEM */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'fa-solid fa-circle-check',
    warning: 'fa-solid fa-triangle-exclamation',
    danger: 'fa-solid fa-circle-xmark',
    info: 'fa-solid fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.closest('.toast').remove()"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* 🔐 PASSWORD VISIBILITY TOGGLE */
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
};

/* 👤 NAV USER SESSION */
async function updateNavUserUI() {
  const currentUser = await window.BookAPI.getCurrentUser();
  const navActions = document.querySelector('.nav-actions');
  const mobileActions = document.querySelector('.drawer-actions');
  const adminNavActions = document.getElementById('adminNavActions');

  if (!currentUser) return;

  const role = (currentUser.role || 'student').toUpperCase();
  const userHTML = `
    <span style="font-size: 13px; font-weight: 600; color: var(--color-primary);">
      <i class="fa-solid fa-user-circle"></i> ${currentUser.name}
    </span>
    <button id="btnNavLogout" class="btn btn-ghost btn-sm">Logout</button>
  `;

  if (navActions && !adminNavActions) navActions.innerHTML = userHTML;
  if (mobileActions) {
    mobileActions.innerHTML = `
      <div style="font-size: 13px; font-weight: 600; color: var(--color-primary); padding: 8px 0;">
        <i class="fa-solid fa-user-circle"></i> ${currentUser.name} (${role})
      </div>
      <button id="btnMobileLogout" class="btn btn-secondary btn-block">Logout</button>
    `;
  }

  const logoutHandler = async () => {
    await window.BookAPI.logout();
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.reload(), 800);
  };

  document.getElementById('btnNavLogout')?.addEventListener('click', logoutHandler);
  document.getElementById('btnMobileLogout')?.addEventListener('click', logoutHandler);
}

/* ==========================================================================
   BOOK CARD RENDERER (Enhanced)
   ========================================================================== */

async function renderBooksGrid(container, books, actionLabel = 'View Details') {
  if (!container) return;

  if (!books || books.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <h3>No Books Found</h3>
        <p>No books match your current filters. Try adjusting your search criteria.</p>
        <a href="/browse.html" class="btn btn-secondary btn-sm">Browse All Books</a>
      </div>
    `;
    return;
  }

  const wishlistIds = await window.BookAPI.getWishlistIds();

  container.innerHTML = books.map(b => {
    const isWished = wishlistIds.includes(b.id);
    const ratingVal = b.rating || 4.7;
    const typeLabel = (b.mode || 'sell').toUpperCase();
    const initials = (b.seller?.name || 'BB').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const isDonation = b.price === 0 || b.mode === 'donate';
    const coverImg = b.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

    return `
      <div class="book-card">
        <div class="book-card-actions">
          <button class="card-action-btn ${isWished ? 'active' : ''}" onclick="handleToggleWishlist(event, '${b.id}')" title="Wishlist" aria-label="Toggle wishlist">
            <i class="${isWished ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
          <button class="card-action-btn" onclick="handleShare('${b.title}')" title="Share" aria-label="Share book">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>

        <div class="book-cover">
          ${isDonation ? '<span class="donation-badge"><i class="fa-solid fa-gift"></i> FREE</span>' : ''}
          <img src="${coverImg}" alt="${b.title}" loading="lazy">
        </div>

        <div class="book-body">
          <div class="book-meta-row">
            <span class="book-category">${b.branch || b.genre || 'Academic'}</span>
            <span class="book-type">${typeLabel}</span>
          </div>

          <div class="book-title">${b.title}</div>
          <div class="book-author">by ${b.author || 'Unknown'} · ${b.edition || 'Latest'}</div>

          <div class="book-details">
            <span class="book-detail-tag"><i class="fa-solid fa-language"></i> ${b.language || 'English'}</span>
            <span class="book-detail-tag"><i class="fa-solid fa-tag"></i> ${b.condition || 'Good'}</span>
            <span class="book-detail-tag"><i class="fa-solid fa-location-dot"></i> ${(b.location || 'Campus').substring(0, 15)}</span>
          </div>

          <div class="book-rating">
            <i class="fa-solid fa-star"></i> ${ratingVal}
            <span style="color: var(--color-gray-light); margin-left: 4px;">· ${b.status || 'Available'}</span>
          </div>

          <div class="book-seller">
            <span class="book-seller-avatar">${initials}</span>
            <span>${b.seller?.name || 'Student'}</span>
          </div>

          <div class="book-footer">
            <div class="${isDonation ? 'book-price-free' : 'book-price'}">
              ${isDonation ? 'FREE' : '₹' + b.price}
              ${b.original && b.price > 0 ? '<span class="original-price">₹' + b.original + '</span>' : ''}
            </div>
            <button class="btn btn-primary btn-sm" onclick="handleBookAction('${b.id}', '${actionLabel}')">${actionLabel}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ❤️ WISHLIST TOGGLE */
window.handleToggleWishlist = async function(e, bookId) {
  e.stopPropagation();
  const added = await window.BookAPI.toggleWishlist(bookId);
  const btn = e.currentTarget;
  const icon = btn.querySelector('i');

  if (added) {
    btn.classList.add('active');
    icon.className = 'fa-solid fa-heart';
    showToast('Added to wishlist', 'success');
  } else {
    btn.classList.remove('active');
    icon.className = 'fa-regular fa-heart';
    showToast('Removed from wishlist', 'info');
  }
};

/* 📤 SHARE */
window.handleShare = function(title) {
  if (navigator.share) {
    navigator.share({ title: `${title} - BookBridge`, url: window.location.href })
      .catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copied to clipboard!', 'success'))
      .catch(() => showToast('Could not copy link', 'warning'));
  }
};

/* 📖 BOOK ACTION MODAL */
window.handleBookAction = async function(bookId, actionLabel) {
  const book = await window.BookAPI.getBookById(bookId);
  if (!book) return;

  const modal = document.getElementById('bookDetailsModal');
  const titleEl = document.getElementById('modalBookTitle');
  const bodyEl = document.getElementById('modalBookBody');
  const waBtn = document.getElementById('btnModalWhatsapp');
  const confirmBtn = document.getElementById('btnModalActionConfirm');

  if (!modal) return;

  titleEl.textContent = book.title;
  const seller = book.seller || { name: 'Student', whatsapp: '+919876543210', email: 'student@rcti.ac.in' };
  const waNumber = (seller.whatsapp || '+919876543210').replace(/[^0-9]/g, '');

  bodyEl.innerHTML = `
    <div style="display: grid; gap: 10px; font-size: 14px; line-height: 1.8;">
      <div class="flex-between"><span style="color: var(--color-gray);">Author</span><strong>${book.author || 'N/A'}</strong></div>
      <div class="flex-between"><span style="color: var(--color-gray);">Subject</span><strong>${book.subject || book.genre || 'Academic'}</strong></div>
      <div class="flex-between"><span style="color: var(--color-gray);">Department</span><span class="badge badge-primary">${book.branch || 'CE'}</span></div>
      <div class="flex-between"><span style="color: var(--color-gray);">Condition</span><strong>${book.condition || 'Good'}</strong></div>
      <div class="flex-between"><span style="color: var(--color-gray);">Rating</span><strong style="color: var(--color-warning);">⭐ ${book.rating || 4.8}</strong></div>
      <div class="flex-between"><span style="color: var(--color-gray);">Price</span><strong style="color: var(--color-primary);">${book.price > 0 ? '₹' + book.price : 'FREE'}</strong></div>
      <div style="padding: 12px; background: rgba(0,0,0,0.02); border-radius: 8px; margin-top: 4px;">
        <span style="color: var(--color-gray); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Description</span>
        <p style="margin-top: 4px; color: var(--color-dark);">${book.description || 'Academic resource listed on BookBridge.'}</p>
      </div>
      <div class="flex-between" style="margin-top: 4px;"><span style="color: var(--color-gray);">Listed by</span><strong>${seller.name}</strong></div>
    </div>
  `;

  waBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${seller.name}, I'm interested in "${book.title}" on BookBridge!`)}`;
  confirmBtn.textContent = `${actionLabel}`;
  confirmBtn.onclick = async () => {
    const user = await window.BookAPI.getCurrentUser();
    if (!user) {
      showToast('Please login to continue', 'warning');
      setTimeout(() => window.location.href = '/login.html', 1000);
      return;
    }
    await window.BookAPI.sendMessage(seller.email, `Interested in: ${book.title}`, book.title);
    showToast(`Request sent to ${seller.name}!`, 'success');
    modal.classList.remove('active');
  };

  modal.classList.add('active');
};

/* ==========================================================================
   PAGE CONTROLLERS
   ========================================================================== */

/* 🏠 HOME */
async function initHomePage() {
  const grid = document.getElementById('popularBooksGrid');
  if (!grid) return;
  const books = await window.BookAPI.getBooks();
  await renderBooksGrid(grid, books.slice(0, 8), 'View Details');

  // Tab filters for home page popular books
  const tabsContainer = document.getElementById('homeBookTabs');
  if (tabsContainer) {
    const tabs = tabsContainer.querySelectorAll('.home-tab-pill');
    tabs.forEach(tab => {
      tab.addEventListener('click', async () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        let filtered = [...books];

        if (filter === 'popular') {
          filtered = filtered.filter(b => (b.rating || 0) >= 4.7);
        } else if (filter === 'exchange') {
          filtered = filtered.filter(b => b.mode === 'exchange');
        } else if (filter === 'donate') {
          filtered = filtered.filter(b => b.mode === 'donate' || b.price === 0);
        } else if (filter !== 'all') {
          filtered = filtered.filter(b => (b.branch || '').toUpperCase() === filter.toUpperCase() || (b.genre || '').toLowerCase().includes(filter.toLowerCase()));
        }

        await renderBooksGrid(grid, filtered.slice(0, 8), 'View Details');
      });
    });
  }
}

/* 🔍 BROWSE */
async function initBrowsePage() {
  const grid = document.getElementById('browseBooksGrid');
  const searchInput = document.getElementById('browseSearchInput');
  const searchBtn = document.getElementById('btnBrowseSearch');
  const pills = document.querySelectorAll('#deptPillsBar .filter-pill');
  const subjectSelect = document.getElementById('browseSubjectSelect');
  const conditionSelect = document.getElementById('browseConditionSelect');
  const maxPriceInput = document.getElementById('browseMaxPrice');
  const sortSelect = document.getElementById('browseSortSelect');
  const resultsCount = document.getElementById('browseResultsCount');

  // Pre-fill from URL params
  const params = new URLSearchParams(window.location.search);
  if (searchInput && params.get('q')) searchInput.value = params.get('q');

  let currentBranch = params.get('branch') || 'ALL';

  // Activate correct pill from URL
  if (currentBranch !== 'ALL') {
    pills.forEach(p => {
      p.classList.remove('active');
      if (p.dataset.dept === currentBranch) p.classList.add('active');
    });
  }

  let debounceTimer;

  async function fetchAndRender() {
    const filters = {};
    const query = searchInput?.value.trim();
    if (query) filters.query = query;
    if (currentBranch !== 'ALL') filters.branch = currentBranch;
    if (subjectSelect?.value && subjectSelect.value !== 'All Subjects') filters.subject = subjectSelect.value;
    if (conditionSelect?.value && conditionSelect.value !== 'Any Condition') filters.condition = conditionSelect.value;
    if (maxPriceInput?.value) filters.maxPrice = maxPriceInput.value;
    if (sortSelect?.value) filters.sort = sortSelect.value;

    const books = await window.BookAPI.getBooks(filters);
    if (resultsCount) resultsCount.textContent = `${books.length} book${books.length !== 1 ? 's' : ''} found`;
    await renderBooksGrid(grid, books, 'View Details');
  }

  function debouncedSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchAndRender, 300);
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentBranch = pill.dataset.dept || 'ALL';
      fetchAndRender();
    });
  });

  searchBtn?.addEventListener('click', fetchAndRender);
  searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchAndRender(); });
  searchInput?.addEventListener('input', debouncedSearch);
  subjectSelect?.addEventListener('change', fetchAndRender);
  conditionSelect?.addEventListener('change', fetchAndRender);
  maxPriceInput?.addEventListener('input', debouncedSearch);
  sortSelect?.addEventListener('change', fetchAndRender);

  fetchAndRender();
}

/* 🔄 EXCHANGE */
async function initExchangePage() {
  const grid = document.getElementById('exchangeGrid');
  const triggerBtn = document.getElementById('btnUploadBookTrigger');
  const modal = document.getElementById('uploadModal');
  const form = document.getElementById('uploadBookForm');

  // Drag & drop zone
  const dropZone = document.getElementById('uploadDropZone');
  const fileInput = document.getElementById('uploadFileInput');
  const fileList = document.getElementById('uploadFileList');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) handleFileSelect(fileInput.files[0]);
    });
  }

  function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB', 'warning');
      return;
    }
    if (fileList) {
      fileList.innerHTML = `
        <div class="upload-file-item">
          <i class="fa-solid fa-image" style="color: var(--color-primary);"></i>
          <span class="file-name">${file.name}</span>
          <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
          <button onclick="this.closest('.upload-file-item').remove()" style="color: var(--color-danger); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
    }
  }

  triggerBtn?.addEventListener('click', () => modal?.classList.add('active'));

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.classList.add('btn-loading');

    const newBook = {
      title: document.getElementById('uploadTitle').value.trim(),
      author: document.getElementById('uploadAuthor').value.trim(),
      branch: document.getElementById('uploadBranch').value,
      condition: document.getElementById('uploadCondition')?.value || 'Good',
      price: parseFloat(document.getElementById('uploadPrice').value) || 0,
      mode: 'exchange',
      category: 'physical'
    };

    const saved = await window.BookAPI.addBook(newBook);
    submitBtn.classList.remove('btn-loading');
    showToast(`"${saved?.title || newBook.title}" uploaded successfully!`, 'success');
    modal?.classList.remove('active');
    form.reset();
    if (fileList) fileList.innerHTML = '';
    fetchAndRender();
  });

  async function fetchAndRender() {
    const books = await window.BookAPI.getBooks();
    await renderBooksGrid(grid, books, 'Exchange');
  }

  fetchAndRender();
}

/* 🎁 DONATE */
async function initDonatePage() {
  const grid = document.getElementById('donateBooksGrid');
  const books = await window.BookAPI.getBooks();
  const donated = books.filter(b => b.price === 0 || b.mode === 'donate');
  await renderBooksGrid(grid, donated.length > 0 ? donated : books, 'Claim Free');
}

/* 📬 CONTACT */
function initContactPage() {
  const form = document.getElementById('contactPageForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const text = document.getElementById('contactMessage').value;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.classList.add('btn-loading');

    await window.BookAPI.sendMessage(email, text, 'Contact Support');

    submitBtn.classList.remove('btn-loading');
    showToast(`Thank you, ${name}! Your message has been sent.`, 'success');
    form.reset();
  });
}

/* 🔑 LOGIN */
function initLoginPage() {
  const form = document.getElementById('dedicatedLoginForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const submitBtn = document.getElementById('loginSubmitBtn');

    // Basic validation
    let valid = true;
    if (!email) {
      document.getElementById('loginEmail')?.closest('.input-group, .form-group')?.classList.add('error');
      valid = false;
    }
    if (!password) {
      document.getElementById('loginPassword')?.closest('.input-group, .form-group')?.classList.add('error');
      valid = false;
    }
    if (!valid) return;

    if (submitBtn) submitBtn.classList.add('btn-loading');

    try {
      const user = await window.BookAPI.login(email, password);
      if (submitBtn) submitBtn.classList.remove('btn-loading');

      if (user) {
        showToast(`Welcome back, ${user.name || 'Student'}!`, 'success');
        // Redirect to browse page after successful login
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'browse.html';
        setTimeout(() => window.location.href = redirectUrl, 800);
      } else {
        showToast('Invalid email or password. Please try again.', 'danger');
      }
    } catch (err) {
      if (submitBtn) submitBtn.classList.remove('btn-loading');
      // Show the server's error message (e.g. 'Invalid email or password.')
      showToast(err.message || 'Login failed. Please check your credentials.', 'danger');
    }
  });

  // Clear error on focus
  document.querySelectorAll('#dedicatedLoginForm input').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.input-group, .form-group')?.classList.remove('error');
    });
  });
}

/* 📝 REGISTER */
function initRegisterPage() {
  const form = document.getElementById('dedicatedRegisterForm');
  const passwordInput = document.getElementById('regPassword');

  // Password strength meter
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const bars = [document.getElementById('str1'), document.getElementById('str2'), document.getElementById('str3'), document.getElementById('str4')];
      const text = document.getElementById('passwordStrengthText');
      let strength = 0;

      if (val.length >= 4) strength++;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val) && /[0-9]/.test(val)) strength++;
      if (/[^a-zA-Z0-9]/.test(val) && val.length >= 10) strength++;

      const levels = ['', 'weak', 'medium', 'medium', 'strong'];
      const labels = ['', 'Weak password', 'Fair password', 'Good password', 'Strong password'];
      const colors = ['', 'var(--color-danger)', 'var(--color-warning)', 'var(--color-warning)', 'var(--color-success)'];

      bars.forEach((bar, i) => {
        bar.className = 'strength-bar';
        if (i < strength) bar.classList.add(levels[strength]);
      });
      if (text) {
        text.textContent = labels[strength];
        text.style.color = colors[strength];
      }
    });
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('registerSubmitBtn');

    const userData = {
      name: document.getElementById('regName').value.trim(),
      enrollment: document.getElementById('regEnrollment').value.trim(),
      branch: document.getElementById('regBranch').value,
      email: document.getElementById('regEmail').value.trim(),
      password: document.getElementById('regPassword').value.trim()
    };

    // Validation
    let valid = true;
    ['regName', 'regEnrollment', 'regEmail', 'regPassword'].forEach(id => {
      const input = document.getElementById(id);
      if (!input.value.trim()) {
        input.closest('.form-group')?.classList.add('error');
        valid = false;
      }
    });

    if (!document.getElementById('regTerms')?.checked) {
      showToast('Please accept the Terms of Service', 'warning');
      return;
    }

    if (!valid) return;

    submitBtn.classList.add('btn-loading');
    const user = await window.BookAPI.register(userData);
    submitBtn.classList.remove('btn-loading');

    if (user) {
      showToast(`Welcome, ${user.name}! Account created.`, 'success');
      setTimeout(() => window.location.href = '/login.html', 1200);
    } else {
      showToast('Registration failed. Please try again.', 'danger');
    }
  });

  // Clear error on focus
  document.querySelectorAll('#dedicatedRegisterForm .form-input').forEach(input => {
    input.addEventListener('focus', () => input.closest('.form-group')?.classList.remove('error'));
  });
}

/* 🛡️ ADMIN */
async function initAdminPage() {
  const tbody = document.getElementById('adminBooksTableBody');
  const addBtn = document.getElementById('btnAdminAddBook');

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const title = prompt('Enter Book Title:');
      if (!title) return;
      const author = prompt('Author Name:') || 'Faculty';
      const branch = prompt('Department (CE/IT/EE/ME/Civil):') || 'CE';

      await window.BookAPI.addBook({ title, author, branch, category: 'official', price: 0 });
      showToast(`"${title}" added to catalog`, 'success');
      fetchAdmin();
    });
  }

  async function fetchAdmin() {
    const stats = await window.BookAPI.getAdminStats();
    const els = { adminStatUsers: stats.totalUsers, adminStatBooks: stats.totalListings, adminStatSwaps: stats.activeSwaps || 0, adminStatDonations: stats.freeDonations || 0 };
    Object.entries(els).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) { el.dataset.count = val; el.textContent = val.toLocaleString('en-IN'); }
    });

    if (!tbody) return;
    const books = await window.BookAPI.getBooks();
    tbody.innerHTML = books.map((b, i) => `
      <tr>
        <td><span style="color: var(--color-primary); font-weight: 600;">${b.gtuCode || b.id?.substring(0, 12) || 'N/A'}</span></td>
        <td><strong>${b.title}</strong></td>
        <td><span class="badge badge-primary">${b.branch || 'CE'}</span></td>
        <td>${b.price > 0 ? '₹' + b.price : 'Free / Exchange'}</td>
        <td><span class="badge badge-success">Active</span></td>
        <td style="text-align: right;">
          <button onclick="handleDeleteAdminBook('${b.id}')" class="btn btn-danger btn-sm" style="height: 32px; padding: 0 12px; font-size: 12px;">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  fetchAdmin();
}

window.handleDeleteAdminBook = async function(id) {
  if (confirm('Delete this book listing?')) {
    await window.BookAPI.deleteBook(id);
    showToast('Listing removed', 'success');
    initAdminPage();
  }
};

/* 📊 DASHBOARD */
async function initDashboardPage() {
  // Placeholder for user dashboard
}
