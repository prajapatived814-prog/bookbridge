/**
 * ==========================================================================
 * OFFICIAL RCTI APPLICATION CONTROLLER WITH ENTERPRISE SAAS DESIGN & REALTIME
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  const socket = (typeof io !== 'undefined') ? io() : null;

  const state = {
    filters: {
      query: '',
      mode: 'all',
      genre: 'all',
      semester: 'all',
      branch: 'all',
      resourceType: 'all',
      condition: 'all',
      category: 'all',
      sort: 'newest'
    },
    currentUser: null,
    selectedBook: null,
    currentDashTab: 'listings',
    chatTargetEmail: null,
    chatBookTitle: '',
    wizard: {
      step: 1,
      category: 'physical',
      mode: 'exchange',
      resourceType: 'textbook'
    }
  };

  const DOM = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    heroBookTrack: document.getElementById('heroBookTrack'),
    genrePillsBar: document.getElementById('genrePillsBar'),
    searchInput: document.getElementById('searchInput'),
    categorySelect: document.getElementById('categorySelect'),
    resourceTypeSelect: document.getElementById('resourceTypeSelect'),
    conditionSelect: document.getElementById('conditionSelect'),
    semesterSelect: document.getElementById('semesterSelect'),
    branchSelect: document.getElementById('branchSelect'),
    modeSelect: document.getElementById('modeSelect'),
    bookGrid: document.getElementById('bookGrid'),
    aiRecommendationsGrid: document.getElementById('aiRecommendationsGrid'),
    dashTabContent: document.getElementById('dashTabContent'),
    contactForm: document.getElementById('contactForm'),

    // Department Hub
    navDeptHub: document.getElementById('navDeptHub'),
    navCommunity: document.getElementById('navCommunity'),
    departmentHub: document.getElementById('departmentHub'),
    hubBranchSelect: document.getElementById('hubBranchSelect'),
    hubSemesterSelect: document.getElementById('hubSemesterSelect'),
    hubResourceGrid: document.getElementById('hubResourceGrid'),

    // Contact Seller Modal
    sellerContactModal: document.getElementById('sellerContactModal'),
    closeSellerContactModal: document.getElementById('closeSellerContactModal'),
    sellerModalName: document.getElementById('sellerModalName'),
    sellerModalDept: document.getElementById('sellerModalDept'),
    sellerModalPhone: document.getElementById('sellerModalPhone'),
    sellerModalEmail: document.getElementById('sellerModalEmail'),
    sellerCallBtn: document.getElementById('sellerCallBtn'),
    sellerCopyBtn: document.getElementById('sellerCopyBtn'),
    sellerMessageBtn: document.getElementById('sellerMessageBtn'),

    // Upload Wizard Modal
    multiStepUploadModal: document.getElementById('multiStepUploadModal'),
    closeUploadWizardModal: document.getElementById('closeUploadWizardModal'),
    wizardForm: document.getElementById('wizardForm'),
    wizardStep1: document.getElementById('wizardStep1'),
    wizardStep2: document.getElementById('wizardStep2'),
    wizardStep3: document.getElementById('wizardStep3'),
    wizardStep4: document.getElementById('wizardStep4'),
    btnStep1Next: document.getElementById('btnStep1Next'),
    btnStep2Back: document.getElementById('btnStep2Back'),
    btnStep2Next: document.getElementById('btnStep2Next'),
    btnStep3Back: document.getElementById('btnStep3Back'),
    btnStep3Next: document.getElementById('btnStep3Next'),
    btnStep4Back: document.getElementById('btnStep4Back'),
    wizardResTypeSelect: document.getElementById('wizardResTypeSelect'),

    // Edit Modal
    editResourceModal: document.getElementById('editResourceModal'),
    closeEditResourceModal: document.getElementById('closeEditResourceModal'),
    editResourceForm: document.getElementById('editResourceForm'),

    // PDF & QR Modals
    pdfModal: document.getElementById('pdfModal'),
    closePdfModal: document.getElementById('closePdfModal'),
    pdfModalTitle: document.getElementById('pdfModalTitle'),
    pdfFileName: document.getElementById('pdfFileName'),
    btnDownloadPdfConfirm: document.getElementById('btnDownloadPdfConfirm'),

    qrModal: document.getElementById('qrModal'),
    closeQrModal: document.getElementById('closeQrModal'),
    qrModalBookTitle: document.getElementById('qrModalBookTitle'),

    // Admin
    navAdmin: document.getElementById('navAdmin'),
    adminPanel: document.getElementById('adminPanel'),
    adminStatsGrid: document.getElementById('adminStatsGrid'),
    adminUserTableContainer: document.getElementById('adminUserTableContainer'),

    // Chat Modal
    chatModal: document.getElementById('chatModal'),
    closeChatModal: document.getElementById('closeChatModal'),
    chatHeaderTitle: document.getElementById('chatHeaderTitle'),
    chatHeaderSub: document.getElementById('chatHeaderSub'),
    chatMessagesContainer: document.getElementById('chatMessagesContainer'),
    chatForm: document.getElementById('chatForm'),
    chatInput: document.getElementById('chatInput'),

    // Review Modal
    reviewModal: document.getElementById('reviewModal'),
    closeReviewModal: document.getElementById('closeReviewModal'),
    reviewForm: document.getElementById('reviewForm'),
    reviewSubtitle: document.getElementById('reviewSubtitle'),
    reviewSellerEmail: document.getElementById('reviewSellerEmail'),
    reviewRating: document.getElementById('reviewRating'),
    reviewComment: document.getElementById('reviewComment'),

    // Modals
    navInfo: document.getElementById('navInfo'),
    projectInfoModal: document.getElementById('projectInfoModal'),
    closeProjectInfoModal: document.getElementById('closeProjectInfoModal'),

    userAuthBtn: document.getElementById('userAuthBtn'),
    authModal: document.getElementById('authModal'),
    closeAuthModal: document.getElementById('closeAuthModal'),
    tabLogin: document.getElementById('tabLogin'),
    tabRegister: document.getElementById('tabRegister'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),

    listBookModalBtn: document.getElementById('listBookModalBtn'),
    actionModal: document.getElementById('actionModal'),
    closeActionModal: document.getElementById('closeActionModal'),
    actionForm: document.getElementById('actionForm'),
    actionTitle: document.getElementById('actionTitle'),
    actionSubtitle: document.getElementById('actionSubtitle'),
    actionBookId: document.getElementById('actionBookId'),
    actionDetailsLabel: document.getElementById('actionDetailsLabel'),
    actionSubmitBtn: document.getElementById('actionSubmitBtn'),
    btnLiveChatDirect: document.getElementById('btnLiveChatDirect'),
    btnWhatsappDirect: document.getElementById('btnWhatsappDirect'),

    toastContainer: document.getElementById('toastContainer')
  };

  /* ⚡ SOCKET.IO REAL-TIME LISTENERS */
  if (socket) {
    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server');
    });

    socket.on('newMessage', (msg) => {
      if (state.chatTargetEmail && (msg.senderEmail === state.chatTargetEmail || msg.receiverEmail === state.chatTargetEmail)) {
        appendMessageToContainer(msg);
      } else if (state.currentUser && msg.receiverEmail === state.currentUser.email) {
        showToast(`💬 New live message from ${msg.senderName}: "${msg.text}"`, 'info');
      }
    });

    socket.on('newReview', (review) => {
      showToast(`⭐ New ${review.rating}-Star Review by ${review.reviewerName}!`, 'success');
      renderCatalog();
    });

    socket.on('bookDeleted', (id) => {
      const el = document.querySelector(`.book-card[data-id="${id}"]`);
      if (el) {
        el.style.transition = 'all 0.4s ease';
        el.style.opacity = '0';
        el.style.transform = 'scale(0.8)';
        setTimeout(() => el.remove(), 400);
      }
      showToast(`⚡ Listing removed from marketplace live`, 'info');
    });

    socket.on('bookUpdated', (updatedBook) => {
      showToast(`✨ Listing updated live: "${updatedBook.title}"`, 'info');
      renderCatalog();
      renderDepartmentHub();
    });

    socket.on('newBook', (book) => {
      showToast(`✨ New resource published: "${book.title}"!`, 'info');
      renderCatalog();
      renderDepartmentHub();
    });
  }

  function appendMessageToContainer(m) {
    const isMine = m.senderEmail === state.currentUser?.email;
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `align-self: ${isMine ? 'flex-end' : 'flex-start'}; max-width: 80%; background: ${isMine ? 'var(--text-white)' : 'var(--bg-card)'}; color: ${isMine ? 'var(--text-dark)' : 'var(--text-white)'}; padding: 0.6rem 1rem; border-radius: 12px; font-size: 0.88rem; border: 1px solid var(--border-pill);`;
    msgDiv.innerHTML = `
      <div style="font-size: 0.7rem; opacity: 0.75; font-weight: 700;">${isMine ? 'You' : escapeHTML(m.senderName)}</div>
      <div>${escapeHTML(m.text)}</div>
    `;
    DOM.chatMessagesContainer.appendChild(msgDiv);
    DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
  }

  async function initApp() {
    setupTheme();
    setupEventListeners();
    await updateAuthUI();
    await render3DHeroTrack();
    await renderCatalog();
    await renderDepartmentHub();
    await renderAIRecommendations();
    await renderDashboardTab(state.currentDashTab);
  }

  function setupTheme() {
    const savedTheme = localStorage.getItem('bookbridge_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      DOM.themeToggleBtn.textContent = '☀️';
    } else {
      DOM.themeToggleBtn.textContent = '🌙';
    }

    DOM.themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('bookbridge_theme', isLight ? 'light' : 'dark');
      DOM.themeToggleBtn.textContent = isLight ? '☀️' : '🌙';
      showToast(isLight ? 'Switched to Light Theme ☀️' : 'Switched to Dark Theme 🌙', 'info');
    });
  }

  async function updateAuthUI() {
    state.currentUser = await window.BookAPI.getCurrentUser();
    if (state.currentUser) {
      const roleBadge = (state.currentUser.role || 'student').toUpperCase();
      DOM.userAuthBtn.innerHTML = `👤 ${escapeHTML(state.currentUser.name)} (${roleBadge} • ${state.currentUser.branch} Sem ${state.currentUser.semester})`;
      if (state.currentUser.role === 'admin') {
        DOM.navAdmin.style.display = 'block';
        await renderAdminPanel();
      } else {
        DOM.navAdmin.style.display = 'none';
        DOM.adminPanel.style.display = 'none';
      }
    } else {
      DOM.userAuthBtn.innerHTML = `👤 Sign In`;
      DOM.navAdmin.style.display = 'none';
      DOM.adminPanel.style.display = 'none';
    }
  }

  /* 🏛️ DEPARTMENT RESOURCE HUB */
  async function renderDepartmentHub() {
    const branch = DOM.hubBranchSelect.value;
    const sem = DOM.hubSemesterSelect.value;

    const books = await window.BookAPI.getBooks({
      branch: branch,
      semester: sem
    });
    const wishlistIds = await window.BookDB.getWishlistIds();

    if (books.length === 0) {
      DOM.hubResourceGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; background:var(--bg-card); border-radius:var(--radius-md);">
          <div style="font-size:2.5rem; margin-bottom:1rem;">📋</div>
          <h3 style="font-family:var(--font-title); font-size:1.4rem; margin-bottom:0.5rem;">No departmental resources listed yet</h3>
          <p style="color:var(--text-muted); font-size:0.88rem;">Be the first to post a GTU textbook or practical lab manual for ${branch}!</p>
        </div>
      `;
      return;
    }

    DOM.hubResourceGrid.innerHTML = books.map(b => createBookCardHTML(b, wishlistIds.includes(b.id))).join('');
  }

  /* 👤 CONTACT SELLER POPUP MODAL */
  function openSellerContactModal(b) {
    const seller = b.seller || {};
    DOM.sellerModalName.textContent = seller.name || 'Student Seller';
    DOM.sellerModalDept.textContent = `${b.branch || 'CE'} Department • GTU Sem ${b.semester} • RCTI Ahmedabad`;
    DOM.sellerModalPhone.textContent = seller.whatsapp || '+91 98765 43210';
    DOM.sellerModalEmail.textContent = seller.email || 'student@rcti.ac.in';
    DOM.sellerCallBtn.href = `tel:${(seller.whatsapp || '+919876543210').replace(/[^0-9+]/g, '')}`;

    DOM.sellerCopyBtn.onclick = () => {
      navigator.clipboard.writeText(seller.whatsapp || '+919876543210');
      showToast('📋 Phone number copied to clipboard!', 'success');
    };

    DOM.sellerMessageBtn.onclick = () => {
      closeModal(DOM.sellerContactModal);
      openChatModal(seller.email || 'seller@rcti.ac.in', b.title);
    };

    openModal(DOM.sellerContactModal);
  }

  /* 📥 PDF PREVIEW MODAL */
  function openPdfModal(title, pdfUrl) {
    DOM.pdfModalTitle.textContent = title;
    DOM.pdfFileName.textContent = `${title} — GTU Practical Manual.pdf`;
    DOM.btnDownloadPdfConfirm.onclick = () => {
      showToast(`Downloading GTU Practical Manual PDF for ${title}...`, 'success');
      closeModal(DOM.pdfModal);
    };
    openModal(DOM.pdfModal);
  }

  /* 📲 QR CODE SHARE MODAL */
  function openQrModal(bookTitle) {
    DOM.qrModalBookTitle.textContent = `QR Code Link for "${bookTitle}"`;
    openModal(DOM.qrModal);
  }

  /* WIZARD STEPS */
  function setWizardStep(stepNum) {
    state.wizard.step = stepNum;
    DOM.wizardStep1.style.display = stepNum === 1 ? 'block' : 'none';
    DOM.wizardStep2.style.display = stepNum === 2 ? 'block' : 'none';
    DOM.wizardStep3.style.display = stepNum === 3 ? 'block' : 'none';
    DOM.wizardStep4.style.display = stepNum === 4 ? 'block' : 'none';

    document.getElementById('stepInd1').style.color = stepNum >= 1 ? 'var(--text-white)' : 'var(--text-muted)';
    document.getElementById('stepInd2').style.color = stepNum >= 2 ? 'var(--text-white)' : 'var(--text-muted)';
    document.getElementById('stepInd3').style.color = stepNum >= 3 ? 'var(--text-white)' : 'var(--text-muted)';
    document.getElementById('stepInd4').style.color = stepNum >= 4 ? 'var(--text-white)' : 'var(--text-muted)';

    if (stepNum === 3) {
      if (state.wizard.category === 'physical') {
        DOM.wizardResTypeSelect.innerHTML = `
          <option value="textbook">📖 Printed Textbook</option>
          <option value="lab_manual">📋 Practical Lab Manual Workbook</option>
          <option value="notes">📑 Printed Lecture Notes</option>
          <option value="assignment">📄 Assignment Hardcopy</option>
          <option value="question_bank">📑 Previous Year Question Papers</option>
          <option value="project_report">📂 Practical File / Project Report</option>
        `;
      } else {
        DOM.wizardResTypeSelect.innerHTML = `
          <option value="lab_manual">📋 Lab Manual PDF</option>
          <option value="textbook">📖 E-Book PDF</option>
          <option value="notes">📑 Notes PDF</option>
          <option value="question_bank">📑 Question Paper PDF</option>
          <option value="project_report">💻 Source Code / ZIP File</option>
          <option value="ppt">📊 Video Lecture / PPT Presentation</option>
        `;
      }
    }
  }

  /* 🛡️ ADMIN PANEL */
  async function renderAdminPanel() {
    DOM.adminPanel.style.display = 'block';
    const stats = await window.BookAPI.getAdminStats();
    const users = await window.BookAPI.getAllUsers();

    DOM.adminStatsGrid.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-pill); border-radius:var(--radius-md); padding:1.25rem;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Registered Users</div>
        <div style="font-size:1.8rem; font-weight:800; font-family:var(--font-title);">${stats.totalUsers}</div>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-pill); border-radius:var(--radius-md); padding:1.25rem;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Total Listings</div>
        <div style="font-size:1.8rem; font-weight:800; font-family:var(--font-title);">${stats.totalListings}</div>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-pill); border-radius:var(--radius-md); padding:1.25rem;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Active Swaps</div>
        <div style="font-size:1.8rem; font-weight:800; font-family:var(--font-title);">${stats.activeSwaps}</div>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-pill); border-radius:var(--radius-md); padding:1.25rem;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Free Donations</div>
        <div style="font-size:1.8rem; font-weight:800; font-family:var(--font-title);">${stats.freeDonations}</div>
      </div>
    `;

    DOM.adminUserTableContainer.innerHTML = `
      <table style="width:100%; text-align:left; font-size:0.88rem; border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border-subtle); color:var(--text-muted);">
            <th style="padding:0.75rem;">Name</th>
            <th style="padding:0.75rem;">Enrollment No</th>
            <th style="padding:0.75rem;">Email</th>
            <th style="padding:0.75rem;">Branch / Sem</th>
            <th style="padding:0.75rem;">Role</th>
            <th style="padding:0.75rem;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr style="border-bottom:1px solid var(--border-pill);">
              <td style="padding:0.75rem; font-weight:600;">${escapeHTML(u.name)}</td>
              <td style="padding:0.75rem;">${escapeHTML(u.enrollment || 'N/A')}</td>
              <td style="padding:0.75rem;">${escapeHTML(u.email)}</td>
              <td style="padding:0.75rem;">${u.branch} Sem ${u.semester}</td>
              <td style="padding:0.75rem;"><span class="badge-mode ${u.role === 'admin' ? 'sell' : 'buy'}">${(u.role || 'student').toUpperCase()}</span></td>
              <td style="padding:0.75rem;">
                ${u.role !== 'admin' ? `<button class="card-btn btn-delete-user" data-user-id="${u.id}" style="background:#f43f5e; border-color:#f43f5e; color:#fff;">Ban / Delete</button>` : 'System'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.querySelectorAll('.btn-delete-user').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = e.target.dataset.userId;
        if (confirm('Ban / delete this user?')) {
          await window.BookAPI.deleteUser(uid);
          showToast('User deleted successfully', 'info');
          await renderAdminPanel();
        }
      });
    });
  }

  /* 💬 LIVE CHAT */
  async function openChatModal(receiverEmail, bookTitle) {
    if (!state.currentUser) {
      showToast('Please sign in to send direct messages', 'info');
      openModal(DOM.authModal);
      return;
    }
    state.chatTargetEmail = receiverEmail;
    state.chatBookTitle = bookTitle;

    DOM.chatHeaderTitle.textContent = `Chat with ${receiverEmail}`;
    DOM.chatHeaderSub.textContent = `Inquiry for "${bookTitle}"`;

    await renderChatMessages();
    openModal(DOM.chatModal);
  }

  async function renderChatMessages() {
    if (!state.chatTargetEmail) return;
    const msgs = await window.BookAPI.getMessages(state.chatTargetEmail);

    if (msgs.length === 0) {
      DOM.chatMessagesContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center;">No messages yet. Send a message to start conversation!</p>';
      return;
    }

    DOM.chatMessagesContainer.innerHTML = '';
    msgs.forEach(m => appendMessageToContainer(m));
  }

  /* 3D Hero Track */
  async function render3DHeroTrack() {
    const books = await window.BookAPI.getBooks({});
    
    DOM.heroBookTrack.innerHTML = books.map(b => `
      <div class="book-3d-item" data-id="${b.id}">
        <div class="book-3d-cover" style="background: ${b.coverGradient}; color: ${b.textColor || '#ffffff'};">
          <div style="font-size:0.7rem; opacity:0.85; text-transform:uppercase; font-weight:700;">
            ${(b.category || 'physical').toUpperCase()} • Sem ${b.semester}
          </div>
          <div style="font-size:1.6rem; margin-bottom: 0.25rem;">${b.icon || '📚'}</div>
          <div>
            <div class="book-3d-title">${escapeHTML(b.title)}</div>
            <div class="book-3d-author">by ${escapeHTML(b.author)}</div>
          </div>
        </div>
      </div>
    `).join('');

    DOM.heroBookTrack.addEventListener('click', (e) => {
      const item = e.target.closest('.book-3d-item');
      if (item) openActionModal(item.dataset.id);
    });
  }

  /* Catalog */
  async function renderCatalog() {
    const books = await window.BookAPI.getBooks(state.filters);
    const wishlistIds = await window.BookDB.getWishlistIds();

    if (books.length === 0) {
      DOM.bookGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem; background:var(--bg-card); border-radius:var(--radius-md);">
          <div style="font-size:2.5rem; margin-bottom:1rem;">🌉</div>
          <h3 style="font-family:var(--font-title); font-size:1.5rem; margin-bottom:0.5rem;">No resources found</h3>
          <p style="color:var(--text-muted); font-size:0.9rem;">Try selecting a different category, module, resource type, condition, or GTU semester.</p>
        </div>
      `;
      return;
    }

    DOM.bookGrid.innerHTML = books.map(b => createBookCardHTML(b, wishlistIds.includes(b.id))).join('');
  }

  async function renderAIRecommendations() {
    const branch = state.currentUser?.branch || 'CE';
    const semester = state.currentUser?.semester || 5;
    const aiBooks = await window.BookDB.getAIRecommendations(branch, semester);
    const wishlistIds = await window.BookDB.getWishlistIds();

    DOM.aiRecommendationsGrid.innerHTML = aiBooks.map(b => createBookCardHTML(b, wishlistIds.includes(b.id))).join('');
  }

  function createBookCardHTML(b, isWishlisted = false) {
    let priceHTML = `<span class="card-price">₹${parseFloat(b.price || 0).toFixed(0)}</span>`;
    let actionBtnLabel = '🛒 Buy';

    if (b.mode === 'exchange') {
      priceHTML = `<span class="price-tag-exchange">🔄 EXCHANGE ONLY</span>`;
      actionBtnLabel = '🔄 Exchange';
    } else if (b.mode === 'donate') {
      priceHTML = `<span class="price-tag-free">🎁 FREE</span>`;
      actionBtnLabel = b.resourceType === 'lab_manual' ? '📥 Download' : '🎁 Claim';
    }

    if (b.status !== 'Available') actionBtnLabel = b.status;

    const resLabel = (b.resourceType || 'textbook').replace('_', ' ').toUpperCase();
    const catBadge = (b.category || 'physical') === 'digital' ? '📄 DIGITAL' : '📦 PHYSICAL';
    const condBadge = b.condition || 'Like New';
    const isAdmin = state.currentUser?.role === 'admin';
    const isMyUpload = state.currentUser?.email === b.seller?.email;

    return `
      <div class="book-card" data-id="${b.id}">
        <button class="btn-wishlist-heart ${isWishlisted ? 'active' : ''}" data-wishlist-id="${b.id}" title="Add to Wishlist">
          <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
        </button>

        <div class="card-cover" style="background: ${b.coverGradient || 'linear-gradient(135deg, #18181c 0%, #2a2a32 100%)'}; color: ${b.textColor || '#ffffff'};">
          <span class="badge-mode ${b.mode}">${b.mode.toUpperCase()}</span>
          <div style="font-size:0.68rem; opacity:0.9; font-weight:800; text-transform:uppercase; margin-bottom:0.3rem; letter-spacing:0.5px;">
            ${catBadge} • ${resLabel} • Sem ${b.semester}
          </div>
          <div style="font-size: 2.5rem; margin-bottom: 0.25rem;">${b.icon || '📋'}</div>
          <div style="font-size:0.75rem; font-weight:700; opacity:0.9;">⭐ ${condBadge}</div>
        </div>

        <div class="card-body">
          <div class="card-genre">${escapeHTML(b.branch || 'CE')} • ${escapeHTML(b.subject || b.genre)}</div>
          <h3 class="card-title">${escapeHTML(b.title)}</h3>
          <div class="card-author">by ${escapeHTML(b.author)} • ⭐ ${b.seller?.rating || 5.0}</div>
          
          <div class="card-footer">
            <div class="price-container">
              ${priceHTML}
              <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">RCTI Campus</span>
            </div>

            <div class="card-actions-row">
              <button class="card-btn btn-view-details" data-action-id="${b.id}" title="View Details">👁️ Details</button>
              <button class="card-btn btn-contact-seller-modal" data-seller-id="${b.id}" title="Contact Seller">👤 Contact</button>
              <button class="card-btn btn-qr-share" data-share-title="${escapeHTML(b.title)}" title="QR Code">📲</button>
              
              ${isMyUpload ? `
                <button class="card-btn btn-my-edit" data-edit-id="${b.id}" title="Edit Listing">✏️ Edit</button>
                <button class="card-btn btn-my-toggle-sold" data-toggle-sold-id="${b.id}" style="background:#10b981; color:#fff; border-color:#10b981;" title="Toggle Status">
                  ${b.status === 'Sold' ? 'Available' : 'Sold'}
                </button>
              ` : ''}

              ${b.resourceType === 'lab_manual' || b.category === 'digital' ? `
                <button class="card-btn btn-pdf-preview" data-pdf-title="${escapeHTML(b.title)}" style="background:var(--accent-blue); color:#fff; border-color:var(--accent-blue);" title="Preview/Download PDF">
                  📄 PDF
                </button>
              ` : ''}

              ${isAdmin ? `
                <button class="card-btn btn-admin-delete-book" data-delete-book-id="${b.id}" style="background:#f43f5e; color:#fff; border-color:#f43f5e;" title="Admin Delete">
                  🗑️
                </button>
              ` : ''}

              <button class="card-btn" data-action-id="${b.id}" ${b.status !== 'Available' ? 'disabled style="opacity:0.5;"' : ''}>
                ${actionBtnLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* 📚 MY UPLOADS & DASHBOARD TABS */
  async function renderDashboardTab(tabName) {
    state.currentDashTab = tabName;
    document.querySelectorAll('#profileSidebarNav li').forEach(t => t.classList.remove('active'));
    const activeTabEl = document.querySelector(`[data-dash-tab="${tabName}"]`);
    if (activeTabEl) activeTabEl.classList.add('active');

    if (tabName === 'listings') {
      const books = await window.BookAPI.getBooks({});
      const myListings = books.filter(b => b.seller?.email === (state.currentUser?.email || 'student@rcti.ac.in'));
      
      DOM.dashTabContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <div>
            <h3 style="font-family:var(--font-title); font-size:1.6rem; color:var(--text-white);">📚 My Uploaded Resources</h3>
            <p style="font-size:0.88rem; color:var(--text-muted);">Physical books & digital PDF lab manuals listed under your account.</p>
          </div>
          <button class="btn-pill" id="btnOpenUploadWizard" style="padding:0.7rem 1.5rem;">+ Upload Resource Wizard</button>
        </div>

        ${myListings.length === 0 ? `
          <div style="text-align:center; padding:3rem; background:var(--bg-dark); border-radius:var(--radius-md);">
            <div style="font-size:2.5rem; margin-bottom:1rem;">📚</div>
            <h4 style="font-family:var(--font-title); font-size:1.3rem; margin-bottom:0.5rem;">No Uploaded Resources Yet</h4>
            <p style="color:var(--text-muted); font-size:0.88rem; margin-bottom:1.25rem;">Click "+ Upload Resource Wizard" to publish a physical book or PDF lab manual!</p>
          </div>
        ` : `
          <div class="book-grid">${myListings.map(b => createBookCardHTML(b)).join('')}</div>
        `}
      `;

      document.getElementById('btnOpenUploadWizard').addEventListener('click', () => {
        setWizardStep(1);
        openModal(DOM.multiStepUploadModal);
      });
    } else if (tabName === 'wishlist') {
      const wishlistBooks = await window.BookDB.getWishlistBooks();
      DOM.dashTabContent.innerHTML = `
        <h3 style="font-family:var(--font-title); font-size:1.6rem; margin-bottom:1rem; color:var(--text-white);">❤️ My Wishlist</h3>
        ${wishlistBooks.length === 0 ? '<p style="color:var(--text-muted);">Your wishlist is empty. Click the heart ❤️ icon on any book card to save it here!</p>' : `<div class="book-grid">${wishlistBooks.map(b => createBookCardHTML(b, true)).join('')}</div>`}
      `;
    } else if (tabName === 'profile') {
      const user = state.currentUser || { name: 'Ved V. Patel', enrollment: '246400307192', email: 'ved.ce@rcti.ac.in', branch: 'CE', semester: 5, division: 'Div A', academicYear: '2025-2026', role: 'student', whatsapp: '+919876543210' };
      DOM.dashTabContent.innerHTML = `
        <div style="max-width:550px;">
          <h3 style="font-family:var(--font-title); font-size:1.6rem; margin-bottom:1rem; color:var(--text-white);">👤 RCTI Student & Faculty Profile</h3>
          <div style="font-size:0.95rem; color:var(--text-muted); line-height:2.2;">
            <div><strong>Full Name:</strong> ${escapeHTML(user.name)}</div>
            <div><strong>GTU Enrollment Number:</strong> ${escapeHTML(user.enrollment || '246400307192')}</div>
            <div><strong>Account Role:</strong> <span class="badge-mode ${user.role === 'admin' ? 'sell' : 'buy'}">${(user.role || 'student').toUpperCase()}</span></div>
            <div><strong>Email:</strong> ${escapeHTML(user.email)}</div>
            <div><strong>RCTI Department:</strong> ${escapeHTML(user.branch)}</div>
            <div><strong>GTU Semester:</strong> Sem ${user.semester} (${escapeHTML(user.division || 'Div A')})</div>
            <div><strong>Academic Year:</strong> ${escapeHTML(user.academicYear || '2025-2026')}</div>
            <div><strong>WhatsApp Helpline:</strong> ${escapeHTML(user.whatsapp || 'Not provided')}</div>
            <div><strong>Institute:</strong> R. C. Technical Institute, Ahmedabad (GTU)</div>
          </div>
        </div>
      `;
    } else {
      DOM.dashTabContent.innerHTML = `<h3 style="font-family:var(--font-title); font-size:1.5rem; margin-bottom:1rem; color:var(--text-white);">${tabName.toUpperCase()} View</h3><p style="color:var(--text-muted);">Active module record loaded.</p>`;
    }
  }

  function setupEventListeners() {
    let debounceTimer;
    DOM.searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.filters.query = e.target.value;
        renderCatalog();
      }, 250);
    });

    DOM.categorySelect.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      renderCatalog();
    });

    DOM.resourceTypeSelect.addEventListener('change', (e) => {
      state.filters.resourceType = e.target.value;
      renderCatalog();
    });

    DOM.conditionSelect.addEventListener('change', (e) => {
      state.filters.condition = e.target.value;
      renderCatalog();
    });

    DOM.semesterSelect.addEventListener('change', (e) => {
      state.filters.semester = e.target.value;
      renderCatalog();
    });

    DOM.branchSelect.addEventListener('change', (e) => {
      state.filters.branch = e.target.value;
      renderCatalog();
    });

    DOM.modeSelect.addEventListener('change', (e) => {
      state.filters.mode = e.target.value;
      renderCatalog();
    });

    // Contact Seller Delegation
    document.addEventListener('click', async (e) => {
      const contactBtn = e.target.closest('.btn-contact-seller-modal');
      if (contactBtn) {
        e.stopPropagation();
        const bookId = contactBtn.dataset.sellerId;
        const book = await window.BookAPI.getBookById(bookId);
        if (book) openSellerContactModal(book);
      }
    });

    DOM.closeSellerContactModal.addEventListener('click', () => closeModal(DOM.sellerContactModal));

    // WIZARD STEPS
    document.querySelectorAll('.wizard-choice-box').forEach(box => {
      box.addEventListener('click', (e) => {
        document.querySelectorAll('.wizard-choice-box').forEach(b => {
          b.style.borderColor = 'var(--border-pill)';
          b.classList.remove('active');
        });
        const target = e.currentTarget;
        target.style.borderColor = 'var(--text-white)';
        target.classList.add('active');
        state.wizard.category = target.dataset.choiceCategory;
      });
    });

    document.querySelectorAll('.wizard-choice-mode').forEach(box => {
      box.addEventListener('click', (e) => {
        document.querySelectorAll('.wizard-choice-mode').forEach(b => {
          b.style.borderColor = 'var(--border-pill)';
          b.classList.remove('active');
        });
        const target = e.currentTarget;
        target.style.borderColor = 'var(--text-white)';
        target.classList.add('active');
        state.wizard.mode = target.dataset.choiceMode;
      });
    });

    DOM.btnStep1Next.addEventListener('click', () => setWizardStep(2));
    DOM.btnStep2Back.addEventListener('click', () => setWizardStep(1));
    DOM.btnStep2Next.addEventListener('click', () => setWizardStep(3));
    DOM.btnStep3Back.addEventListener('click', () => setWizardStep(2));
    DOM.btnStep3Next.addEventListener('click', () => setWizardStep(4));
    DOM.btnStep4Back.addEventListener('click', () => setWizardStep(3));
    DOM.closeUploadWizardModal.addEventListener('click', () => closeModal(DOM.multiStepUploadModal));

    // WIZARD FORM SUBMIT
    DOM.wizardForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const mode = state.wizard.mode;
      const priceOrSwap = document.getElementById('wizPriceOrSwap').value;

      const bookData = {
        category: state.wizard.category,
        title: document.getElementById('wizTitle').value,
        subject: document.getElementById('wizSubject').value,
        gtuCode: document.getElementById('wizGtuCode').value,
        branch: document.getElementById('wizBranch').value,
        semester: document.getElementById('wizSemester').value,
        condition: document.getElementById('wizCondition').value,
        author: document.getElementById('wizAuthor').value,
        resourceType: DOM.wizardResTypeSelect.value,
        mode: mode,
        price: mode === 'sell' ? (parseFloat(priceOrSwap) || 150) : 0,
        exchangeFor: mode === 'exchange' ? priceOrSwap : '',
        description: document.getElementById('wizDescription').value || 'GTU resource listed on BookBridge.',
        sellerName: state.currentUser?.name || 'RCTI Student',
        sellerEmail: state.currentUser?.email || 'student@rcti.ac.in'
      };

      await window.BookAPI.addBook(bookData);
      closeModal(DOM.multiStepUploadModal);
      DOM.wizardForm.reset();
      showToast('✅ Upload Successful! Resource published to My Uploads & Marketplace.', 'success');
      await renderCatalog();
      await renderDepartmentHub();
      await renderDashboardTab('listings');
    });

    // EDIT LISTING DELEGATION
    document.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.btn-my-edit');
      if (editBtn) {
        e.stopPropagation();
        const bookId = editBtn.dataset.editId;
        const book = await window.BookAPI.getBookById(bookId);
        if (book) {
          document.getElementById('editBookId').value = book.id;
          document.getElementById('editTitle').value = book.title;
          document.getElementById('editCondition').value = book.condition || 'Good';
          document.getElementById('editPrice').value = book.price || 0;
          document.getElementById('editDescription').value = book.description || '';
          openModal(DOM.editResourceModal);
        }
      }
    });

    DOM.closeEditResourceModal.addEventListener('click', () => closeModal(DOM.editResourceModal));

    DOM.editResourceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bookId = document.getElementById('editBookId').value;
      const updatedFields = {
        title: document.getElementById('editTitle').value,
        condition: document.getElementById('editCondition').value,
        price: parseFloat(document.getElementById('editPrice').value) || 0,
        description: document.getElementById('editDescription').value
      };

      await window.BookDB.updateBook(bookId, updatedFields);
      closeModal(DOM.editResourceModal);
      showToast('✨ Resource updated! Changes synced to public marketplace.', 'success');
      await renderCatalog();
      await renderDepartmentHub();
      await renderDashboardTab('listings');
    });

    // MARK SOLD / AVAILABLE DELEGATION
    document.addEventListener('click', async (e) => {
      const toggleBtn = e.target.closest('.btn-my-toggle-sold');
      if (toggleBtn) {
        e.stopPropagation();
        const bookId = toggleBtn.dataset.toggleSoldId;
        const book = await window.BookAPI.getBookById(bookId);
        if (book) {
          const newStatus = book.status === 'Sold' ? 'Available' : 'Sold';
          await window.BookDB.updateBookStatus(bookId, newStatus);
          showToast(`Status updated to ${newStatus}!`, 'info');
          await renderCatalog();
          await renderDepartmentHub();
          await renderDashboardTab('listings');
        }
      }
    });

    // Department Hub Listeners
    DOM.hubBranchSelect.addEventListener('change', renderDepartmentHub);
    DOM.hubSemesterSelect.addEventListener('change', renderDepartmentHub);

    DOM.navDeptHub.addEventListener('click', () => DOM.departmentHub.scrollIntoView({ behavior: 'smooth' }));
    DOM.navCommunity.addEventListener('click', () => document.getElementById('collegeCommunity').scrollIntoView({ behavior: 'smooth' }));

    // QR Share Click Delegation
    document.addEventListener('click', (e) => {
      const qrBtn = e.target.closest('.btn-qr-share');
      if (qrBtn) {
        e.stopPropagation();
        openQrModal(qrBtn.dataset.shareTitle);
      }
    });

    // PDF Preview Click Delegation
    document.addEventListener('click', (e) => {
      const pdfBtn = e.target.closest('.btn-pdf-preview');
      if (pdfBtn) {
        e.stopPropagation();
        openPdfModal(pdfBtn.dataset.pdfTitle, '');
      }
    });

    DOM.closePdfModal.addEventListener('click', () => closeModal(DOM.pdfModal));
    DOM.closeQrModal.addEventListener('click', () => closeModal(DOM.qrModal));

    // Admin Delete Book
    document.addEventListener('click', async (e) => {
      const delBtn = e.target.closest('.btn-admin-delete-book');
      if (delBtn) {
        e.stopPropagation();
        const bookId = delBtn.dataset.deleteBookId;
        if (confirm('Admin: Delete this book listing?')) {
          await window.BookAPI.deleteBook(bookId);
          showToast('Book listing deleted by Admin', 'info');
          await renderCatalog();
          await renderDepartmentHub();
          await render3DHeroTrack();
          if (state.currentUser?.role === 'admin') await renderAdminPanel();
        }
      }
    });

    // Wishlist Click Delegation
    document.addEventListener('click', async (e) => {
      const heartBtn = e.target.closest('.btn-wishlist-heart');
      if (heartBtn) {
        e.stopPropagation();
        const bookId = heartBtn.dataset.wishlistId;
        const added = await window.BookDB.toggleWishlist(bookId);
        showToast(added ? 'Added to Wishlist ❤️' : 'Removed from Wishlist', 'info');
        await renderCatalog();
        await renderDepartmentHub();
        await renderAIRecommendations();
        if (state.currentDashTab === 'wishlist') await renderDashboardTab('wishlist');
      }
    });

    // Sidebar Nav Delegation
    document.querySelectorAll('#profileSidebarNav li').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.dashTab;
        if (tabName) renderDashboardTab(tabName);
      });
    });

    document.getElementById('sidebarLogout').addEventListener('click', async () => {
      if (confirm('Sign out of BookBridge?')) {
        await window.BookAPI.logout();
        await updateAuthUI();
        showToast('Signed out of BookBridge', 'info');
      }
    });

    DOM.navInfo.addEventListener('click', () => openModal(DOM.projectInfoModal));
    DOM.closeProjectInfoModal.addEventListener('click', () => closeModal(DOM.projectInfoModal));

    DOM.navAdmin.addEventListener('click', () => DOM.adminPanel.scrollIntoView({ behavior: 'smooth' }));

    // Live Chat Form Submit
    DOM.chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = DOM.chatInput.value.trim();
      if (!text || !state.chatTargetEmail) return;

      await window.BookAPI.sendMessage(state.chatTargetEmail, text, state.chatBookTitle);
      DOM.chatInput.value = '';
      await renderChatMessages();
    });

    DOM.closeChatModal.addEventListener('click', () => closeModal(DOM.chatModal));

    // Review Form Submit
    DOM.reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = DOM.reviewSellerEmail.value;
      const rating = DOM.reviewRating.value;
      const comment = DOM.reviewComment.value;

      await window.BookAPI.addReview(email, rating, comment);
      closeModal(DOM.reviewModal);
      DOM.reviewForm.reset();
      showToast(`⭐ ${rating}-Star review submitted for seller!`, 'success');
      await renderCatalog();
    });

    DOM.closeReviewModal.addEventListener('click', () => closeModal(DOM.reviewModal));

    // CTAs
    document.getElementById('ctaBrowseBtn').addEventListener('click', () => document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' }));
    document.getElementById('ctaSellBtn').addEventListener('click', () => {
      setWizardStep(1);
      openModal(DOM.multiStepUploadModal);
    });
    document.getElementById('ctaExchangeBtn').addEventListener('click', () => {
      state.filters.mode = 'exchange';
      DOM.modeSelect.value = 'exchange';
      document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' });
      renderCatalog();
    });

    DOM.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to RCTI helpline.', 'success');
      DOM.contactForm.reset();
    });

    // Genre Pills Bar
    DOM.genrePillsBar.addEventListener('click', (e) => {
      const pill = e.target.closest('.genre-pill');
      if (!pill) return;

      document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filters.genre = pill.dataset.genre;
      renderCatalog();
    });

    DOM.bookGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.book-card');
      if (card && !e.target.closest('button') && !e.target.closest('a')) openActionModal(card.dataset.id);
    });

    // Auth
    DOM.userAuthBtn.addEventListener('click', async () => {
      if (state.currentUser) {
        if (confirm(`Signed in as ${state.currentUser.name} (${state.currentUser.email}). Sign out?`)) {
          await window.BookAPI.logout();
          await updateAuthUI();
          showToast('Signed out of BookBridge', 'info');
        }
      } else {
        openModal(DOM.authModal);
      }
    });

    DOM.closeAuthModal.addEventListener('click', () => closeModal(DOM.authModal));

    DOM.tabLogin.addEventListener('click', () => {
      DOM.tabLogin.style.color = 'var(--text-white)';
      DOM.tabRegister.style.color = 'var(--text-muted)';
      DOM.loginForm.style.display = 'block';
      DOM.registerForm.style.display = 'none';
    });

    DOM.tabRegister.addEventListener('click', () => {
      DOM.tabRegister.style.color = 'var(--text-white)';
      DOM.tabLogin.style.color = 'var(--text-muted)';
      DOM.registerForm.style.display = 'block';
      DOM.loginForm.style.display = 'none';
    });

    DOM.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const pass = document.getElementById('loginPassword').value;

      const user = await window.BookAPI.login(email, pass);
      closeModal(DOM.authModal);
      DOM.loginForm.reset();
      await updateAuthUI();
      await renderAIRecommendations();
      showToast(`Welcome back, ${user.name}!`, 'success');
    });

    DOM.registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userData = {
        name: document.getElementById('regName').value,
        enrollment: document.getElementById('regEnrollment').value,
        email: document.getElementById('regEmail').value,
        role: document.getElementById('regRole').value,
        branch: document.getElementById('regBranch').value,
        semester: document.getElementById('regSemester').value,
        division: document.getElementById('regDivision').value,
        academicYear: document.getElementById('regAcademicYear').value,
        whatsapp: document.getElementById('regWhatsapp').value
      };

      const user = await window.BookAPI.register(userData);
      closeModal(DOM.authModal);
      DOM.registerForm.reset();
      await updateAuthUI();
      await renderAIRecommendations();
      showToast(`RCTI Account registered for ${user.name} (${user.enrollment})!`, 'success');
    });

    DOM.listBookModalBtn.addEventListener('click', () => {
      if (!state.currentUser) {
        showToast('Please sign in with your RCTI account to upload resources', 'info');
        openModal(DOM.authModal);
      } else {
        setWizardStep(1);
        openModal(DOM.multiStepUploadModal);
      }
    });

    DOM.closeActionModal.addEventListener('click', () => closeModal(DOM.actionModal));
    DOM.actionForm.addEventListener('submit', handleActionSubmit);
  }

  async function openActionModal(bookId) {
    const book = await window.BookAPI.getBookById(bookId);
    if (!book) return;

    state.selectedBook = book;
    DOM.actionBookId.value = book.id;

    const cleanWhatsapp = (book.seller?.whatsapp || '').replace(/[^0-9+]/g, '');

    DOM.btnLiveChatDirect.onclick = () => {
      closeModal(DOM.actionModal);
      openChatModal(book.seller?.email || 'seller@rcti.ac.in', book.title);
    };

    if (cleanWhatsapp) {
      DOM.btnWhatsappDirect.style.display = 'inline-flex';
      DOM.btnWhatsappDirect.onclick = () => {
        window.open(`https://wa.me/${cleanWhatsapp}?text=Hi!%20I'm%20an%20RCTI%20student%20interested%20in%20your%20GTU%20resource%20${encodeURIComponent(book.title)}%20on%20BookBridge.`, '_blank');
      };
    } else {
      DOM.btnWhatsappDirect.style.display = 'none';
    }

    if (book.mode === 'exchange') {
      DOM.actionTitle.textContent = '🔄 Propose GTU Resource Swap';
      DOM.actionSubtitle.textContent = `Swap offer for "${book.title}" (${book.branch} GTU Sem ${book.semester})`;
      DOM.actionDetailsLabel.textContent = 'Which GTU resource do you want to offer in exchange?';
      DOM.actionSubmitBtn.textContent = 'Propose Swap';
    } else if (book.mode === 'donate') {
      DOM.actionTitle.textContent = book.resourceType === 'lab_manual' ? '📋 Download / Claim Lab Manual' : '🎁 Claim Free Resource';
      DOM.actionSubtitle.textContent = `Claiming free resource "${book.title}"`;
      DOM.actionDetailsLabel.textContent = 'RCTI pickup location / Note to uploader';
      DOM.actionSubmitBtn.textContent = 'Confirm Claim & Download';
    } else {
      DOM.actionTitle.textContent = '🛒 Purchase GTU Resource';
      DOM.actionSubtitle.textContent = `Buying "${book.title}" for ₹${parseFloat(book.price || 0).toFixed(0)}`;
      DOM.actionDetailsLabel.textContent = 'RCTI Campus Meeting Location';
      DOM.actionSubmitBtn.textContent = 'Confirm Purchase';
    }

    openModal(DOM.actionModal);
  }

  async function handleActionSubmit(e) {
    e.preventDefault();
    if (!state.selectedBook) return;

    const book = state.selectedBook;
    const name = document.getElementById('actionName').value;
    const note = document.getElementById('actionNote').value;

    if (book.mode === 'exchange') {
      await window.BookAPI.proposeExchange({
        targetBookId: book.id,
        targetBookTitle: book.title,
        offeredBookTitle: note || 'Offered GTU Resource',
        proposerName: name
      });
      showToast(`🔄 Swap proposal sent to ${book.seller?.name || 'owner'}!`, 'success');
    } else if (book.mode === 'donate') {
      await window.BookAPI.claimDonation(book.id, { name, address: note });
      showToast(`🎁 Claimed "${book.title}"!`, 'success');
    } else {
      await window.BookAPI.buyBook(book.id, { name, address: note });
      showToast(`🛍️ Purchased "${book.title}"!`, 'success');
    }

    closeModal(DOM.actionModal);
    DOM.actionForm.reset();

    DOM.reviewSellerEmail.value = book.seller?.email || 'seller@rcti.ac.in';
    DOM.reviewSubtitle.textContent = `Rate seller ${book.seller?.name || 'Student'} for "${book.title}"`;
    openModal(DOM.reviewModal);

    await render3DHeroTrack();
    await renderCatalog();
    await renderDepartmentHub();
  }

  function openModal(el) { el.classList.add('active'); }
  function closeModal(el) { el.classList.remove('active'); }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = 'background:var(--bg-card); border:1px solid var(--text-white); padding:0.8rem 1.4rem; border-radius:var(--radius-full); box-shadow:0 10px 30px rgba(0,0,0,0.5); font-size:0.88rem; color:var(--text-white);';
    toast.textContent = msg;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  initApp();
});
