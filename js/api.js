/**
 * ==========================================================================
 * BOOKBRIDGE UNIFIED API LAYER (REST Server API + Local Database Fallback)
 * ==========================================================================
 */

const API_BASE = '/api';

window.BookAPI = {
  async getBooks(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/books?${queryParams}`);
      if (res.ok) {
        const books = await res.json();
        if (Array.isArray(books) && books.length > 0) return books;
      }
    } catch (e) {
      console.log('[BookAPI] Remote server offline. Falling back to client database engine.');
    }
    return window.BookDB ? window.BookDB.getBooks(filters) : [];
  },

  async getBookById(id) {
    try {
      const res = await fetch(`${API_BASE}/books/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.BookDB ? window.BookDB.getBookById(id) : null;
  },

  async addBook(bookData) {
    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.BookDB ? window.BookDB.addBook(bookData) : null;
  },

  async register(userData) {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem('rcti_gtu_current_user', JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (e) {}
    return window.BookDB ? window.BookDB.registerUser(userData) : null;
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const user = data.user || data;
        localStorage.setItem('rcti_gtu_current_user', JSON.stringify(user));
        return user;
      }
    } catch (e) {}
    return window.BookDB ? window.BookDB.loginUser(email, password) : null;
  },

  async getCurrentUser() {
    return window.BookDB ? window.BookDB.getCurrentUser() : null;
  },

  async logout() {
    return window.BookDB ? window.BookDB.logoutUser() : null;
  },

  async getAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.BookDB ? window.BookDB.getAdminStats() : { totalUsers: 2, totalListings: 2, activeSwaps: 0, freeDonations: 0 };
  },

  async getAllUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.BookDB ? window.BookDB.getAllUsers() : [];
  },

  async deleteUser(id) {
    return window.BookDB ? window.BookDB.deleteUser(id) : null;
  },

  async deleteBook(id) {
    try {
      const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.BookDB ? window.BookDB.deleteBook(id) : null;
  },

  async sendMessage(receiverEmail, text, bookTitle) {
    try {
      const currentUser = await this.getCurrentUser();
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: currentUser?.email || 'student@rcti.ac.in',
          senderName: currentUser?.name || 'RCTI Student',
          receiverEmail,
          text,
          bookTitle
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.BookDB ? window.BookDB.sendMessage(receiverEmail, text, bookTitle) : null;
  },

  async getMessages(targetEmail) {
    try {
      const res = await fetch(`${API_BASE}/messages`);
      if (res.ok) {
        const msgs = await res.json();
        const currentUser = await this.getCurrentUser();
        const myEmail = currentUser?.email || 'student@rcti.ac.in';
        return msgs.filter(m => 
          (m.senderEmail === myEmail && m.receiverEmail === targetEmail) ||
          (m.senderEmail === targetEmail && m.receiverEmail === myEmail)
        );
      }
    } catch (e) {}
    return window.BookDB ? window.BookDB.getMessages(targetEmail) : [];
  },

  async addReview(sellerEmail, rating, comment) {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerEmail, rating: parseInt(rating), comment })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return window.BookDB ? window.BookDB.addReview(sellerEmail, rating, comment) : null;
  },

  async proposeExchange(swapData) {
    return window.BookDB ? window.BookDB.proposeExchange(swapData) : null;
  },

  async claimDonation(bookId, userDetails) {
    return window.BookDB ? window.BookDB.claimDonation(bookId, userDetails) : null;
  },

  async buyBook(bookId, buyerDetails) {
    return window.BookDB ? window.BookDB.buyBook(bookId, buyerDetails) : null;
  },

  async toggleWishlist(bookId) {
    return window.BookDB ? window.BookDB.toggleWishlist(bookId) : false;
  },

  async getWishlistIds() {
    return window.BookDB ? window.BookDB.getWishlistIds() : [];
  },

  async getWishlistBooks() {
    return window.BookDB ? window.BookDB.getWishlistBooks() : [];
  },

  async getAIRecommendations(branch, semester) {
    return window.BookDB ? window.BookDB.getAIRecommendations(branch, semester) : [];
  }
};
