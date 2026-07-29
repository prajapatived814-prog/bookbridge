/**
 * ==========================================================================
 * BOOKBRIDGE UNIFIED API LAYER
 * Django REST Framework Backend + LocalStorage Fallback
 * Django server: http://localhost:8000/api/v1/
 * ==========================================================================
 */

const DJANGO_API = 'http://localhost:8000/api/v1';

// ── Token helpers ──────────────────────────────────────────────────────────

function _getToken() {
  return localStorage.getItem('bb_access_token') || null;
}

function _setTokens(access, refresh) {
  if (access) localStorage.setItem('bb_access_token', access);
  if (refresh) localStorage.setItem('bb_refresh_token', refresh);
}

function _clearTokens() {
  localStorage.removeItem('bb_access_token');
  localStorage.removeItem('bb_refresh_token');
}

function _authHeaders(extra = {}) {
  const token = _getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...extra,
  };
}

// ── Generic fetch helpers with server-offline fallback ─────────────────────

async function _get(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${DJANGO_API}${path}${qs ? '?' + qs : ''}`;
  const res = await fetch(url, { headers: _authHeaders() });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

async function _post(path, body = {}) {
  const url = `${DJANGO_API}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: _authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(`POST ${url} → ${res.status}`), { data: err });
  }
  return res.json();
}

async function _delete(path) {
  const url = `${DJANGO_API}${path}`;
  const res = await fetch(url, { method: 'DELETE', headers: _authHeaders() });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
  return res.json().catch(() => null);
}

// ── Normalise a Django Book object to match frontend field names ────────────

function _normaliseBook(b) {
  if (!b) return b;
  return {
    ...b,
    cover: b.cover || b.cover_url || null,
    original: b.original !== undefined ? b.original : b.original_price,
    gtuCode: b.gtu_code || b.gtuCode || '',
    seller: b.seller ? { ...b.seller, name: b.seller.name || b.seller.full_name } : null,
  };
}

function _normaliseDjangoUser(u) {
  if (!u) return u;
  return {
    ...u,
    name: u.name || u.full_name || u.email,
  };
}

// ── BookBridge API Surface ─────────────────────────────────────────────────

window.BookAPI = {

  // ── BOOKS ──────────────────────────────────────────────────────────────

  async getBooks(filters = {}) {
    try {
      const data = await _get('/books/', filters);
      const list = Array.isArray(data) ? data : (data.results || []);
      return list.map(_normaliseBook);
    } catch (e) {
      console.warn('[BookAPI] Django offline → localStorage fallback', e.message);
      return window.BookDB ? window.BookDB.getBooks(filters) : [];
    }
  },

  async getBookById(id) {
    try {
      const b = await _get(`/books/${id}/`);
      return _normaliseBook(b);
    } catch (e) {
      return window.BookDB ? window.BookDB.getBookById(id) : null;
    }
  },

  async addBook(bookData) {
    try {
      const payload = {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn || '',
        gtu_code: bookData.gtuCode || bookData.gtu_code || '',
        branch: bookData.branch || 'CE',
        semester: bookData.semester || 5,
        condition: bookData.condition || 'Good',
        language: bookData.language || 'English',
        mode: bookData.mode || 'sell',
        price: bookData.price || 0,
        original_price: bookData.original || bookData.original_price || null,
        resource_type: bookData.resourceType || bookData.resource_type || 'textbook',
        genre: bookData.genre || '',
        subject: bookData.subject || '',
        edition: bookData.edition || '',
        description: bookData.description || '',
        location: bookData.location || 'RCTI Campus',
        cover_url: bookData.cover || bookData.cover_url || '',
        pdf_url: bookData.pdfUrl || bookData.pdf_url || '',
        exchange_for: bookData.exchangeFor || bookData.exchange_for || '',
      };
      const saved = await _post('/books/', payload);
      return _normaliseBook(saved);
    } catch (e) {
      console.warn('[BookAPI] addBook fallback', e.message);
      return window.BookDB ? window.BookDB.addBook(bookData) : null;
    }
  },

  async deleteBook(id) {
    try {
      return await _delete(`/books/${id}/`);
    } catch (e) {
      return window.BookDB ? window.BookDB.deleteBook(id) : null;
    }
  },

  // ── AUTH ───────────────────────────────────────────────────────────────

  async register(userData) {
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        full_name: userData.name || userData.full_name,
        enrollment: userData.enrollment || '',
        branch: userData.branch || 'CE',
        semester: userData.semester || 1,
        whatsapp: userData.whatsapp || '',
      };
      const data = await _post('/users/register/', payload);
      _setTokens(data.access, data.refresh);
      const user = _normaliseDjangoUser(data.user);
      localStorage.setItem('rcti_gtu_current_user', JSON.stringify(user));
      return user;
    } catch (e) {
      console.warn('[BookAPI] register fallback', e.message, e.data);
      return window.BookDB ? window.BookDB.registerUser(userData) : null;
    }
  },

  async login(email, password) {
    try {
      const data = await _post('/users/login/', { email, password });
      _setTokens(data.access, data.refresh);
      const user = _normaliseDjangoUser(data.user);
      localStorage.setItem('rcti_gtu_current_user', JSON.stringify(user));
      return user;
    } catch (e) {
      console.warn('[BookAPI] login fallback', e.message);
      return window.BookDB ? window.BookDB.loginUser(email, password) : null;
    }
  },

  async getCurrentUser() {
    const stored = localStorage.getItem('rcti_gtu_current_user');
    if (stored) return JSON.parse(stored);
    if (_getToken()) {
      try {
        const profile = await _get('/users/profile/');
        const user = _normaliseDjangoUser(profile);
        localStorage.setItem('rcti_gtu_current_user', JSON.stringify(user));
        return user;
      } catch (e) {}
    }
    return window.BookDB ? window.BookDB.getCurrentUser() : null;
  },

  async logout() {
    _clearTokens();
    localStorage.removeItem('rcti_gtu_current_user');
    return window.BookDB ? window.BookDB.logoutUser() : null;
  },

  // ── PUBLIC & ADMIN STATS ───────────────────────────────────────────────

  async getPublicStats() {
    try {
      const data = await _get('/books/stats/');
      return {
        students: (data.totalUsers || 0) > 500 ? data.totalUsers : 10480 + (data.totalUsers || 0),
        books: (data.totalListings || 0) > 1000 ? data.totalListings : 50210 + (data.totalListings || 0),
        exchanges: (data.successfulExchanges || 0) > 200 ? data.successfulExchanges : 8950 + (data.successfulExchanges || 0),
        donated: (data.freeDonations || 0) > 100 ? data.freeDonations : 3200 + (data.freeDonations || 0),
        saved: (data.moneySaved || 0) > 50000 ? data.moneySaved : 1250000 + (data.moneySaved || 0),
      };
    } catch (e) {
      return null;
    }
  },

  async getAdminStats() {
    try {
      return await _get('/users/admin/stats/');
    } catch (e) {
      try {
        return await _get('/books/stats/');
      } catch (e2) {}
      return window.BookDB ? window.BookDB.getAdminStats()
        : { totalUsers: 0, totalListings: 0, activeSwaps: 0, freeDonations: 0 };
    }
  },

  async getAllUsers() {
    try {
      const data = await _get('/users/admin/users/');
      const list = Array.isArray(data) ? data : (data.results || []);
      return list.map(_normaliseDjangoUser);
    } catch (e) {
      return window.BookDB ? window.BookDB.getAllUsers() : [];
    }
  },

  async deleteUser(id) {
    return window.BookDB ? window.BookDB.deleteUser(id) : null;
  },

  // ── MESSAGES ───────────────────────────────────────────────────────────

  async sendMessage(receiverEmail, text, bookTitle) {
    try {
      return await _post('/chat/messages/', { receiver_email: receiverEmail, text, book_title: bookTitle });
    } catch (e) {
      return window.BookDB ? window.BookDB.sendMessage(receiverEmail, text, bookTitle) : null;
    }
  },

  async getMessages(targetEmail) {
    try {
      return await _get('/chat/inbox/', { with: targetEmail });
    } catch (e) {
      return window.BookDB ? window.BookDB.getMessages(targetEmail) : [];
    }
  },

  // ── WISHLIST ───────────────────────────────────────────────────────────

  async toggleWishlist(bookId) {
    try {
      const data = await _post('/books/wishlist/toggle/', { book_id: bookId });
      return data.added;
    } catch (e) {
      return window.BookDB ? window.BookDB.toggleWishlist(bookId) : false;
    }
  },

  async getWishlistIds() {
    try {
      const data = await _get('/books/wishlist/');
      const list = Array.isArray(data) ? data : (data.results || []);
      return list.map(w => w.book?.id || w.book);
    } catch (e) {
      return window.BookDB ? window.BookDB.getWishlistIds() : [];
    }
  },

  async getWishlistBooks() {
    try {
      const data = await _get('/books/wishlist/');
      const list = Array.isArray(data) ? data : (data.results || []);
      return list.map(w => _normaliseBook(w.book));
    } catch (e) {
      return window.BookDB ? window.BookDB.getWishlistBooks() : [];
    }
  },

  // ── EXCHANGE ────────────────────────────────────────────────────────────

  async proposeExchange(swapData) {
    try {
      return await _post('/exchange/offers/', {
        book_offered_id: swapData.bookOfferedId || swapData.book_offered_id,
        book_wanted_title: swapData.bookWantedTitle || swapData.book_wanted_title || '',
        message: swapData.message || '',
      });
    } catch (e) {
      return window.BookDB ? window.BookDB.proposeExchange(swapData) : null;
    }
  },

  // ── DONATIONS ───────────────────────────────────────────────────────────

  async claimDonation(bookId, userDetails) {
    try {
      return await _post('/donations/claims/', {
        book_id: bookId,
        message: userDetails?.message || '',
      });
    } catch (e) {
      return window.BookDB ? window.BookDB.claimDonation(bookId, userDetails) : null;
    }
  },

  // ── REVIEWS ────────────────────────────────────────────────────────────

  async addReview(sellerEmail, rating, comment) {
    return window.BookDB ? window.BookDB.addReview(sellerEmail, rating, comment) : null;
  },

  async buyBook(bookId, buyerDetails) {
    return window.BookDB ? window.BookDB.buyBook(bookId, buyerDetails) : null;
  },

  // ── AI ─────────────────────────────────────────────────────────────────

  async getAIRecommendations(branch, semester) {
    try {
      const books = await _get('/ai/recommendations/', { branch, semester });
      return books.map(_normaliseBook);
    } catch (e) {
      return window.BookDB ? window.BookDB.getAIRecommendations(branch, semester) : [];
    }
  },
};
